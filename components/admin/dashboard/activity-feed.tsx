"use client";

import type { ActivityItem } from "@/lib/admin/overview-queries";

const EVENT_ICONS: Record<string, string> = {
  lead_captured: "👤",
  gate_yes: "✅",
  gate_no: "❌",
  gate_view: "👁️",
  card_click: "🖱️",
  rank_submit: "🗳️",
  book_button_click: "📗",
  survey_complete: "📋",
};

const FUNNEL_COLORS: Record<string, string> = {
  tourist: "#0FB5BA",
  masterminds: "#9B59B6",
  real_estate: "#27AE60",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface ActivityFeedProps {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center text-center rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-2xl">💤</p>
        <p className="mt-2 font-semibold text-secondary">No activity yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Events will appear here as visitors interact with the site.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="font-semibold text-secondary">Live Activity</h4>
          <span className="ml-auto text-xs text-muted-foreground">{items.length} recent events</span>
        </div>
      </div>

      <ul className="divide-y max-h-[480px] overflow-y-auto">
        {items.map((item) => {
          const funnelColor = item.funnel ? FUNNEL_COLORS[item.funnel] : undefined;
          return (
            <li
              key={item.id}
              className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="mt-0.5 shrink-0 text-base">
                {EVENT_ICONS[item.event_type] ?? "📌"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-secondary leading-snug">{item.label}</p>
                {item.funnel && (
                  <span
                    className="inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                    style={{ background: funnelColor ?? "#6B7280" }}
                  >
                    {item.funnel.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                {timeAgo(item.created_at)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
