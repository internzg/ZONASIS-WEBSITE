import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getDestinationBySlug } from "@/lib/packages.functions";
import { SiteShell } from "@/components/layout/SiteShell";
import { PackageCard } from "@/components/site/PackageCard";

export const Route = createFileRoute("/destinations/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      queryOptions({
        queryKey: ["destination", params.slug],
        queryFn: () => getDestinationBySlug({ data: { slug: params.slug } }),
      }),
    );
    if (!data.destination) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const d = loaderData?.destination as any;
    if (!d) return { meta: [{ title: "Destination — Zonasis" }] };
    return {
      meta: [
        { title: `${d.name} Travel Packages — Zonasis` },
        { name: "description", content: d.description ?? `Explore curated ${d.name} travel packages with Zonasis.` },
        { property: "og:title", content: `${d.name} Travel Packages — Zonasis` },
        { property: "og:description", content: d.description ?? "" },
        ...(d.image_url ? [{ property: "og:image", content: d.image_url }] : []),
      ],
    };
  },
  component: Page,
  errorComponent: ({ error }) => <div className="p-12 text-center text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => (
    <SiteShell><div className="mx-auto max-w-xl px-4 py-32 text-center">
      <h1 className="font-display text-3xl font-bold">Destination not found</h1>
      <Link to="/packages" className="brand-gradient-bg mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white">Browse packages</Link>
    </div></SiteShell>
  ),
});

function Page() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["destination", slug],
    queryFn: () => getDestinationBySlug({ data: { slug } }),
  });
  const d: any = data.destination;

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
        {d.image_url && (
          <div className="absolute inset-0 -z-10">
            <img src={d.image_url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white" />
          </div>
        )}
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="brand-gradient-text text-xs font-semibold uppercase tracking-[0.18em]">Destination</span>
          <h1 className="mt-2 font-display text-5xl font-bold text-foreground sm:text-6xl">{d.name}</h1>
          {d.description && <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">{d.description}</p>}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="font-display text-2xl font-bold">{data.packages.length} package{data.packages.length === 1 ? "" : "s"} in {d.name}</h2>
        {data.packages.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No active packages right now. <Link to="/contact" className="text-primary underline">Contact us</Link> for a custom plan.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.packages.map((p: any, i: number) => <PackageCard key={p.id} pkg={p} index={i} />)}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
