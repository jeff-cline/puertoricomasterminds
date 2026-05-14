// app/(admin)/admin/funnel/tourist/page.tsx
import { getTouristFunnel, getGateConversion } from "@/lib/admin/funnel-queries";
import { StatCard } from "@/components/admin/stat-card";

export default async function TouristFunnelPage() {
  const f = await getTouristFunnel();
  const conv = await getGateConversion();

  const pct = (n: number, base: number) => (base > 0 ? `${Math.round((n / base) * 100)}%` : "—");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Tourist Funnel</h1>
        <p className="mt-1 text-muted-foreground">Step-by-step conversion across the excursion funnel.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Card clicks" value={f.card_clicks} />
        <StatCard label="Gate views" value={f.gate_views} sub={pct(f.gate_views, f.card_clicks) + " of clicks"} />
        <StatCard label="Gate YES" value={f.gate_yes} sub={pct(f.gate_yes, f.gate_views) + " of views"} />
        <StatCard label="Gate NO" value={f.gate_no} sub={pct(f.gate_no, f.gate_views) + " of views"} />
        <StatCard label="Rank submits" value={f.rank_submits} sub={pct(f.rank_submits, f.gate_yes) + " of YES"} />
        <StatCard label="Book clicks" value={f.book_clicks} />
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold text-secondary">Gate conversion by origin</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Origin</th>
                <th className="py-2 pr-4">Views</th>
                <th className="py-2 pr-4">Yes</th>
                <th className="py-2 pr-4">No</th>
                <th className="py-2">Yes rate</th>
              </tr>
            </thead>
            <tbody>
              {conv.map((row) => (
                <tr key={row.origin ?? "(none)"} className="border-b">
                  <td className="py-2 pr-4 text-secondary">{row.origin ?? "(unknown)"}</td>
                  <td className="py-2 pr-4 font-mono">{row.views}</td>
                  <td className="py-2 pr-4 font-mono">{row.yes_count}</td>
                  <td className="py-2 pr-4 font-mono">{row.no_count}</td>
                  <td className="py-2 font-mono">{pct(row.yes_count, row.views)}</td>
                </tr>
              ))}
              {conv.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No gate views yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
