"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
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

  const data = items.map((item) => ({
    title: item.title.length > 28 ? item.title.slice(0, 26) + "…" : item.title,
    fullTitle: item.title,
    score: item.borda_score,
    picks: item.total_picks,
    first: item.first_place_count,
    category: item.category,
  }));

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height={Math.max(300, data.length * 36)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 80, left: 8, bottom: 4 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="title"
              width={160}
              tick={{ fontSize: 12, fill: "#0A2540" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-white p-3 shadow-lg text-sm">
                    <p className="font-semibold text-secondary">{d.fullTitle}</p>
                    <p className="text-muted-foreground mt-1">Borda score: <b>{d.score}</b></p>
                    <p className="text-muted-foreground">Total picks: {d.picks}</p>
                    <p className="text-muted-foreground">#1 votes: {d.first}</p>
                    {d.category && (
                      <p className="text-muted-foreground capitalize">Category: {d.category}</p>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((entry, i) => (
                <Cell key={i} fill={catColor(entry.category)} />
              ))}
              <LabelList
                dataKey="score"
                position="right"
                style={{ fontSize: "12px", fill: "#6B7280", fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(CATEGORY_COLORS)
          .filter(([k]) => k !== "default")
          .map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
