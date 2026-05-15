// app/(public)/gate/[origin]/page.tsx
import { notFound } from "next/navigation";
import { GateForm } from "@/components/gate/gate-form";
import { getExcursionBySlug } from "@/lib/excursions/queries";
import { buildViatorUrl } from "@/lib/affiliate/viator";
import { campaignHandle } from "@/lib/affiliate/campaign";

export default async function GatePage({
  params,
  searchParams,
}: {
  params: Promise<{ origin: string }>;
  searchParams: Promise<{ via?: string }>;
}) {
  const { origin: rawOrigin } = await params;
  const { via } = await searchParams;
  const origin = decodeURIComponent(rawOrigin);
  const [kind, slug] = origin.split(":");

  if (kind === "modal") {
    // Generic gate; no specific excursion. No-path goes to the Viator head URL.
    const noPathRedirectUrl = buildViatorUrl({
      campaign: campaignHandle({ context: "modal", decision: "no", entitySlug: slug ?? "homepage" }),
    });
    return (
      <div className="relative min-h-[80vh] bg-gradient-to-br from-prm-teal/10 via-white to-prm-coral/10 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
              Welcome — we need your help.
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Help us shape what comes next on the island, and we'll give you a free transportation coupon.
            </p>
          </div>
          <div className="mt-10">
            <GateForm
              origin={origin}
              funnel="tourist"
              noPathRedirectUrl={noPathRedirectUrl}
              yesPathHref="/survey"
              via={via}
            />
          </div>
        </div>
      </div>
    );
  }
  if (kind !== "excursions" || !slug) notFound();

  const excursion = await getExcursionBySlug(slug);
  if (!excursion) notFound();

  // No-path Viator URL with per-card campaign handle
  const noPathRedirectUrl = buildViatorUrl({
    slug: excursion.viator_slug,
    attractionId: excursion.viator_attraction_id,
    baseLevel: excursion.viator_base_level as "San-Juan" | "Puerto-Rico" | "Vieques" | "Fajardo",
    campaign: campaignHandle({ context: "gate", decision: "no", entitySlug: excursion.slug }),
  });

  return (
    <div className="relative min-h-[80vh] bg-gradient-to-br from-prm-teal/10 via-white to-prm-coral/10 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
            Welcome to beautiful Puerto Rico — we need your help.
          </h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            We're growing and expanding as one of the most popular destinations in the Caribbean.
            Help us shape what comes next by taking a brief survey, and we'll give you a free
            transportation ticket as our thank-you before sending you to your excursion booking.
          </p>
        </div>
        <div className="mt-10">
          <GateForm
            origin={origin}
            funnel="tourist"
            noPathRedirectUrl={noPathRedirectUrl}
            yesPathHref="/survey"
            via={via}
          />
        </div>
      </div>
    </div>
  );
}
