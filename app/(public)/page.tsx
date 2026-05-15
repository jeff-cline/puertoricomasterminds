// app/(public)/page.tsx
import Link from "next/link";
import { Hero } from "@/components/public/hero";
import { ExcursionGrid } from "@/components/public/excursion-grid";
import { listActiveExcursions, type ExcursionMode } from "@/lib/excursions/queries";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const sp = await searchParams;
  const mode: ExcursionMode = sp.mode === "multi_day" ? "multi_day" : "cruise_day";
  // Show top 20 active excursions (not just heroes) for the 4×5 grid
  const excursions = await listActiveExcursions({ mode, limit: 20 });

  return (
    <>
      <Hero />
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-jakarta text-3xl font-bold text-secondary">
              {mode === "cruise_day" ? "Best for Cruise Day" : "Best for Multi-Day Stays"}
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              {mode === "cruise_day"
                ? "Back to the ship by sundown — top picks within walking distance or a short transfer."
                : "Full-day, evening, and overnight-friendly excursions for travelers staying three or more nights."}
            </p>
          </div>
        </div>

        <ExcursionGrid excursions={excursions} showCouponBadges />

        {/* See More CTA */}
        <div className="mt-10 text-center">
          <Link
            href="/excursions"
            className="inline-flex items-center gap-2 rounded-full border-2 border-prm-teal bg-white px-8 py-3 font-jakarta text-base font-semibold text-prm-teal shadow-sm transition hover:bg-prm-teal hover:text-white"
          >
            See all 70+ excursions →
          </Link>
        </div>
      </section>
    </>
  );
}
