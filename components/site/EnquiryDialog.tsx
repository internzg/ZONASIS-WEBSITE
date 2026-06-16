"use client";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

import { submitEnquiry } from "@/lib/enquiries.functions";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EnquiryDialog({
  trigger,
  packageSlug,
  packageName,
  defaultOpen,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  packageSlug?: string;
  packageName?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const { user } = useAuth();
  const submit = useServerFn(submitEnquiry);
  const mut = useMutation({
    mutationFn: async (data: any) => submit({ data }),
    onSuccess: () => {
      toast.success("Enquiry sent!", { description: "Our travel consultant will reach out within 24 hours." });
      setOpen(false);
      onOpenChange?.(false);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to send enquiry"),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => { setOpen(o); onOpenChange?.(o); }}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Send an enquiry</DialogTitle>
          <DialogDescription>
            {packageName ? <>For <strong>{packageName}</strong>. </> : null}
            We'll get back within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form
          className="mt-4 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            mut.mutate({
              full_name: String(f.get("full_name") ?? ""),
              email: String(f.get("email") ?? ""),
              phone: String(f.get("phone") ?? ""),
              travel_date: String(f.get("travel_date") ?? ""),
              travelers: Number(f.get("travelers") ?? 1),
              message: String(f.get("message") ?? ""),
              package_slug: packageSlug ?? "",
              user_id: user?.id,
            });
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" required maxLength={120} />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={255} defaultValue={user?.email ?? ""} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required maxLength={40} />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            <div className="grid gap-2">
              <Label htmlFor="travel_date">Preferred travel date</Label>
              <Input id="travel_date" name="travel_date" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="travelers">Number of travelers</Label>
              <Input id="travelers" name="travelers" type="number" min={1} max={50} defaultValue={2} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Tell us more (optional)</Label>
            <Textarea id="message" name="message" rows={4} maxLength={2000} placeholder="Any preferences, dates, special requests..." />
          </div>
          <button
            type="submit" disabled={mut.isPending}
            className="brand-gradient-bg mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 disabled:opacity-60"
          >
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send enquiry
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
