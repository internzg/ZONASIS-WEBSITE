import { createServerFn } from "@tanstack/react-start";

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [dests, pkgs, tests, content] = await Promise.all([
    supabaseAdmin.from("destinations").select("*").order("sort_order"),
    supabaseAdmin
      .from("packages")
      .select("id, slug, title, summary, duration_days, duration_nights, price, cover_image_url, destination:destinations(name)")
      .eq("status", "published").eq("is_featured", true).order("created_at", { ascending: false }).limit(6),
    supabaseAdmin.from("testimonials").select("*").eq("is_published", true).order("sort_order"),
    supabaseAdmin.from("site_content").select("*"),
  ]);
  const contentMap: Record<string, any> = {};
  (content.data ?? []).forEach((r: any) => { contentMap[r.key] = r.value; });
  return {
    destinations: dests.data ?? [],
    featured: pkgs.data ?? [],
    testimonials: tests.data ?? [],
    content: contentMap,
  };
});

export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("site_content").select("*");
  const map: Record<string, any> = {};
  (data ?? []).forEach((r: any) => { map[r.key] = r.value; });
  return { content: map };
});

export const getSiteFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("site_faqs").select("*").order("sort_order");
  return { faqs: data ?? [] };
});
