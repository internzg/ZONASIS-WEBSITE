import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Phone, MapPin, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { SiteShell } from "@/components/layout/SiteShell";
import { SectionHeading } from "@/components/site/SectionHeading";
import { submitEnquiry } from "@/lib/enquiries.functions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Zonasis — Plan Your Trip" },
      { name: "description", content: "Get in touch with our travel consultants to plan a tailor-made trip across India." },
      { property: "og:title", content: "Contact Zonasis" },
      { property: "og:description", content: "Get in touch with our travel consultants." },
    ],
  }),
  component: Page,
});

function Page() {
  const submit = useServerFn(submitEnquiry);
  const mut = useMutation({
    mutationFn: async (d: any) => submit({ data: d }),
    onSuccess: () => toast.success("Enquiry sent — we'll be in touch within 24 hours."),
    onError: (e: any) => toast.error(e?.message ?? "Failed to send enquiry"),
  });

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <SectionHeading
          eyebrow="Contact us"
          title={<>Let's plan <span className="brand-gradient-text">something good</span></>}
          description="Drop us a line — a real human will reply within 24 hours."
        />
      </section>
      <section className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <form
          className="rounded-3xl border border-border bg-white p-6 shadow-soft sm:p-8"
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
            });
            e.currentTarget.reset();
          }}
        >
          <h2 className="font-display text-xl font-bold">Send us a message</h2>
          <div className="mt-6 grid gap-4">
            <div className="grid gap-2"><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" required maxLength={120} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required maxLength={255} /></div>
              <div className="grid gap-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" required maxLength={40} /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2"><Label htmlFor="travel_date">Travel date</Label><Input id="travel_date" name="travel_date" type="date" /></div>
              <div className="grid gap-2"><Label htmlFor="travelers">Travelers</Label><Input id="travelers" name="travelers" type="number" min={1} max={50} defaultValue={2} /></div>
            </div>
            <div className="grid gap-2"><Label htmlFor="message">How can we help?</Label><Textarea id="message" name="message" rows={5} maxLength={2000} /></div>
            <button disabled={mut.isPending} className="brand-gradient-bg mt-2 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 disabled:opacity-60">
              {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send enquiry
            </button>
          </div>
        </form>
        <aside className="space-y-6">
          {[
            { Icon: Mail, title: "Email", value: "hello@zonasis.com" },
            { Icon: Phone, title: "Call / WhatsApp", value: "+91 90000 00000" },
            { Icon: MapPin, title: "Office", value: "Coimbatore, Tamil Nadu, India" },
          ].map(({ Icon, title, value }) => (
            <div key={title} className="flex items-start gap-4 rounded-3xl border border-border bg-white p-5 shadow-soft">
              <div className="brand-gradient-bg grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
                <div className="mt-1 truncate font-semibold text-foreground">{value}</div>
              </div>
            </div>
          ))}
          <div className="rounded-3xl bg-section p-6">
            <h3 className="font-display text-base font-semibold">Office hours</h3>
            <p className="mt-2 text-sm text-muted-foreground">Monday – Saturday, 9am – 9pm IST</p>
            <p className="mt-1 text-sm text-muted-foreground">Sunday: appointment only</p>
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}
