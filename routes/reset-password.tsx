import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { SiteShell } from "@/components/layout/SiteShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Zonasis" }] }),
  component: ResetPage,
});

function ResetPage() {
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.auth.updateUser({ password: String(f.get("password") ?? "") });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    navigate({ to: "/dashboard" });
  }

  return (
    <SiteShell footer={false}>
      <section className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 py-12">
        <form onSubmit={submit} className="w-full rounded-3xl border border-border bg-white p-8 shadow-elevated">
          <h1 className="font-display text-2xl font-bold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a strong password you'll remember.</p>
          <div className="mt-6 grid gap-4">
            <div className="grid gap-2"><Label>New password</Label><Input name="password" type="password" required minLength={6} /></div>
            <button disabled={busy} className="brand-gradient-bg inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-soft disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Update password
            </button>
          </div>
        </form>
      </section>
    </SiteShell>
  );
}
