import { Link } from "@tanstack/react-router";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/format";

export type PackageCardData = {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  duration_days: number;
  duration_nights: number;
  price: number | string;
  cover_image_url: string | null;
  destination?: { name?: string | null } | null;
};

export function PackageCard({ pkg, index = 0 }: { pkg: PackageCardData; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition hover:shadow-elevated"
    >
      <Link to="/packages/$slug" params={{ slug: pkg.slug }} className="relative block aspect-[4/3] overflow-hidden">
        {pkg.cover_image_url && (
          <img
            src={pkg.cover_image_url} alt={pkg.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            loading="lazy"
          />
        )}
        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-foreground shadow-soft backdrop-blur">
          From {formatINR(pkg.price)}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {pkg.destination?.name && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />{pkg.destination.name}</span>
          )}
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-primary" />{pkg.duration_days}D • {pkg.duration_nights}N</span>
        </div>
        <Link to="/packages/$slug" params={{ slug: pkg.slug }} className="mt-2">
          <h3 className="font-display text-lg font-bold text-foreground hover:text-primary">{pkg.title}</h3>
        </Link>
        {pkg.summary && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{pkg.summary}</p>}
        <div className="mt-5 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-foreground">{formatINR(pkg.price)}</span>
          <Link to="/packages/$slug" params={{ slug: pkg.slug }}
            className="brand-gradient-bg inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:opacity-90">
            View Details <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
