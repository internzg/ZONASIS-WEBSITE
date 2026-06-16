import { Link } from "@tanstack/react-router";
import { SectionHeading } from "./SectionHeading";
import { PackageCard, type PackageCardData } from "./PackageCard";
import { ArrowRight } from "lucide-react";

export function FeaturedPackages({ packages }: { packages: PackageCardData[] }) {
  return (
    <section className="bg-section py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
          <SectionHeading
            align="left"
            eyebrow="Featured packages"
            title={<>Curated trips, ready for <span className="brand-gradient-text">you</span></>}
            description="Our most-loved itineraries this season."
          />
          <Link to="/packages" className="hidden items-center gap-1 text-sm font-semibold text-primary sm:inline-flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((p, i) => <PackageCard key={p.id} pkg={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}
