import { createFileRoute, Outlet, redirect, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { getMyRoles } from "@/lib/admin.functions";
import { Logo } from "@/components/site/Logo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, MessageSquare, Users, FileText, LogOut, Home,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { roles } = await getMyRoles();
      if (!roles.includes("admin")) throw redirect({ to: "/dashboard" });
    } catch (e: any) {
      if (e?.to) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  const navigate = useNavigate();

  const items: Array<{ to: string; label: string; Icon: any; exact?: boolean }> = [
    { to: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
    { to: "/admin/packages", label: "Packages", Icon: Package },
    { to: "/admin/enquiries", label: "Enquiries", Icon: MessageSquare },
    { to: "/admin/users", label: "Users", Icon: Users },
    { to: "/admin/content", label: "Content", Icon: FileText },
  ];

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-section">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-section px-2.5 py-0.5 text-xs font-semibold text-primary sm:inline">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-section">
              <Home className="h-3.5 w-3.5" /> Site
            </Link>
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
              const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
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
        <main className="min-w-0"><Outlet /></main>
      </div>
    </div>
  );
}
