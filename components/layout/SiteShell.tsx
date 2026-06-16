import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function SiteShell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pt-24">{children}</main>
      {footer && <SiteFooter />}
    </div>
  );
}
