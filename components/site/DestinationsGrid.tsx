import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

type Destination = { id: string; slug: string; name: string; description: string | null; image_url: string | null };

export function DestinationsGrid({ destinations }: { destinations: Destination[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Popular destinations"
        title={<>Where will you go <span className="brand-gradient-text">next?</span></>}
        description="Hand-picked locations our travel consultants love most."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d, i) => (
          <Reveal key={d.id} delay={i * 0.05}>
            <Link
              to="/destinations/$slug" params={{ slug: d.slug }}
              className="group relative block overflow-hidden rounded-3xl bg-section shadow-soft transition hover:shadow-elevated"
            >
              <div className="aspect-[5/6] overflow-hidden">
                {d.image_url && (
                  <img
                    src={d.image_url} alt={d.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="font-display text-2xl font-bold text-white">{d.name}</div>
                {d.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-white/85">{d.description}</p>
                )}
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-foreground">
                  Explore <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
