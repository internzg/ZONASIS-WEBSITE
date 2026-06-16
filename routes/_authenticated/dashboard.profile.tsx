import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { getMyProfile, updateMyProfile } from "@/lib/profile.functions";
import { getMyRoles } from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profileQ = queryOptions({ queryKey: ["me"], queryFn: () => getMyProfile() });
const rolesQ = queryOptions({ queryKey: ["my-roles"], queryFn: () => getMyRoles() });

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  head: () => ({ meta: [{ title: "My Profile — Zonasis" }] }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(profileQ),
    context.queryClient.ensureQueryData(rolesQ),
  ]),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(profileQ);
  const { data: rolesData } = useSuspenseQuery(rolesQ);
  const update = useServerFn(updateMyProfile);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: async (d: any) => update({ data: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me"] }); toast.success("Profile updated"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <DashboardShell isAdmin={rolesData.roles.includes("admin")}>
      <div className="rounded-3xl bg-white p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-2xl font-bold">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Keep your details up to date so we can reach you.</p>
        <form
          className="mt-6 grid max-w-xl gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            mut.mutate({
              full_name: String(f.get("full_name") ?? ""),
              phone: String(f.get("phone") ?? ""),
              avatar_url: String(f.get("avatar_url") ?? ""),
            });
          }}
        >
          <div className="grid gap-2"><Label>Email</Label><Input value={data.email ?? ""} disabled /></div>
          <div className="grid gap-2"><Label>Full name</Label><Input name="full_name" defaultValue={data.profile?.full_name ?? ""} maxLength={120} /></div>
          <div className="grid gap-2"><Label>Phone</Label><Input name="phone" defaultValue={data.profile?.phone ?? ""} maxLength={40} /></div>
          <div className="grid gap-2"><Label>Avatar URL (optional)</Label><Input name="avatar_url" defaultValue={data.profile?.avatar_url ?? ""} maxLength={1000} /></div>
          <button disabled={mut.isPending} className="brand-gradient-bg mt-2 inline-flex items-center justify-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60">
            {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
          </button>
        </form>
      </div>
    </DashboardShell>
  );
}
