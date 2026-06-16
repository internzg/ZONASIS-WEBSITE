import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getSiteContent, getSiteFaqs } from "@/lib/site.functions";

const q1 = queryOptions({ queryKey: ["site-content"], queryFn: () => getSiteContent() });
const q2 = queryOptions({ queryKey: ["site-faqs"], queryFn: () => getSiteFaqs() });

export const Route = createFileRoute("/_authenticated/admin/content")({
  head: () => ({ meta: [{ title: "Site Content — Zonasis Admin" }] }),
  loader: ({ context }) => Promise.all([
    context.queryClient.ensureQueryData(q1),
    context.queryClient.ensureQueryData(q2),
  ]),
  component: Page,
});

function Page() {
  const { data: c } = useSuspenseQuery(q1);
  const { data: f } = useSuspenseQuery(q2);
  const hero = c.content.hero ?? {};
  const contact = c.content.contact ?? {};
  return (
    <>
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="font-display text-2xl font-bold">Site content</h1>
        <p className="mt-1 text-sm text-muted-foreground">Hero text, contact details and FAQs that appear across the site.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold">Hero</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Eyebrow</dt><dd className="mt-1 font-medium">{hero.eyebrow ?? "—"}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Heading</dt><dd className="mt-1 font-medium">{hero.heading ?? "—"}</dd></div>
            <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Subheading</dt><dd className="mt-1 font-medium">{hero.subheading ?? "—"}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">Edit via the Lovable Cloud table editor for now (full inline editor coming soon).</p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold">Contact</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {["email", "phone", "whatsapp", "address", "instagram", "facebook", "twitter"].map((k) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-medium break-all">{contact[k] ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="font-display text-lg font-bold">Site FAQs ({f.faqs.length})</h2>
        <ul className="mt-4 space-y-3 text-sm">
          {f.faqs.map((q: any) => (
            <li key={q.id} className="rounded-2xl bg-section p-4">
              <div className="font-semibold text-foreground">{q.question}</div>
              <div className="mt-1 text-muted-foreground">{q.answer}</div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
