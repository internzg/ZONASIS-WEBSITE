import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="brand-gradient-bg relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center text-white sm:px-12">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
          <Sparkles className="h-3.5 w-3.5" /> Plan your trip
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">Tell us where you want to go.</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-white/90 sm:text-base">
          Send an enquiry and a real travel consultant will reach out within 24 hours with a tailored itinerary and pricing.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/packages" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-elevated transition hover:scale-[1.02]">
            Browse Packages <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
            Send an Enquiry
          </Link>
        </div>
      </div>
    </section>
  );
}
