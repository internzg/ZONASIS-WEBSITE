import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Users, Package, MessageSquare, Inbox } from "lucide-react";
import { adminStats } from "@/lib/admin.functions";
import { formatDateTime } from "@/lib/format";

const q = queryOptions({ queryKey: ["admin-stats"], queryFn: () => adminStats() });

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — Zonasis" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: Page,
  errorComponent: ({ error }) => <div className="p-8 text-sm text-destructive">{error.message}</div>,
});

const STATUS_CLR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  quotation_sent: "bg-purple-100 text-purple-700",
  interested: "bg-green-100 text-green-700",
  closed: "bg-slate-200 text-slate-700",
  rejected: "bg-red-100 text-red-700",
};

function Page() {
  const { data } = useSuspenseQuery(q);
  const stats = [
    { Icon: Users, label: "Users", value: data.totals.users },
    { Icon: Package, label: "Packages", value: data.totals.packages },
    { Icon: MessageSquare, label: "Enquiries", value: data.totals.enquiries },
    { Icon: Inbox, label: "New enquiries", value: data.totals.newEnquiries },
  ];
  return (
    <>
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="font-display text-2xl font-bold">Admin overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Snapshot of your platform.</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="brand-gradient-bg grid h-10 w-10 place-items-center rounded-xl text-white"><s.Icon className="h-4 w-4" /></div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-1 font-display text-2xl font-bold text-foreground">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold">Recent enquiries</h2>
        {data.recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No enquiries yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {data.recent.map((e: any) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-foreground">{e.full_name} • {e.email}</div>
                  <div className="text-xs text-muted-foreground">{e.package?.title ?? "General"} · {formatDateTime(e.created_at)}</div>
                </div>
                <span className={"rounded-full px-3 py-1 text-xs font-semibold capitalize " + (STATUS_CLR[e.status] ?? "bg-section")}>{e.status.replace("_", " ")}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
