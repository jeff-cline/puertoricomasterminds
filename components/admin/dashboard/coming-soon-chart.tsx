"use client";

import type { ComingSoonItem } from "@/lib/admin/overview-queries";

const CATEGORY_COLORS: Record<string, string> = {
  water: "#0FB5BA",
  adventure: "#FF7A45",
  culinary: "#F39C12",
  art: "#9B59B6",
  culture: "#8B6F47",
  nature: "#27AE60",
  wellness: "#E91E8C",
  nightlife: "#2980B9",
  default: "#6B7280",
};

function catColor(category: string | null | undefined): string {
  if (!category) return CATEGORY_COLORS.default;
  const key = category.toLowerCase().split("_")[0];
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.default;
}

interface ComingSoonChartProps {
  items: ComingSoonItem[];
}

export function ComingSoonChart({ items }: ComingSoonChartProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-center">
          <p className="text-2xl">🗳️</p>
          <p className="mt-2 font-semibold text-secondary">Awaiting ranking data</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rankings will appear as visitors vote on Coming Soon experiences.
          </p>
        </div>
      </div>
    );
  }

  const maxScore = Math.max(1, ...items.map((i) => i.borda_score));

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <ol className="space-y-2">
        {items.map((item, idx) => {
          const color = catColor(item.category);
          const widthPct = (item.borda_score / maxScore) * 100;
          return (
            <li
              key={item.id}
              className="group flex items-center gap-3 rounded-lg p-1.5 hover:bg-prm-offwhite transition"
              title={`${item.title} · Borda ${item.borda_score} · picks ${item.total_picks} · #1 votes ${item.first_place_count}${item.category ? " · " + item.category : ""}`}
            >
              <span className="w-6 text-right font-mono text-xs text-muted-foreground">
                {idx + 1}
              </span>
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt=""
                  width={50}
                  height={50}
                  loading="lazy"
                  className="h-[50px] w-[50px] flex-shrink-0 rounded-md object-cover ring-1 ring-black/5"
                  style={{ borderLeft: `3px solid ${color}` }}
                />
              ) : (
                <div
                  className="h-[50px] w-[50px] flex-shrink-0 rounded-md"
                  style={{ background: color, opacity: 0.2 }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-secondary">{item.title}</p>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-prm-offwhite">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${widthPct}%`, background: color }}
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-right">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {item.total_picks} picks · {item.first_place_count} #1
                </span>
                <span className="w-10 text-right font-mono text-sm font-semibold text-secondary">
                  {item.borda_score}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap gap-3 border-t pt-4">
        {Object.entries(CATEGORY_COLORS)
          .filter(([k]) => k !== "default")
          .map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-1.5 text-xs capitalize text-muted-foreground">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: color }}
              />
              {cat}
            </span>
          ))}
      </div>
    </div>
  );
}
