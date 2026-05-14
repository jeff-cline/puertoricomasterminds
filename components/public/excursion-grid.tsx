// components/public/excursion-grid.tsx
import { ExcursionCard, type ExcursionCardData } from "./excursion-card";

export function ExcursionGrid({
  excursions,
  emptyLabel = "No excursions match your filter yet.",
}: {
  excursions: ExcursionCardData[];
  emptyLabel?: string;
}) {
  if (excursions.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {excursions.map((e) => <ExcursionCard key={e.id} excursion={e} />)}
    </div>
  );
}
