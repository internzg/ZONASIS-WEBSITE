import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LayoutDashboard, User, Heart, MessageSquare, LogOut, Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function DashboardShell({ children, isAdmin }: { children: ReactNode; isAdmin?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const items = [
    { to: "/dashboard", label: "Overview", Icon: LayoutDashboard },
    { to: "/dashboard/enquiries", label: "My Enquiries", Icon: MessageSquare },
    { to: "/dashboard/saved", label: "Saved Trips", Icon: Heart },
    { to: "/dashboard/profile", label: "Profile", Icon: User },
  ] as const;

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-section">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="brand-gradient-bg hidden items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-soft sm:inline-flex">
                <Settings className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-section">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[220px_1fr]">
        <aside>
          <nav className="space-y-1">
            {items.map((it) => {
              const active = pathname === it.to;
              return (
                <Link key={it.to} to={it.to}
                  className={cn("flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                    active ? "bg-white text-foreground shadow-soft" : "text-muted-foreground hover:bg-white/60")}>
                  <it.Icon className="h-4 w-4" /> {it.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
