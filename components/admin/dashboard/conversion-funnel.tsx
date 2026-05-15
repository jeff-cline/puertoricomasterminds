"use client";

import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { FunnelStage } from "@/lib/admin/overview-queries";

interface ConversionFunnelProps {
  stages: FunnelStage[];
}

const COLORS = ["#0FB5BA", "#0EA0A5", "#FF7A45", "#E86A3A", "#D05A30", "#B84A26"];

function pct(val: number, total: number) {
  if (total === 0) return "—";
  return `${((val / total) * 100).toFixed(1)}%`;
}

export function ConversionFunnel({ stages }: ConversionFunnelProps) {
  const total = stages[0]?.value ?? 0;
  const isEmpty = total === 0;

  if (isEmpty) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border bg-white p-6 shadow-sm">
        <div className="text-center">
          <p className="text-2xl">📊</p>
          <p className="mt-2 font-semibold text-secondary">Awaiting visitor data</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Funnel will populate as visitors interact with the site.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <ResponsiveContainer width="100%" height={280}>
            <FunnelChart>
              <Tooltip
                formatter={(value, name) => [
                  `${Number(value).toLocaleString()} (${pct(Number(value), total)})`,
                  name,
                ]}
                contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
              />
              <Funnel dataKey="value" data={stages} isAnimationActive={false}>
                {stages.map((s, i) => (
                  <Cell key={s.name} fill={COLORS[i] ?? "#888"} />
                ))}
                <LabelList
                  dataKey="name"
                  position="right"
                  style={{ fontSize: "12px", fill: "#0A2540", fontWeight: 500 }}
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>

        {/* Stage table */}
        <div className="flex flex-col justify-center gap-2">
          {stages.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: COLORS[i] ?? "#888" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-secondary">{s.name}</span>
                  <span className="font-mono text-sm text-muted-foreground">
                    {s.value.toLocaleString()}
                  </span>
                </div>
                <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct(s.value, total).replace("%", "")}%`,
                      background: COLORS[i] ?? "#888",
                    }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {pct(s.value, total)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
