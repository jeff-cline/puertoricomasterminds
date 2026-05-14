// app/(public)/coupon/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { CouponCard } from "@/components/coupon/coupon-card";
import { ExpediaBanner } from "@/components/public/expedia-banner";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";
import { buildViatorUrl, VIATOR_FALLBACK_URL_PATH } from "@/lib/affiliate/viator";
import { campaignHandle } from "@/lib/affiliate/campaign";

async function fetchLead(id: string) {
  const supabase = getServiceRoleSupabase();
  const { data } = await (supabase as any)
    .from("leads")
    .select("id, first_name, last_name, email, coupon_code, source_origin")
    .eq("id", id)
    .maybeSingle();
  return data;
}

async function fetchVendors() {
  const supabase = getServiceRoleSupabase();
  const { data } = await (supabase as any)
    .from("vendors")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}

export default async function CouponPage({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const { lead: leadId } = await searchParams;
  if (!leadId) notFound();
  const lead = await fetchLead(leadId);
  if (!lead) notFound();
  const vendors = await fetchVendors();

  // Reconstruct Viator URL from source_origin slug for the big BOOK CTA
  let bookUrl: string;
  if (lead.source_origin?.startsWith("excursions:")) {
    const slug = lead.source_origin.slice("excursions:".length);
    const supabase = getServiceRoleSupabase();
    const { data: ex } = await (supabase as any)
      .from("excursions")
      .select("viator_slug, viator_attraction_id, viator_base_level")
      .eq("slug", slug)
      .maybeSingle();
    if (ex) {
      bookUrl = buildViatorUrl({
        slug: ex.viator_slug,
        attractionId: ex.viator_attraction_id,
        baseLevel: ex.viator_base_level as "San-Juan" | "Puerto-Rico" | "Vieques" | "Fajardo",
        campaign: campaignHandle({ context: "coupon-page", decision: "book", entitySlug: slug }),
      });
    } else {
      bookUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}` + VIATOR_FALLBACK_URL_PATH;
    }
  } else {
    bookUrl = buildViatorUrl({ campaign: "coupon-page-book-fallback" });
  }

  const fullName = `${lead.first_name ?? ""} ${lead.last_name ?? ""}`.trim() || "Guest";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <header className="text-center">
        <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
          Great — we appreciate your support
        </h1>
        <p className="mt-4 text-muted-foreground">
          We'll let you know when these excursions are open for your next visit. Thank you for
          helping all future visitors to the beautiful island of Puerto Rico.
        </p>
      </header>

      <section className="mt-10">
        <CouponCard
          code={lead.coupon_code ?? "PR000000"}
          name={fullName}
          email={lead.email}
          leadId={lead.id}
        />
      </section>

      <section className="mt-12">
        <h2 className="font-jakarta text-2xl font-bold text-secondary">Redeem on the Cataño side</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Make a purchase at any of our partner vendors below and they'll refund your ferry fare —
          a thank-you for helping make our island better for the millions of visitors to come.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.length === 0 && (
            <p className="text-sm italic text-muted-foreground">Vendor partners coming soon.</p>
          )}
          {vendors.map((v: any) => (
            <div key={v.id} className="rounded-xl border bg-card p-4">
              {v.logo_url && <img src={v.logo_url} alt={v.name} className="mb-3 h-12 object-contain" />}
              <p className="font-semibold text-secondary">{v.name}</p>
              <p className="text-sm text-muted-foreground">{v.address}</p>
              <p className="mt-2 text-sm">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 text-center">
        <a
          href={bookUrl}
          target="_blank"
          rel="noopener sponsored noreferrer"
          className="inline-flex h-16 w-full max-w-2xl items-center justify-center rounded-lg bg-prm-coral px-6 text-xl font-extrabold text-white transition hover:bg-prm-coral/90"
        >
          BOOK EXCURSIONS →
        </a>
        <div className="mt-8 flex justify-center">
          <ExpediaBanner />
        </div>
      </section>

      <section className="mt-12 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-secondary">
          ← Back home
        </Link>
      </section>
    </div>
  );
}
