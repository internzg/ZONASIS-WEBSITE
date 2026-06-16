import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { listMyEnquiries } from "@/lib/enquiries.functions";
import { getMyRoles } from "@/lib/admin.functions";
import { formatDate } from "@/lib/format";
import { Mail, Phone, Calendar, Users } from "lucide-react";

const q = queryOptions({ queryKey: ["my-enquiries"], queryFn: () => listMyEnquiries() });
const rolesQ = queryOptions({ queryKey: ["my-roles"], queryFn: () => getMyRoles() });

const STATUS_CLR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  quotation_sent: "bg-purple-100 text-purple-700",
  interested: "bg-green-100 text-green-700",
  closed: "bg-slate-200 text-slate-700",
  rejected: "bg-red-100 text-red-700",
};

export const Route = createFileRoute("/_authenticated/dashboard/enquiries")({
  head: () => ({ meta: [{ title: "My Enquiries — Zonasis" }] }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(q),
    context.queryClient.ensureQueryData(rolesQ),
  ]),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(q);
  const { data: roles } = useSuspenseQuery(rolesQ);
  return (
    <DashboardShell isAdmin={roles.roles.includes("admin")}>
      <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-2xl font-bold">My enquiries</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track the status of each enquiry you've sent.</p>
        {data.enquiries.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">No enquiries yet. <Link to="/packages" className="text-primary underline">Browse packages</Link>.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {data.enquiries.map((e: any) => (
              <li key={e.id} className="rounded-2xl border border-border bg-section p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-display text-base font-semibold text-foreground">{e.package?.title ?? "General enquiry"}</div>
                    <div className="mt-1 text-xs text-muted-foreground">Sent {formatDate(e.created_at)}</div>
                  </div>
                  <span className={"rounded-full px-3 py-1 text-xs font-semibold capitalize " + (STATUS_CLR[e.status] ?? "bg-section")}>{e.status.replace("_", " ")}</span>
                </div>
                <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                  <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{e.email}</span>
                  <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{e.phone}</span>
                  <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{e.travel_date ? formatDate(e.travel_date) : "Flexible"}</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{e.travelers} traveler{e.travelers === 1 ? "" : "s"}</span>
                </div>
                {e.message && <p className="mt-3 text-sm text-foreground">{e.message}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
