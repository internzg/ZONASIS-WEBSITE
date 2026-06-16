import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { listSavedPackages } from "@/lib/profile.functions";
import { getMyRoles } from "@/lib/admin.functions";
import { PackageCard } from "@/components/site/PackageCard";

const savedQ = queryOptions({ queryKey: ["saved"], queryFn: () => listSavedPackages() });
const rolesQ = queryOptions({ queryKey: ["my-roles"], queryFn: () => getMyRoles() });

export const Route = createFileRoute("/_authenticated/dashboard/saved")({
  head: () => ({ meta: [{ title: "Saved Trips — Zonasis" }] }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(savedQ),
    context.queryClient.ensureQueryData(rolesQ),
  ]),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(savedQ);
  const { data: roles } = useSuspenseQuery(rolesQ);
  return (
    <DashboardShell isAdmin={roles.roles.includes("admin")}>
      <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-2xl font-bold">Saved trips</h1>
        {data.packages.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">You haven't saved any trips yet. <Link to="/packages" className="text-primary underline">Browse packages</Link>.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {data.packages.map((p: any, i: number) => <PackageCard key={p.id} pkg={p} index={i} />)}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
