"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { DayPoint } from "@/lib/admin/overview-queries";

interface KpiCardProps {
  label: string;
  value: number;
  previousValue: number;
  data: DayPoint[];
  color: string;
  prefix?: string;
  suffix?: string;
  description?: string;
}

function deltaArrow(current: number, previous: number) {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { pct: null, up: true };
  const pct = ((current - previous) / previous) * 100;
  return { pct: Math.abs(pct).toFixed(0), up: pct >= 0 };
}

export function KpiCard({
  label,
  value,
  previousValue,
  data,
  color,
  prefix = "",
  suffix = "",
  description,
}: KpiCardProps) {
  const arrow = deltaArrow(value, previousValue);
  const chartData = data.map((d) => ({ v: d.value }));
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm flex flex-col gap-2">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="font-jakarta text-4xl font-bold text-secondary leading-none">
            {prefix}{value.toLocaleString()}{suffix}
          </p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {arrow && (
          <span
            className={`mb-1 flex items-center gap-0.5 text-sm font-semibold ${
              arrow.up ? "text-emerald-600" : "text-rose-500"
            }`}
          >
            {arrow.up ? "▲" : "▼"}
            {arrow.pct ? `${arrow.pct}%` : "new"}
          </span>
        )}
      </div>

      {/* Sparkline */}
      <div className="h-12 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
              <defs>
                <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${color.replace("#", "")})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center">
            <div className="h-0.5 w-full rounded" style={{ background: `${color}33` }} />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">vs prev 30d: {previousValue}</p>
    </div>
  );
}
