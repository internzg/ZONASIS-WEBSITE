import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import heroImg from "@/assets/hero-travel.jpg";

export function Hero({ heading, subheading, eyebrow }: { heading: string; subheading: string; eyebrow?: string }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src={heroImg} alt="" className="h-full w-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/70 to-white" />
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-[oklch(0.82_0.12_220/0.35)] blur-3xl" />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-[oklch(0.68_0.27_330/0.25)] blur-3xl" />
      </div>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-10 sm:px-6 md:grid-cols-[1.1fr_1fr] md:gap-8 md:pb-28 md:pt-20">
        <div className="max-w-2xl">
          {eyebrow && (
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur"
            >
              <span className="brand-gradient-bg h-1.5 w-1.5 rounded-full" />
              {eyebrow}
            </motion.span>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="mt-4 font-display text-4xl font-bold leading-[1.05] text-foreground sm:text-6xl md:text-7xl"
          >
            {heading.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="brand-gradient-text">{heading.split(" ").slice(-1).join(" ")}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            {subheading}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link to="/packages" className="brand-gradient-bg inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-elevated transition hover:opacity-95">
              Explore Packages <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-6 py-3.5 text-sm font-semibold text-foreground shadow-soft backdrop-blur transition hover:bg-white">
              <Phone className="h-4 w-4" /> Contact Us
            </Link>
          </motion.div>

          <div className="mt-10 grid max-w-md grid-cols-3 gap-6 text-left">
            {[
              { k: "5,000+", v: "Happy travelers" },
              { k: "150+", v: "Curated packages" },
              { k: "10+", v: "Years experience" },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-display text-2xl font-bold text-foreground sm:text-3xl">{s.k}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden md:block">
          <FloatingCards />
        </div>
      </div>
    </section>
  );
}

function FloatingCards() {
  const cards = [
    { name: "Kerala Backwaters", tag: "5D • 4N", img: "/__l5e/assets-v1/3d50ef97-b227-457a-87b0-516deada91d2/dest-kerala.jpg", top: "0%", left: "10%", rotate: -4, delay: 0.2 },
    { name: "Kashmir Paradise", tag: "6D • 5N", img: "/__l5e/assets-v1/85858be8-604e-4373-9c7c-fcfa9f7ba3cd/dest-kashmir.jpg", top: "22%", left: "48%", rotate: 5, delay: 0.4 },
    { name: "Andaman Bliss",   tag: "6D • 5N", img: "/__l5e/assets-v1/4404d861-96ee-4640-9800-df01d679854f/dest-andaman.jpg", top: "55%", left: "16%", rotate: -2, delay: 0.6 },
  ];
  return (
    <div className="relative h-[520px]">
      {cards.map((c) => (
        <motion.div
          key={c.name}
          initial={{ opacity: 0, y: 30, rotate: 0 }}
          animate={{ opacity: 1, y: [0, -10, 0], rotate: c.rotate }}
          transition={{
            opacity: { duration: 0.6, delay: c.delay },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: c.delay },
            rotate: { duration: 0.6, delay: c.delay },
          }}
          style={{ top: c.top, left: c.left }}
          className="absolute w-56 overflow-hidden rounded-3xl bg-white p-2 shadow-elevated"
        >
          <img src={c.img} alt={c.name} className="h-40 w-full rounded-2xl object-cover" loading="lazy" />
          <div className="flex items-center justify-between px-2 py-2">
            <div>
              <div className="text-sm font-semibold text-foreground">{c.name}</div>
              <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3 text-primary" /> India
              </div>
            </div>
            <span className="rounded-full bg-section px-2 py-1 text-[10px] font-semibold text-primary">{c.tag}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
