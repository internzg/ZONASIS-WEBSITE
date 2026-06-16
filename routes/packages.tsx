import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";

import { listPackages, getDestinations, getCategories } from "@/lib/packages.functions";
import { SiteShell } from "@/components/layout/SiteShell";
import { PackageCard } from "@/components/site/PackageCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  destination: fallback(z.string(), "").default(""),
  category: fallback(z.string(), "").default(""),
  sort: fallback(z.enum(["featured", "price-asc", "price-desc", "newest"]), "featured").default("featured"),
  duration: fallback(z.number().int().min(0).max(60), 0).default(0),
  priceMax: fallback(z.number().int().min(0).max(10_000_000), 0).default(0),
});

const filtersQuery = queryOptions({
  queryKey: ["pkg-filters"],
  queryFn: async () => {
    const [d, c] = await Promise.all([getDestinations(), getCategories()]);
    return { destinations: d.destinations, categories: c.categories };
  },
});

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "All Travel Packages — Zonasis" },
      { name: "description", content: "Browse curated honeymoon, family, adventure and beach travel packages across India." },
      { property: "og:title", content: "All Travel Packages — Zonasis" },
      { property: "og:description", content: "Browse curated honeymoon, family, adventure and beach travel packages across India." },
    ],
  }),
  validateSearch: zodValidator(searchSchema),
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => {
    context.queryClient.ensureQueryData(filtersQuery);
    return context.queryClient.ensureQueryData({
      queryKey: ["packages", deps],
      queryFn: () => listPackages({ data: {
        search: deps.q, destination: deps.destination, category: deps.category, sort: deps.sort,
        durationMax: deps.duration || undefined, priceMax: deps.priceMax || undefined,
      } }),
    });
  },
  component: Page,
  errorComponent: ({ error }) => <div className="p-12 text-center text-sm text-destructive">{error.message}</div>,
});

function Page() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: filters } = useSuspenseQuery(filtersQuery);
  const { data } = useSuspenseQuery({
    queryKey: ["packages", search],
    queryFn: () => listPackages({ data: {
      search: search.q, destination: search.destination, category: search.category, sort: search.sort,
      durationMax: search.duration || undefined, priceMax: search.priceMax || undefined,
    } }),
  });

  function update(patch: Partial<typeof search>) {
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <SectionHeading
          align="left"
          eyebrow="All packages"
          title={<>Find your <span className="brand-gradient-text">perfect</span> trip</>}
          description="Filter by destination, category and budget — every package is fully customisable."
        />
        <div className="mt-8 grid gap-3 rounded-3xl border border-border bg-white p-3 shadow-soft md:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              defaultValue={search.q} placeholder="Search packages..."
              className="h-11 rounded-2xl border-transparent bg-section pl-9"
              onChange={(e) => update({ q: e.target.value })}
            />
          </div>
          <Select value={search.destination || "all"} onValueChange={(v) => update({ destination: v === "all" ? "" : v })}>
            <SelectTrigger className="h-11 w-44 rounded-2xl border-transparent bg-section"><SelectValue placeholder="Destination" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All destinations</SelectItem>
              {filters.destinations.map((d: any) => <SelectItem key={d.slug} value={d.slug}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={search.category || "all"} onValueChange={(v) => update({ category: v === "all" ? "" : v })}>
            <SelectTrigger className="h-11 w-40 rounded-2xl border-transparent bg-section"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {filters.categories.map((c: any) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(search.duration || "any")} onValueChange={(v) => update({ duration: v === "any" ? 0 : Number(v) })}>
            <SelectTrigger className="h-11 w-36 rounded-2xl border-transparent bg-section"><SelectValue placeholder="Duration" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any length</SelectItem>
              <SelectItem value="3">Up to 3 days</SelectItem>
              <SelectItem value="5">Up to 5 days</SelectItem>
              <SelectItem value="7">Up to 7 days</SelectItem>
              <SelectItem value="14">Up to 14 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={search.sort} onValueChange={(v: any) => update({ sort: v })}>
            <SelectTrigger className="h-11 w-40 rounded-2xl border-transparent bg-section">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: low → high</SelectItem>
              <SelectItem value="price-desc">Price: high → low</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {data.packages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-section p-16 text-center">
            <p className="text-lg font-semibold text-foreground">No packages match your filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try clearing some filters or contact us for a custom itinerary.</p>
            <Link to="/contact" className="brand-gradient-bg mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft">
              Contact us
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.packages.map((p: any, i: number) => <PackageCard key={p.id} pkg={p} index={i} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
