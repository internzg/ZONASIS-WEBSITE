import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2, Shield, ShieldOff } from "lucide-react";

import { adminListUsers, adminSetUserRole, adminDeleteUser } from "@/lib/admin.functions";
import { formatDate } from "@/lib/format";

const q = queryOptions({ queryKey: ["admin-users"], queryFn: () => adminListUsers() });

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Manage Users — Zonasis Admin" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(q);
  const qc = useQueryClient();
  const setRole = useServerFn(adminSetUserRole);
  const del = useServerFn(adminDeleteUser);
  const roleMut = useMutation({
    mutationFn: async (d: any) => setRole({ data: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role updated"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const delMut = useMutation({
    mutationFn: async (user_id: string) => del({ data: { user_id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("User deleted"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <>
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">{data.users.length} users</p>
      </div>
      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-section text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.users.map((u: any) => {
              const isAdmin = u.roles.includes("admin");
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{u.full_name ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    {u.roles.map((r: string) => (
                      <span key={r} className="mr-1 rounded-full bg-section px-2 py-0.5 text-xs font-semibold capitalize">{r}</span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => roleMut.mutate({ user_id: u.id, make_admin: !isAdmin })}
                      className="inline-flex items-center gap-1 rounded-full bg-section px-3 py-1.5 text-xs font-semibold hover:bg-secondary">
                      {isAdmin ? <><ShieldOff className="h-3 w-3" /> Remove admin</> : <><Shield className="h-3 w-3" /> Make admin</>}
                    </button>
                    <button onClick={() => confirm("Delete this user permanently?") && delMut.mutate(u.id)}
                      className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100">
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
