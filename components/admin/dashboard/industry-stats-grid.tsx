"use client";

import { INDUSTRY_STATS } from "@/lib/admin/industry-stats";

const GRAD_MAP: Record<string, string> = {
  economy:  "linear-gradient(135deg, #0FB5BA 0%, #0A8F94 100%)",
  visitors: "linear-gradient(135deg, #0A2540 0%, #1a3a60 100%)",
  cruise:   "linear-gradient(135deg, #FF7A45 0%, #C96030 100%)",
  jobs:     "linear-gradient(135deg, #27AE60 0%, #1E8449 100%)",
  act60:    "linear-gradient(135deg, #9B59B6 0%, #7D3C98 100%)",
  industry: "linear-gradient(135deg, #2980B9 0%, #1F618D 100%)",
};

// Pick 8 showcase stats
const SHOWCASE = INDUSTRY_STATS.filter((s) =>
  [
    "$18B", "7.5M", "1.4M", "91,000", "$1,009",
    "+28%", "4,000+", "43%",
  ].includes(s.value)
);

export function IndustryStatsGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {SHOWCASE.map((stat) => {
        const bg = GRAD_MAP[stat.category ?? "industry"] ?? GRAD_MAP.industry;
        return (
          <div
            key={stat.label}
            className="rounded-2xl p-5 shadow-sm text-white"
            style={{ background: bg }}
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="font-jakarta text-4xl font-extrabold leading-none">{stat.value}</p>
            {stat.delta && (
              <p className="mt-1 text-sm font-medium opacity-80">{stat.delta}</p>
            )}
            <p className="mt-2 text-sm font-semibold opacity-90 leading-tight">{stat.label}</p>
            <a
              href={stat.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-[10px] opacity-60 hover:opacity-90 transition-opacity leading-tight underline underline-offset-2"
            >
              {stat.source} · {stat.year}
            </a>
          </div>
        );
      })}
    </div>
  );
}
