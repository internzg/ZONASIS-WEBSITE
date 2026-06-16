import { Users, Compass, MapPin, Clock } from "lucide-react";
import { Reveal } from "./Reveal";

const stats = [
  { icon: Users, value: "5,000+", label: "Happy Travelers" },
  { icon: Compass, value: "150+", label: "Curated Packages" },
  { icon: MapPin, value: "50+", label: "Destinations" },
  { icon: Clock, value: "10+", label: "Years Experience" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid gap-4 rounded-3xl bg-white p-2 shadow-soft sm:grid-cols-2 md:grid-cols-4 md:p-3">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05}>
            <div className="flex items-center gap-4 rounded-2xl bg-section p-5">
              <div className="brand-gradient-bg grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
