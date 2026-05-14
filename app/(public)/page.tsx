// app/(public)/page.tsx
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
  const heroExcursions = await listActiveExcursions({ mode, heroOnly: true });

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
        <ExcursionGrid excursions={heroExcursions} />
      </section>
    </>
  );
}
