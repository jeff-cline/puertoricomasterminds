// app/(public)/excursions/page.tsx
import { ExcursionGrid } from "@/components/public/excursion-grid";
import { ModeToggle } from "@/components/public/mode-toggle";
import { listActiveExcursions, type ExcursionMode } from "@/lib/excursions/queries";

export default async function ExcursionsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const sp = await searchParams;
  const mode: ExcursionMode = sp.mode === "multi_day" ? "multi_day" : "cruise_day";
  const excursions = await listActiveExcursions({ mode });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-jakarta text-4xl font-bold text-secondary">All Excursions</h1>
          <p className="mt-2 text-muted-foreground">
            {excursions.length} hand-picked experiences across San Juan and beyond.
          </p>
        </div>
        <ModeToggle />
      </div>
      <ExcursionGrid excursions={excursions} />
    </div>
  );
}
