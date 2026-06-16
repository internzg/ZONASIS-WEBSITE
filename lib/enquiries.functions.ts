import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SubmitSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(40),
  travel_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  travelers: z.number().int().min(1).max(50).default(1),
  message: z.string().max(2000).optional().default(""),
  package_slug: z.string().max(200).optional().default(""),
  user_id: z.string().uuid().optional(),
});

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SubmitSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let package_id: string | null = null;
    if (data.package_slug) {
      const { data: pkg } = await supabaseAdmin
        .from("packages").select("id").eq("slug", data.package_slug).maybeSingle();
      package_id = (pkg as any)?.id ?? null;
    }
    const { error } = await supabaseAdmin.from("enquiries").insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      travel_date: data.travel_date || null,
      travelers: data.travelers,
      message: data.message,
      package_id,
      user_id: data.user_id ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("enquiries")
      .select("id, full_name, email, phone, travel_date, travelers, message, status, created_at, package:packages(slug,title)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { enquiries: data ?? [] };
  });

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const adminListEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("enquiries")
      .select("*, package:packages(slug,title)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { enquiries: data ?? [] };
  });

export const adminUpdateEnquiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      id: z.string().uuid(),
      status: z.enum(["new", "contacted", "quotation_sent", "interested", "closed", "rejected"]).optional(),
      internal_notes: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("enquiries").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
