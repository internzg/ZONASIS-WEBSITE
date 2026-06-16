import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getHomeData } from "@/lib/site.functions";
import { SiteShell } from "@/components/layout/SiteShell";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { DestinationsGrid } from "@/components/site/DestinationsGrid";
import { FeaturedPackages } from "@/components/site/FeaturedPackages";
import { WhyChoose } from "@/components/site/WhyChoose";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";

const homeQuery = queryOptions({ queryKey: ["home"], queryFn: () => getHomeData() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zonasis — Premium Travel & Transport in India" },
      { name: "description", content: "Curated travel packages across Ooty, Kodaikanal, Kerala, Goa, Andaman, Kashmir and more. Send an enquiry and our consultants craft your perfect trip." },
      { property: "og:title", content: "Zonasis — Premium Travel & Transport" },
      { property: "og:description", content: "Curated travel experiences, unforgettable holidays, reliable transport." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Page,
  errorComponent: ({ error }) => <div className="p-12 text-center text-sm text-destructive">{error.message}</div>,
});

function Page() {
  const { data } = useSuspenseQuery(homeQuery);
  const hero = (data.content as any)?.hero ?? { heading: "Explore Beyond Boundaries", subheading: "Discover curated travel experiences, unforgettable holidays, and reliable transport solutions.", eyebrow: "Curated travel experiences" };
  return (
    <SiteShell>
      <Hero heading={hero.heading} subheading={hero.subheading} eyebrow={hero.eyebrow} />
      <Stats />
      <DestinationsGrid destinations={data.destinations as any} />
      <FeaturedPackages packages={data.featured as any} />
      <WhyChoose />
      <Testimonials items={data.testimonials as any} />
      <CTA />
    </SiteShell>
  );
}
