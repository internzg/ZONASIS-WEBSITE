import { Shield, Award, HeartHandshake, Sparkles, Plane, Users } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const items = [
  { icon: Shield, title: "Trusted travel experts", text: "Decade of experience and thousands of happy customers." },
  { icon: Award, title: "Best value packages", text: "Hand-negotiated rates with our preferred hotel & transport partners." },
  { icon: HeartHandshake, title: "24/7 support", text: "Reach a real human any time on call, WhatsApp or email." },
  { icon: Sparkles, title: "Customised itineraries", text: "Every plan tailored to your style, pace and budget." },
  { icon: Plane, title: "Safe & comfortable travel", text: "Vetted vehicles, drivers and stays — your safety is non-negotiable." },
  { icon: Users, title: "Experienced team", text: "Local guides and consultants who actually love what they do." },
];

export function WhyChoose() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Why Zonasis"
        title={<>Travel without the <span className="brand-gradient-text">stress</span></>}
        description="What makes hundreds of travellers come back to us year after year."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 0.04}>
            <div className="group h-full rounded-3xl border border-border bg-white p-6 transition hover:-translate-y-1 hover:shadow-soft">
              <div className="brand-gradient-bg grid h-12 w-12 place-items-center rounded-2xl text-white">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
