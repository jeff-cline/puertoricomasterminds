"use client";

import type { ComingSoonItem, TrendingExcursion } from "@/lib/admin/overview-queries";

// ── Coming-Soon podium ────────────────────────────────────────────────────────

const PODIUM_SIZES = [
  // 1st place
  { ring: "ring-2 ring-yellow-400", badge: "bg-yellow-400 text-yellow-900", label: "1st", titleSize: "text-sm font-bold", thumbSize: "h-24 w-24" },
  // 2nd place
  { ring: "ring-2 ring-slate-300", badge: "bg-slate-300 text-slate-700", label: "2nd", titleSize: "text-xs font-semibold", thumbSize: "h-20 w-20" },
  // 3rd place
  { ring: "ring-2 ring-amber-600", badge: "bg-amber-600 text-white", label: "3rd", titleSize: "text-xs font-semibold", thumbSize: "h-20 w-20" },
] as const;

export function ComingSoonPodium({ items }: { items: ComingSoonItem[] }) {
  const top3 = items.slice(0, 3);
  if (top3.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">No ranking data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Top 3 Coming Soon
      </p>
      <ol className="space-y-3">
        {top3.map((item, idx) => {
          const p = PODIUM_SIZES[idx] ?? PODIUM_SIZES[2];
          return (
            <li key={item.id} className="flex items-center gap-3">
              {/* Rank badge */}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${p.badge}`}
              >
                {p.label}
              </span>

              {/* Thumbnail */}
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt=""
                  loading="lazy"
                  className={`${p.thumbSize} shrink-0 rounded-lg object-cover ${p.ring}`}
                />
              ) : (
                <div
                  className={`${p.thumbSize} shrink-0 rounded-lg bg-prm-offwhite ${p.ring}`}
                />
              )}

              {/* Details */}
              <div className="min-w-0 flex-1">
                <p className={`truncate text-secondary ${p.titleSize}`}>{item.title}</p>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span>Borda <b className="text-secondary">{item.borda_score}</b></span>
                  <span>{item.total_picks} picks</span>
                  <span>{item.first_place_count} #1 votes</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Trending podium ───────────────────────────────────────────────────────────

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const up = delta > 0;
  return (
    <span className={`text-xs font-semibold ${up ? "text-emerald-600" : "text-rose-500"}`}>
      {up ? "▲" : "▼"} {Math.abs(delta)}
    </span>
  );
}

export function TrendingPodium({ items }: { items: TrendingExcursion[] }) {
  const top3 = items.slice(0, 3);
  if (top3.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">No click data yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Top 3 Trending Excursions
      </p>
      <ol className="space-y-3">
        {top3.map((item, idx) => {
          const p = PODIUM_SIZES[idx] ?? PODIUM_SIZES[2];
          return (
            <li key={item.excursion_id} className="flex items-center gap-3">
              {/* Rank badge */}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${p.badge}`}
              >
                {p.label}
              </span>

              {/* Thumbnail */}
              <img
                src={item.image_url}
                alt=""
                loading="lazy"
                className={`${p.thumbSize} shrink-0 rounded-lg object-cover ${p.ring}`}
              />

              {/* Details */}
              <div className="min-w-0 flex-1">
                <p className={`truncate text-secondary ${p.titleSize}`}>{item.title}</p>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span><b className="text-secondary">{item.current}</b> clicks (30d)</span>
                  <DeltaBadge delta={item.delta} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Combined section exported as default ──────────────────────────────────────

export function LeaderboardPodium({
  comingSoon,
  trending,
}: {
  comingSoon: ComingSoonItem[];
  trending: TrendingExcursion[];
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-jakarta text-xl font-bold text-secondary">
          Today&apos;s Leaderboard
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Top 3 coming-soon votes and trending excursion clicks
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-semibold text-secondary">
            🏆 Top 3 Coming Soon
          </p>
          <ComingSoonPodium items={comingSoon} />
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-secondary">
            🔥 Top 3 Trending Excursions
          </p>
          <TrendingPodium items={trending} />
        </div>
      </div>
    </section>
  );
}
