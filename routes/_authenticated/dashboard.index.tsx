import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { MessageSquare, Heart, User, Plane, ArrowRight } from "lucide-react";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { getMyProfile } from "@/lib/profile.functions";
import { listMyEnquiries } from "@/lib/enquiries.functions";
import { getMyRoles } from "@/lib/admin.functions";
import { formatDate } from "@/lib/format";

const profileQ = queryOptions({ queryKey: ["me"], queryFn: () => getMyProfile() });
const enqQ = queryOptions({ queryKey: ["my-enquiries"], queryFn: () => listMyEnquiries() });
const rolesQ = queryOptions({ queryKey: ["my-roles"], queryFn: () => getMyRoles() });

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — Zonasis" }] }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(profileQ),
    context.queryClient.ensureQueryData(enqQ),
    context.queryClient.ensureQueryData(rolesQ),
  ]),
  component: Page,
  errorComponent: ({ error }) => <div className="p-8 text-sm text-destructive">{error.message}</div>,
});

function Page() {
  const { data: profile } = useSuspenseQuery(profileQ);
  const { data: enq } = useSuspenseQuery(enqQ);
  const { data: rolesData } = useSuspenseQuery(rolesQ);
  const isAdmin = rolesData.roles.includes("admin");

  return (
    <DashboardShell isAdmin={isAdmin}>
      <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Hey {profile.profile?.full_name?.split(" ")[0] ?? "Traveler"} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with your trips.</p>
          </div>
          <Link to="/packages" className="brand-gradient-bg inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-soft">
            Browse new trips <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { Icon: MessageSquare, label: "My enquiries", value: enq.enquiries.length },
          { Icon: Heart, label: "Saved trips", value: "—", hint: "View saved" },
          { Icon: User, label: "Profile", value: profile.profile?.full_name ? "Complete" : "Incomplete" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="brand-gradient-bg grid h-10 w-10 place-items-center rounded-xl text-white"><s.Icon className="h-4 w-4" /></div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-1 font-display text-lg font-bold text-foreground">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent enquiries</h2>
          <Link to="/dashboard/enquiries" className="text-sm font-semibold text-primary">View all</Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-soft">
          {enq.enquiries.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Plane className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2">No enquiries yet. Browse <Link to="/packages" className="text-primary underline">packages</Link> and send one.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {enq.enquiries.slice(0, 5).map((e: any) => (
                <li key={e.id} className="flex items-center justify-between gap-4 p-4 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-foreground">{e.package?.title ?? "General enquiry"}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">Sent {formatDate(e.created_at)}</div>
                  </div>
                  <span className="rounded-full bg-section px-3 py-1 text-xs font-semibold capitalize text-foreground">{e.status.replace("_", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
