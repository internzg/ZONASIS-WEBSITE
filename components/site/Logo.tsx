import logoAsset from "@/assets/zonasis-logo.png.asset.json";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, withWordmark = true }: { className?: string; withWordmark?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <img src={logoAsset.url} alt="Zonasis" className="h-10 w-auto object-contain" />
      {withWordmark && (
        <span className="font-display text-xl font-bold tracking-tight">
          <span className="text-foreground">Zon</span>
          <span className="brand-gradient-text">asis</span>
        </span>
      )}
    </Link>
  );
}

