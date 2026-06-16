import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/SiteShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { Heart, Globe, Shield, Sparkles } from "lucide-react";
import { CTA } from "@/components/site/CTA";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Zonasis — Premium Travel & Transport" },
      { name: "description", content: "We're a team of passionate travel consultants curating unforgettable, fully-tailored journeys across India." },
      { property: "og:title", content: "About Zonasis" },
      { property: "og:description", content: "Premium, hand-crafted travel experiences across India." },
    ],
  }),
  component: Page,
});

const values = [
  { icon: Heart, title: "People first", text: "Travel is personal. We treat every enquiry like it's our own family." },
  { icon: Globe, title: "Local expertise", text: "Real local partners — boutique stays, trusted drivers, on-ground guides." },
  { icon: Shield, title: "Safe & reliable", text: "Vetted transport and stays. 24/7 on-trip support." },
  { icon: Sparkles, title: "Tailored, always", text: "Every itinerary is built around what you want — never a template." },
];

const timeline = [
  { y: "2015", t: "Zonasis founded", d: "We started with a single Tempo Traveller and a love for the Nilgiris." },
  { y: "2018", t: "Pan-India coverage", d: "Expanded to Kerala, Goa and Kashmir with trusted on-ground partners." },
  { y: "2021", t: "5,000 happy travelers", d: "Crossed 5,000 trips with a 4.9★ average rating." },
  { y: "2024", t: "Premium online platform", d: "Launched our online enquiry experience for faster planning." },
];

function Page() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-4 pt-6 text-center sm:px-6">
        <SectionHeading
          eyebrow="About Zonasis"
          title={<>Travel that feels <span className="brand-gradient-text">personal</span></>}
          description="A decade-young travel company on a mission to make every journey effortless, luxurious and unforgettable."
        />
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-3">
        {[
          { title: "Our mission", text: "Craft once-in-a-lifetime journeys that combine genuine local experiences with the comfort of a 5-star concierge." },
          { title: "Our vision", text: "To become India's most trusted boutique travel partner — known for warmth, taste and attention to detail." },
          { title: "Our promise", text: "If you're not delighted on day one, we'll fix it before sunset. No questions. No fine print." },
        ].map((b, i) => (
          <Reveal key={b.title} delay={i * 0.05}>
            <div className="h-full rounded-3xl border border-border bg-white p-6 shadow-soft">
              <h3 className="font-display text-xl font-bold text-foreground">{b.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{b.text}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="What we stand for" title={<>Our <span className="brand-gradient-text">values</span></>} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.04}>
              <div className="h-full rounded-3xl bg-section p-6">
                <div className="brand-gradient-bg grid h-12 w-12 place-items-center rounded-2xl text-white">
                  <v.icon className="h-5 w-5" />
                </div>
                <h4 className="mt-4 font-display text-base font-semibold">{v.title}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-4xl px-4 sm:px-6">
        <SectionHeading eyebrow="Our journey" title={<>A <span className="brand-gradient-text">decade</span> of memories</>} />
        <div className="relative mt-12">
          <div className="absolute left-4 top-0 h-full w-px bg-border sm:left-1/2" />
          <div className="space-y-10">
            {timeline.map((t, i) => (
              <Reveal key={t.y} delay={i * 0.04}>
                <div className="relative grid gap-4 sm:grid-cols-2 sm:items-center">
                  <div className={i % 2 === 0 ? "sm:pr-10 sm:text-right" : "sm:order-2 sm:pl-10"}>
                    <div className="brand-gradient-text font-display text-2xl font-bold">{t.y}</div>
                    <div className="mt-1 font-display text-lg font-semibold text-foreground">{t.t}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{t.d}</p>
                  </div>
                  <div className="absolute left-4 top-1 grid h-3 w-3 -translate-x-1/2 place-items-center rounded-full brand-gradient-bg sm:left-1/2" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </SiteShell>
  );
}
