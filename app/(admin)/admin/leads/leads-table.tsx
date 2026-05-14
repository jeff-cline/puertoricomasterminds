// app/(admin)/admin/leads/leads-table.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Row {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  funnel: string;
  source_origin: string | null;
  cruise_ship: string | null;
  coupon_code: string | null;
  created_at: string;
}

function redactEmail(e: string): string {
  const [a, b] = e.split("@");
  return `${a[0]}***@${b[0]}***.${b.split(".").pop()}`;
}

export function LeadsTable({ rows, canSeePii, initialFunnel, initialQuery }: {
  rows: Row[]; canSeePii: boolean; initialFunnel: string; initialQuery: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [funnel, setFunnel] = useState(initialFunnel);

  function applyFilters() {
    const sp = new URLSearchParams();
    if (funnel !== "all") sp.set("funnel", funnel);
    if (q) sp.set("q", q);
    router.push(`/admin/leads?${sp.toString()}`);
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search email or name" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
        <Select value={funnel} onValueChange={(v) => setFunnel(v ?? "all")}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All funnels</SelectItem>
            <SelectItem value="tourist">Tourist</SelectItem>
            <SelectItem value="masterminds">Masterminds</SelectItem>
            <SelectItem value="real_estate">Real Estate</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={applyFilters}>Apply</Button>
        <a href={`/api/exports/leads?funnel=${funnel}${q ? `&q=${encodeURIComponent(q)}` : ""}`} target="_blank" rel="noopener">
          <Button variant="outline">Export CSV</Button>
        </a>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Funnel</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Cruise ship</th>
              <th className="px-4 py-2">Coupon</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="px-4 py-2 font-mono text-xs">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-4 py-2">{r.funnel}</td>
                <td className="px-4 py-2">{canSeePii ? `${r.first_name ?? ""} ${r.last_name ?? ""}` : `${(r.first_name ?? "")[0] ?? ""}.`}</td>
                <td className="px-4 py-2">{canSeePii ? r.email : redactEmail(r.email)}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.source_origin ?? "—"}</td>
                <td className="px-4 py-2 text-muted-foreground">{r.cruise_ship ?? "—"}</td>
                <td className="px-4 py-2 font-mono">{r.coupon_code ?? "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No leads match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
