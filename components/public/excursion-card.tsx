// components/public/excursion-card.tsx
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export interface ExcursionCardData {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  image_url: string;
  image_credit?: string | null;
  price_from_usd: number;
  duration_min: number;
  duration_max?: number | null;
  type: "cruise_day" | "multi_day" | "both";
  is_hero?: boolean;
  is_active?: boolean;
}

function formatDuration(min: number, max?: number | null): string {
  const toHrs = (m: number) => Math.round((m / 60) * 10) / 10;
  if (max && max !== min) return `${toHrs(min)}–${toHrs(max)} hrs`;
  return `${toHrs(min)} hrs`;
}

function typeBadge(t: ExcursionCardData["type"]) {
  if (t === "cruise_day") return { label: "Cruise Day", className: "bg-prm-teal text-white" };
  if (t === "multi_day") return { label: "Multi-Day", className: "bg-prm-coral text-white" };
  return { label: "Cruise or Stay", className: "bg-secondary text-white" };
}

export function ExcursionCard({
  excursion,
  showCouponBadge = false,
}: {
  excursion: ExcursionCardData;
  showCouponBadge?: boolean;
}) {
  const badge = typeBadge(excursion.type);
  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md">
      <Link href={`/gate/excursions:${excursion.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Use plain img for Unsplash thumbnails — avoids Next/Image domain config friction */}
          <img
            src={excursion.image_url}
            alt={excursion.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className={`absolute left-2 top-2 text-[10px] px-1.5 py-0.5 ${badge.className}`}>
            {badge.label}
          </Badge>

          {/* Coupon CTA badge — every 8th card in the homepage grid */}
          {showCouponBadge && (
            <a
              href={`/gate/excursions:${excursion.slug}?via=coupon-cta`}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-2 top-2 z-10 max-w-[90px] rounded-full bg-prm-coral px-2 py-1 text-center text-[10px] font-bold leading-tight text-white shadow-md transition hover:bg-prm-coral/90"
              aria-label="Free transportation coupon — claim"
            >
              🎁 Free transport
              <br />coupon — claim
            </a>
          )}
        </div>
        <div className="space-y-1.5 p-3">
          <h3 className="line-clamp-2 font-jakarta text-sm font-semibold text-secondary leading-snug">
            {excursion.title}
          </h3>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {excursion.short_description}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-secondary">
              {formatDuration(excursion.duration_min, excursion.duration_max)}
            </span>
            <span className="text-sm font-semibold text-prm-coral">
              From ${excursion.price_from_usd}
            </span>
          </div>
        </div>
        <div className="border-t bg-prm-offwhite px-3 py-2">
          <span aria-label="Book this excursion" className="text-xs font-semibold text-prm-teal">
            Book →
          </span>
        </div>
      </Link>
    </article>
  );
}
