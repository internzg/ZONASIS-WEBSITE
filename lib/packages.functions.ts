import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ListSchema = z.object({
  search: z.string().optional().default(""),
  destination: z.string().optional().default(""),
  category: z.string().optional().default(""),
  durationMax: z.number().int().min(0).max(60).optional(),
  priceMax: z.number().int().min(0).max(10_000_000).optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "newest"]).optional().default("featured"),
});

export const listPackages = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => ListSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("packages")
      .select("id, slug, title, summary, duration_days, duration_nights, price, currency, cover_image_url, highlights, is_featured, created_at, destination:destinations(slug,name), category:categories(slug,name)")
      .eq("status", "published");

    if (data.search) q = q.ilike("title", `%${data.search}%`);
    if (data.destination) q = q.eq("destination.slug" as any, data.destination);
    if (data.category) q = q.eq("category.slug" as any, data.category);
    if (data.durationMax) q = q.lte("duration_days", data.durationMax);
    if (data.priceMax) q = q.lte("price", data.priceMax);

    switch (data.sort) {
      case "price-asc": q = q.order("price", { ascending: true }); break;
      case "price-desc": q = q.order("price", { ascending: false }); break;
      case "newest": q = q.order("created_at", { ascending: false }); break;
      default: q = q.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    // Apply destination/category client-side filter post-fetch because nested filter syntax differs:
    let result = rows ?? [];
    if (data.destination) result = result.filter((r: any) => r.destination?.slug === data.destination);
    if (data.category) result = result.filter((r: any) => r.category?.slug === data.category);
    return { packages: result };
  });

export const getPackageBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: pkg, error } = await supabaseAdmin
      .from("packages")
      .select("*, destination:destinations(slug,name,description,image_url), category:categories(slug,name), itinerary:package_itinerary(day_number,title,description), faqs:package_faqs(question,answer,sort_order), images:package_images(url,sort_order)")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!pkg) return { package: null };
    const itinerary = [...((pkg as any).itinerary ?? [])].sort((a: any, b: any) => a.day_number - b.day_number);
    const faqs = [...((pkg as any).faqs ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
    const images = [...((pkg as any).images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
    return { package: { ...(pkg as any), itinerary, faqs, images } };
  });

export const getDestinations = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("destinations").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return { destinations: data ?? [] };
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("categories").select("*").order("name");
  if (error) throw new Error(error.message);
  return { categories: data ?? [] };
});

export const getDestinationBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: dest, error } = await supabaseAdmin
      .from("destinations").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!dest) return { destination: null, packages: [] };
    const { data: pkgs, error: e2 } = await supabaseAdmin
      .from("packages")
      .select("id, slug, title, summary, duration_days, duration_nights, price, cover_image_url, is_featured")
      .eq("status", "published")
      .eq("destination_id", (dest as any).id);
    if (e2) throw new Error(e2.message);
    return { destination: dest, packages: pkgs ?? [] };
  });

// ---------- admin ----------
async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

const UpsertSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional().default(""),
  description: z.string().max(5000).optional().default(""),
  duration_days: z.number().int().min(1).max(60),
  duration_nights: z.number().int().min(0).max(60),
  price: z.number().min(0).max(10_000_000),
  currency: z.string().max(8).optional().default("INR"),
  destination_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  cover_image_url: z.string().max(1000).optional().default(""),
  highlights: z.array(z.string().max(200)).max(20).optional().default([]),
  inclusions: z.array(z.string().max(200)).max(40).optional().default([]),
  exclusions: z.array(z.string().max(200)).max(40).optional().default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  is_featured: z.boolean().optional().default(false),
});

export const adminListPackages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("packages")
      .select("id, slug, title, price, status, is_featured, duration_days, destination:destinations(name), category:categories(name), created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { packages: data ?? [] };
  });

export const adminUpsertPackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data, destination_id: data.destination_id || null, category_id: data.category_id || null };
    if (data.id) {
      const { error } = await supabaseAdmin.from("packages").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    } else {
      const { data: row, error } = await supabaseAdmin.from("packages").insert(payload).select("id").single();
      if (error) throw new Error(error.message);
      return { id: (row as any).id };
    }
  });

export const adminDeletePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("packages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
