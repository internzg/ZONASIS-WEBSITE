import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles").select("*").eq("id", context.userId).maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data, userId: context.userId, email: (context.claims as any)?.email ?? null };
  });

const UpdateSchema = z.object({
  full_name: z.string().trim().max(120).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  avatar_url: z.string().trim().max(1000).optional().default(""),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => UpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      full_name: data.full_name || null,
      phone: data.phone || null,
      avatar_url: data.avatar_url || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSavedPackages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_packages")
      .select("package:packages(id, slug, title, summary, duration_days, duration_nights, price, cover_image_url)")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { packages: (data ?? []).map((r: any) => r.package).filter(Boolean) };
  });

export const toggleSavedPackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ package_id: z.string().uuid(), save: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.save) {
      await context.supabase.from("saved_packages").upsert({ user_id: context.userId, package_id: data.package_id });
    } else {
      await context.supabase.from("saved_packages").delete().eq("user_id", context.userId).eq("package_id", data.package_id);
    }
    return { ok: true };
  });
