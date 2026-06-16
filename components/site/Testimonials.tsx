import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

type T = { id: string; name: string; location: string | null; rating: number; quote: string };

export function Testimonials({ items }: { items: T[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);
  if (!items.length) return null;
  const t = items[i];
  return (
    <section className="bg-section py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Travellers love us"
          title={<>Stories from our <span className="brand-gradient-text">guests</span></>}
        />
        <div className="relative mt-12 overflow-hidden rounded-3xl bg-white p-8 shadow-soft sm:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="mx-auto flex items-center justify-center gap-0.5 text-[oklch(0.8_0.18_85)]">
                {Array.from({ length: t.rating }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mx-auto mt-5 max-w-2xl font-display text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
                “{t.quote}”
              </blockquote>
              <div className="mt-6 text-sm font-semibold text-foreground">{t.name}</div>
              {t.location && <div className="text-xs text-muted-foreground">{t.location}</div>}
            </motion.div>
          </AnimatePresence>

          {items.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button onClick={() => setI((p) => (p - 1 + items.length) % items.length)} className="rounded-full border border-border bg-white p-2 text-foreground shadow-soft transition hover:bg-section" aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex gap-1.5">
                {items.map((_, k) => (
                  <button key={k} onClick={() => setI(k)} className={"h-1.5 rounded-full transition-all " + (k === i ? "w-6 bg-primary" : "w-1.5 bg-border")} aria-label={`Slide ${k+1}`} />
                ))}
              </div>
              <button onClick={() => setI((p) => (p + 1) % items.length)} className="rounded-full border border-border bg-white p-2 text-foreground shadow-soft transition hover:bg-section" aria-label="Next">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
