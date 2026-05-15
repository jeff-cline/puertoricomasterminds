"use client";

import { INDUSTRY_STATS } from "@/lib/admin/industry-stats";

interface TickerItem {
  icon: string;
  text: string;
  highlight?: boolean;
}

interface HeroTickerProps {
  portCallCount: number;
  portCallShips: string[];
  leadsWeekDelta: string;
  topExcursion?: string;
  topBorda?: string;
}

export function HeroTicker({
  portCallCount,
  portCallShips,
  leadsWeekDelta,
  topExcursion,
  topBorda,
}: HeroTickerProps) {
  const dynamicItems: TickerItem[] = [];

  if (portCallCount > 0) {
    const shipList = portCallShips.slice(0, 3).join(", ");
    dynamicItems.push({
      icon: "🚢",
      text: `${portCallCount} cruise ${portCallCount === 1 ? "ship" : "ships"} in port today — ${shipList}`,
      highlight: true,
    });
  }

  if (leadsWeekDelta !== "0") {
    dynamicItems.push({
      icon: "📈",
      text: `Lead capture ${leadsWeekDelta} this period`,
      highlight: true,
    });
  }

  if (topExcursion) {
    dynamicItems.push({
      icon: "🔥",
      text: `Top excursion: ${topExcursion}`,
    });
  }

  if (topBorda) {
    dynamicItems.push({
      icon: "⭐",
      text: `Borda leader: ${topBorda}`,
    });
  }

  const staticItems: TickerItem[] = INDUSTRY_STATS.slice(0, 12).map((s) => ({
    icon: s.icon ?? "📊",
    text: `${s.value} — ${s.label} (${s.source.split("/")[0].trim()}, ${s.year})`,
  }));

  const allItems: TickerItem[] = [...dynamicItems, ...staticItems];
  // Duplicate for seamless infinite scroll
  const doubled = [...allItems, ...allItems];

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-sm"
      style={{
        background: "linear-gradient(135deg, #0A2540 0%, #0c3060 50%, #0A2540 100%)",
      }}
    >
      {/* Fade edges */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16"
        style={{ background: "linear-gradient(to right, #0A2540, transparent)" }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16"
        style={{ background: "linear-gradient(to left, #0A2540, transparent)" }}
      />

      <div className="py-4">
        {/* ticker-track animation is defined in globals.css */}
        <div className="ticker-track flex gap-10 whitespace-nowrap">
          {doubled.map((item, i) => (
            <span
              key={i}
              className="inline-flex shrink-0 items-center gap-2 text-sm font-medium"
            >
              <span className="text-base">{item.icon}</span>
              <span className={item.highlight ? "text-[#0FB5BA]" : "text-white/80"}>
                {item.text}
              </span>
              <span className="ml-4 text-white/20">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
