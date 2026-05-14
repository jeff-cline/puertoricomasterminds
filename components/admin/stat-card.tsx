// components/admin/stat-card.tsx
import type { ReactNode } from "react";

export function StatCard({
  label, value, sub, icon,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon && <div className="text-prm-teal">{icon}</div>}
      </div>
      <p className="mt-2 font-jakarta text-3xl font-bold text-secondary">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
