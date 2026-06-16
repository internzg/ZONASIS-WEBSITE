import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Search } from "lucide-react";

import { adminListEnquiries, adminUpdateEnquiry } from "@/lib/enquiries.functions";
import { formatDate, formatDateTime } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const q = queryOptions({ queryKey: ["admin-enquiries"], queryFn: () => adminListEnquiries() });

const STATUSES = ["new", "contacted", "quotation_sent", "interested", "closed", "rejected"] as const;
const STATUS_CLR: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  quotation_sent: "bg-purple-100 text-purple-700",
  interested: "bg-green-100 text-green-700",
  closed: "bg-slate-200 text-slate-700",
  rejected: "bg-red-100 text-red-700",
};

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  head: () => ({ meta: [{ title: "Manage Enquiries — Zonasis Admin" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: Page,
});

function Page() {
  const { data } = useSuspenseQuery(q);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<any | null>(null);

  const filtered = data.enquiries.filter((e: any) => {
    if (filter !== "all" && e.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (![e.full_name, e.email, e.phone, e.package?.title].some((v) => (v ?? "").toLowerCase().includes(s))) return false;
    }
    return true;
  });

  function exportCsv() {
    const headers = ["Created", "Name", "Email", "Phone", "Package", "Travel date", "Travelers", "Status", "Message"];
    const rows = filtered.map((e: any) => [
      formatDateTime(e.created_at), e.full_name, e.email, e.phone, e.package?.title ?? "", e.travel_date ?? "",
      e.travelers, e.status, (e.message ?? "").replaceAll("\n", " "),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "zonasis-enquiries.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-6 shadow-soft">
        <div>
          <h1 className="font-display text-2xl font-bold">Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} of {data.enquiries.length}</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-section">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="mt-4 grid gap-3 rounded-3xl bg-white p-3 shadow-soft sm:grid-cols-[1fr_200px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, phone..." className="h-10 rounded-2xl border-transparent bg-section pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="h-10 rounded-2xl border-transparent bg-section"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-section text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Travel date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((e: any) => (
              <tr key={e.id} className="cursor-pointer hover:bg-section/60" onClick={() => setActive(e)}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground">{e.full_name}</div>
                  <div className="text-xs text-muted-foreground">{e.email} · {e.phone}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{e.package?.title ?? "General"}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.travel_date ? formatDate(e.travel_date) : "Flexible"}</td>
                <td className="px-4 py-3"><span className={"rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize " + (STATUS_CLR[e.status] ?? "")}>{e.status.replace("_", " ")}</span></td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatDateTime(e.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">No enquiries match.</div>}
      </div>

      <EnquiryDrawer enquiry={active} onOpenChange={(o) => !o && setActive(null)} />
    </>
  );
}

function EnquiryDrawer({ enquiry, onOpenChange }: { enquiry: any | null; onOpenChange: (open: boolean) => void }) {
  const update = useServerFn(adminUpdateEnquiry);
  const qc = useQueryClient();
  const mut = useMutation({
    mutationFn: async (d: any) => update({ data: d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-enquiries"] }); toast.success("Updated"); onOpenChange(false); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  if (!enquiry) return null;
  return (
    <Dialog open={!!enquiry} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="font-display text-xl">{enquiry.full_name}</DialogTitle></DialogHeader>
        <div className="grid gap-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-xs text-muted-foreground">Email</div><div className="font-medium">{enquiry.email}</div></div>
            <div><div className="text-xs text-muted-foreground">Phone</div><div className="font-medium">{enquiry.phone}</div></div>
            <div><div className="text-xs text-muted-foreground">Travel date</div><div className="font-medium">{enquiry.travel_date ? formatDate(enquiry.travel_date) : "Flexible"}</div></div>
            <div><div className="text-xs text-muted-foreground">Travelers</div><div className="font-medium">{enquiry.travelers}</div></div>
            <div className="col-span-2"><div className="text-xs text-muted-foreground">Package</div><div className="font-medium">{enquiry.package?.title ?? "General enquiry"}</div></div>
          </div>
          {enquiry.message && (
            <div className="rounded-2xl bg-section p-3">
              <div className="text-xs text-muted-foreground">Message</div>
              <p className="mt-1 whitespace-pre-line text-sm text-foreground">{enquiry.message}</p>
            </div>
          )}
          <form
            className="grid gap-3 border-t border-border pt-3"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              mut.mutate({
                id: enquiry.id,
                status: String(f.get("status") ?? enquiry.status) as any,
                internal_notes: String(f.get("internal_notes") ?? ""),
              });
            }}
          >
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Status</label>
              <Select name="status" defaultValue={enquiry.status}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Internal notes</label>
              <Textarea name="internal_notes" rows={3} defaultValue={enquiry.internal_notes ?? ""} maxLength={2000} />
            </div>
            <button disabled={mut.isPending} className="brand-gradient-bg mt-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60">
              Save
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
