import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

import {
  adminListPackages, adminUpsertPackage, adminDeletePackage,
  getDestinations, getCategories,
} from "@/lib/packages.functions";
import { formatINR } from "@/lib/format";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const listQ = queryOptions({ queryKey: ["admin-packages"], queryFn: () => adminListPackages() });
const destQ = queryOptions({ queryKey: ["dest-list"], queryFn: () => getDestinations() });
const catQ = queryOptions({ queryKey: ["cat-list"], queryFn: () => getCategories() });

export const Route = createFileRoute("/_authenticated/admin/packages")({
  head: () => ({ meta: [{ title: "Manage Packages — Zonasis Admin" }] }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(listQ),
    context.queryClient.ensureQueryData(destQ),
    context.queryClient.ensureQueryData(catQ),
  ]),
  component: Page,
});

const STATUS_CLR: Record<string, string> = {
  draft: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-slate-200 text-slate-700",
};

function Page() {
  const { data } = useSuspenseQuery(listQ);
  const { data: destinations } = useSuspenseQuery(destQ);
  const { data: categories } = useSuspenseQuery(catQ);
  const qc = useQueryClient();
  const del = useServerFn(adminDeletePackage);
  const delMut = useMutation({
    mutationFn: async (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-packages"] }); toast.success("Deleted"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-6 shadow-soft">
        <div>
          <h1 className="font-display text-2xl font-bold">Packages</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.packages.length} package{data.packages.length === 1 ? "" : "s"}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="brand-gradient-bg inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-soft">
          <Plus className="h-4 w-4" /> New package
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-section text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.packages.map((p: any) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <div className="font-semibold text-foreground">{p.title}{p.is_featured && <span className="ml-2 rounded-full bg-section px-2 py-0.5 text-[10px] font-semibold text-primary">FEATURED</span>}</div>
                  <div className="text-xs text-muted-foreground">{p.slug}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.destination?.name ?? "—"}</td>
                <td className="px-4 py-3 font-semibold">{formatINR(p.price)}</td>
                <td className="px-4 py-3"><span className={"rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize " + (STATUS_CLR[p.status] ?? "")}>{p.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(p); setOpen(true); }} className="inline-flex items-center gap-1 rounded-full bg-section px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary"><Pencil className="h-3 w-3" /> Edit</button>
                  <button onClick={() => confirm("Delete this package?") && delMut.mutate(p.id)} className="ml-2 inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"><Trash2 className="h-3 w-3" /> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PackageDialog
        open={open} onOpenChange={setOpen}
        editing={editing}
        destinations={destinations.destinations}
        categories={categories.categories}
        onSaved={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-packages"] }); }}
      />
    </>
  );
}

function PackageDialog({ open, onOpenChange, editing, destinations, categories, onSaved }: any) {
  const upsert = useServerFn(adminUpsertPackage);
  const mut = useMutation({
    mutationFn: async (d: any) => upsert({ data: d }),
    onSuccess: () => { toast.success("Saved"); onSaved(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle className="font-display text-xl">{editing ? "Edit package" : "New package"}</DialogTitle></DialogHeader>
        <form
          className="mt-4 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            mut.mutate({
              id: editing?.id,
              slug: String(f.get("slug") ?? ""),
              title: String(f.get("title") ?? ""),
              summary: String(f.get("summary") ?? ""),
              description: String(f.get("description") ?? ""),
              duration_days: Number(f.get("duration_days") ?? 1),
              duration_nights: Number(f.get("duration_nights") ?? 0),
              price: Number(f.get("price") ?? 0),
              destination_id: String(f.get("destination_id") ?? "") || undefined,
              category_id: String(f.get("category_id") ?? "") || undefined,
              cover_image_url: String(f.get("cover_image_url") ?? ""),
              highlights: String(f.get("highlights") ?? "").split("\n").map(s => s.trim()).filter(Boolean),
              inclusions: String(f.get("inclusions") ?? "").split("\n").map(s => s.trim()).filter(Boolean),
              exclusions: String(f.get("exclusions") ?? "").split("\n").map(s => s.trim()).filter(Boolean),
              status: String(f.get("status") ?? "draft") as any,
              is_featured: f.get("is_featured") === "on",
            });
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2"><Label>Title</Label><Input name="title" defaultValue={editing?.title ?? ""} required maxLength={200} /></div>
            <div className="grid gap-2"><Label>Slug (a–z, 0–9, -)</Label><Input name="slug" defaultValue={editing?.slug ?? ""} required pattern="[a-z0-9-]+" maxLength={200} /></div>
          </div>
          <div className="grid gap-2"><Label>Summary (1–2 lines)</Label><Input name="summary" defaultValue={editing?.summary ?? ""} maxLength={500} /></div>
          <div className="grid gap-2"><Label>Description</Label><Textarea name="description" rows={4} defaultValue={editing?.description ?? ""} maxLength={5000} /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-2"><Label>Days</Label><Input name="duration_days" type="number" min={1} max={60} defaultValue={editing?.duration_days ?? 1} /></div>
            <div className="grid gap-2"><Label>Nights</Label><Input name="duration_nights" type="number" min={0} max={60} defaultValue={editing?.duration_nights ?? 0} /></div>
            <div className="grid gap-2"><Label>Price (INR)</Label><Input name="price" type="number" min={0} step="100" defaultValue={editing?.price ?? 0} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2"><Label>Destination</Label>
              <Select name="destination_id" defaultValue={editing?.destination?.id ?? editing?.destination_id ?? ""}>
                <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                <SelectContent>
                  {destinations.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Category</Label>
              <Select name="category_id" defaultValue={editing?.category?.id ?? editing?.category_id ?? ""}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2"><Label>Cover image URL</Label><Input name="cover_image_url" defaultValue={editing?.cover_image_url ?? ""} maxLength={1000} /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-2"><Label>Highlights (one per line)</Label><Textarea name="highlights" rows={4} defaultValue={(editing?.highlights ?? []).join("\n")} /></div>
            <div className="grid gap-2"><Label>Inclusions (one per line)</Label><Textarea name="inclusions" rows={4} defaultValue={(editing?.inclusions ?? []).join("\n")} /></div>
            <div className="grid gap-2"><Label>Exclusions (one per line)</Label><Textarea name="exclusions" rows={4} defaultValue={(editing?.exclusions ?? []).join("\n")} /></div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid gap-2"><Label>Status</Label>
              <Select name="status" defaultValue={editing?.status ?? "draft"}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_featured" defaultChecked={editing?.is_featured} className="h-4 w-4" /> Featured
            </label>
          </div>
          <button disabled={mut.isPending} className="brand-gradient-bg mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60">
            {mut.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
