import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, LogIn, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/site/Logo";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/packages", label: "Packages" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3 sm:pt-4">
      <div
        className={cn(
          "flex w-full max-w-6xl items-center gap-4 rounded-full px-4 py-2.5 transition-all sm:px-5",
          scrolled ? "soft-glass shadow-soft" : "bg-white/40 backdrop-blur-md",
        )}
      >
        <Logo />
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
                {active && (
                  <span className="brand-gradient-bg mx-auto mt-0.5 block h-0.5 w-6 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:ml-0 md:flex">
          {user ? (
            <Link
              to="/dashboard"
              className="brand-gradient-bg inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className="brand-gradient-bg inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-90"
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-full p-2 text-foreground md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="absolute inset-x-4 top-[68px] z-50 rounded-3xl soft-glass shadow-elevated p-4 md:hidden">
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-section">
                {l.label}
              </Link>
            ))}
            {user ? (
              <Link to="/dashboard" className="brand-gradient-bg mt-2 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white">
                Dashboard
              </Link>
            ) : (
              <Link to="/auth" className="brand-gradient-bg mt-2 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white">
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
