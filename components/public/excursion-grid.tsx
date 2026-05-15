// components/public/excursion-grid.tsx
import { ExcursionCard, type ExcursionCardData } from "./excursion-card";

export function ExcursionGrid({
  excursions,
  emptyLabel = "No excursions match your filter yet.",
  showCouponBadges = false,
}: {
  excursions: ExcursionCardData[];
  emptyLabel?: string;
  /** When true, every 8th card (0-indexed: 7, 15, 23 …) gets a coral coupon badge. */
  showCouponBadges?: boolean;
}) {
  if (excursions.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">{emptyLabel}</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {excursions.map((e, idx) => (
        <ExcursionCard
          key={e.id}
          excursion={e}
          showCouponBadge={showCouponBadges && (idx + 1) % 8 === 0}
        />
      ))}
    </div>
  );
}
