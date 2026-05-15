"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TrendingExcursion } from "@/lib/admin/overview-queries";

const CATEGORY_COLORS: Record<string, string> = {
  water: "#0FB5BA",
  adventure: "#FF7A45",
  culinary: "#F39C12",
  art: "#9B59B6",
  culture: "#8B6F47",
  nature: "#27AE60",
  wellness: "#E91E8C",
  default: "#6B7280",
};

function catColor(cat: string | null): string {
  if (!cat) return CATEGORY_COLORS.default;
  return CATEGORY_COLORS[cat.toLowerCase().split("_")[0]] ?? CATEGORY_COLORS.default;
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const up = delta > 0;
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold ${
        up ? "text-emerald-600" : "text-rose-500"
      }`}
    >
      {up ? "▲" : "▼"} {Math.abs(delta)}
    </span>
  );
}

interface TrendingExcursionsProps {
  items: TrendingExcursion[];
}

export function TrendingExcursions({ items }: TrendingExcursionsProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-center">
          <p className="text-2xl">🏄</p>
          <p className="mt-2 font-semibold text-secondary">Awaiting click data</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Excursion trends will appear once visitors start browsing.
          </p>
        </div>
      </div>
    );
  }

  // If we have entries but no click data yet (e.g. fresh launch), still show
  // the thumbnail list so the dashboard renders rich — zeros are honest.

  const data = items.map((item) => ({
    ...item,
    shortTitle: item.title.length > 24 ? item.title.slice(0, 22) + "…" : item.title,
  }));

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart */}
        <ResponsiveContainer width="100%" height={Math.max(260, data.length * 30)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
          >
            <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="shortTitle"
              width={140}
              tick={{ fontSize: 11, fill: "#0A2540" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as TrendingExcursion & { shortTitle: string };
                return (
                  <div className="rounded-lg border bg-white p-3 shadow-lg text-sm">
                    <p className="font-semibold text-secondary">{d.title}</p>
                    <p className="text-muted-foreground mt-1">
                      Clicks (30d): <b>{d.current}</b>
                    </p>
                    <p className="text-muted-foreground">
                      Prev period: {d.previous}
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="current" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((entry, i) => (
                <Cell key={i} fill={catColor(entry.category)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Delta table with thumbnails */}
        <div className="flex flex-col gap-2 justify-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            vs. previous 30 days
          </p>
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <img
                src={item.image_url}
                alt=""
                width={50}
                height={50}
                loading="lazy"
                className="h-[50px] w-[50px] flex-shrink-0 rounded-md object-cover ring-1 ring-black/5"
                style={{ borderLeft: `3px solid ${catColor(item.category)}` }}
              />
              <span className="min-w-0 flex-1 truncate text-sm text-secondary">{item.title}</span>
              <div className="flex shrink-0 items-center gap-3">
                <span className="w-8 text-right font-mono text-sm text-muted-foreground">
                  {item.current}
                </span>
                <span className="w-12 text-right">
                  <DeltaBadge delta={item.delta} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
