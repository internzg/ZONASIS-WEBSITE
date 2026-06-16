import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Check, X, MapPin, Clock, Sparkles, ArrowRight } from "lucide-react";

import { getPackageBySlug } from "@/lib/packages.functions";
import { SiteShell } from "@/components/layout/SiteShell";
import { EnquiryDialog } from "@/components/site/EnquiryDialog";
import { formatINR } from "@/lib/format";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/packages/$slug")({
  loader: async ({ context, params }) => {
    const opts = queryOptions({
      queryKey: ["package", params.slug],
      queryFn: () => getPackageBySlug({ data: { slug: params.slug } }),
    });
    const data = await context.queryClient.ensureQueryData(opts);
    if (!data.package) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const p = loaderData?.package as any;
    if (!p) return { meta: [{ title: "Package not found — Zonasis" }] };
    return {
      meta: [
        { title: `${p.title} — Zonasis` },
        { name: "description", content: p.summary ?? p.description?.slice(0, 160) ?? "" },
        { property: "og:title", content: `${p.title} — Zonasis` },
        { property: "og:description", content: p.summary ?? "" },
        ...(p.cover_image_url ? [
          { property: "og:image", content: p.cover_image_url },
          { name: "twitter:image", content: p.cover_image_url },
        ] : []),
      ],
    };
  },
  component: Page,
  errorComponent: ({ error }) => <div className="p-12 text-center text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => (
    <SiteShell>
      <div className="mx-auto max-w-xl px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Package not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been moved or unpublished.</p>
        <Link to="/packages" className="brand-gradient-bg mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white">Browse packages</Link>
      </div>
    </SiteShell>
  ),
});

function Page() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery({
    queryKey: ["package", slug],
    queryFn: () => getPackageBySlug({ data: { slug } }),
  });
  const p: any = data.package;

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-section">
          {p.cover_image_url && (
            <img src={p.cover_image_url} alt={p.title} className="h-[280px] w-full object-cover sm:h-[420px]" />
          )}
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {p.destination?.name && <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" />{p.destination.name}</span>}
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4 text-primary" />{p.duration_days}D • {p.duration_nights}N</span>
            {p.category?.name && <span className="rounded-full bg-section px-2.5 py-0.5 text-xs">{p.category.name}</span>}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-5xl">{p.title}</h1>
          {p.summary && <p className="mt-4 text-base text-muted-foreground sm:text-lg">{p.summary}</p>}

          {p.highlights?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold">Package highlights</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {p.highlights.map((h: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 rounded-2xl bg-section p-4">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {p.description && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold">About this trip</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{p.description}</p>
            </div>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {p.inclusions?.length > 0 && (
              <div className="rounded-3xl border border-border bg-white p-6">
                <h3 className="font-display text-lg font-bold text-foreground">Inclusions</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {p.inclusions.map((i: string, k: number) => (
                    <li key={k} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-[oklch(0.7_0.18_150)]" />{i}</li>
                  ))}
                </ul>
              </div>
            )}
            {p.exclusions?.length > 0 && (
              <div className="rounded-3xl border border-border bg-white p-6">
                <h3 className="font-display text-lg font-bold text-foreground">Exclusions</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  {p.exclusions.map((i: string, k: number) => (
                    <li key={k} className="flex gap-2"><X className="mt-0.5 h-4 w-4 text-destructive" />{i}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {p.itinerary?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold">Day-wise itinerary</h2>
              <Accordion type="single" collapsible defaultValue="day-1" className="mt-4">
                {p.itinerary.map((d: any) => (
                  <AccordionItem key={d.day_number} value={`day-${d.day_number}`} className="border-border">
                    <AccordionTrigger className="text-left">
                      <span className="flex items-center gap-3">
                        <span className="brand-gradient-bg grid h-8 w-8 place-items-center rounded-full text-xs font-semibold text-white">{d.day_number}</span>
                        <span className="font-semibold">{d.title}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="pl-11 text-sm text-muted-foreground">{d.description}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {p.faqs?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-bold">FAQs</h2>
              <Accordion type="single" collapsible className="mt-4">
                {p.faqs.map((f: any, k: number) => (
                  <AccordionItem key={k} value={`f-${k}`} className="border-border">
                    <AccordionTrigger className="text-left">{f.question}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">{f.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-elevated">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Starting from</div>
            <div className="mt-1 font-display text-3xl font-bold text-foreground">{formatINR(p.price)}</div>
            <div className="mt-1 text-xs text-muted-foreground">per person, twin sharing</div>

            <EnquiryDialog
              packageSlug={p.slug}
              packageName={p.title}
              trigger={
                <button className="brand-gradient-bg mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-95">
                  Send Enquiry <ArrowRight className="h-4 w-4" />
                </button>
              }
            />
            <Link to="/contact" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-section">
              Talk to a consultant
            </Link>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              We respond within 24 hours. No payment needed to enquire.
            </p>
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}
