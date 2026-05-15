"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import type { CruisePaxDonut, CruisePaxDay } from "@/lib/admin/overview-queries";

interface CruisePaxPanelProps {
  donut: CruisePaxDonut[];
  stacked: CruisePaxDay[];
  today: string;
}

const COLORS: Record<string, string> = {
  "Mega Family": "#0FB5BA",
  "Premium Mainstream": "#FF7A45",
  "Luxury": "#9B59B6",
  "Fun Ships": "#F39C12",
};

const SEGMENT_KEYS = [
  { key: "mega_family",        label: "Mega Family",        color: "#0FB5BA" },
  { key: "premium_mainstream", label: "Premium Mainstream", color: "#FF7A45" },
  { key: "luxury",             label: "Luxury",             color: "#9B59B6" },
  { key: "fun_ships",          label: "Fun Ships",          color: "#F39C12" },
];

export function CruisePaxPanel({ donut, stacked, today }: CruisePaxPanelProps) {
  const hasDonut = donut.length > 0;
  const hasStacked = stacked.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Donut */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h4 className="mb-4 font-semibold text-secondary">
          Today&apos;s Ship Mix
          <span className="ml-2 text-xs font-normal text-muted-foreground">({today})</span>
        </h4>
        {hasDonut ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={donut}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={false}
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {donut.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.name] ?? entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
                formatter={(v) => [`${Number(v)} ships`, ""]}
              />
              <Legend
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <p className="text-2xl">⚓</p>
            <p className="mt-2 font-semibold text-secondary">No ships tagged today</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tag today&apos;s port calls under{" "}
              <span className="font-medium text-prm-teal">Port Calls</span> to see the mix.
            </p>
          </div>
        )}
      </div>

      {/* Stacked bar — last 14d */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h4 className="mb-4 font-semibold text-secondary">
          Ship calls — last 14 days
          <span className="ml-2 text-xs font-normal text-muted-foreground">by demo segment</span>
        </h4>
        {hasStacked ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stacked} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => v.slice(5)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                labelFormatter={(l) => `Date: ${l}`}
              />
              {SEGMENT_KEYS.map(({ key, label, color }) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={label}
                  stackId="a"
                  fill={color}
                  isAnimationActive={false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <p className="text-2xl">📅</p>
            <p className="mt-2 font-semibold text-secondary">No port call history yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Start tagging port calls to see 14-day trend.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
