// components/public/excursion-card.tsx
import Link from "next/link";
import Image from "next/image";
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

export function ExcursionCard({ excursion }: { excursion: ExcursionCardData }) {
  const badge = typeBadge(excursion.type);
  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md">
      <Link href={`/gate/excursions:${excursion.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={excursion.image_url}
            alt={excursion.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Badge className={`absolute left-3 top-3 ${badge.className}`}>{badge.label}</Badge>
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-jakarta text-lg font-semibold text-secondary">
            {excursion.title}
          </h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {excursion.short_description}
          </p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-secondary">
              {formatDuration(excursion.duration_min, excursion.duration_max)}
            </span>
            <span className="font-semibold text-prm-coral">
              From ${excursion.price_from_usd}
            </span>
          </div>
        </div>
        <div className="border-t bg-prm-offwhite px-4 py-3">
          <span aria-label="Book this excursion" className="text-sm font-semibold text-prm-teal">
            Book →
          </span>
        </div>
      </Link>
    </article>
  );
}
