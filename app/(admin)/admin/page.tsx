// app/(admin)/admin/page.tsx
import { getOverviewStats } from "@/lib/admin/overview-queries";
import { StatCard } from "@/components/admin/stat-card";

export default async function AdminOverviewPage() {
  const s = await getOverviewStats();
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Overview</h1>
        <p className="mt-1 text-muted-foreground">Live snapshot of PRM lead and click activity.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Leads today" value={s.leadsToday} />
        <StatCard label="Leads · 7d" value={s.leadsWeek} />
        <StatCard label="Leads · 30d" value={s.leadsMonth} />
        <StatCard label="Tourist · today" value={s.touristToday} />
        <StatCard label="Masterminds · today" value={s.mindsToday} />
        <StatCard label="Real estate · today" value={s.realEstateToday} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 font-semibold text-secondary">Top 5 clicked excursions (30d)</h3>
          {s.topExcursions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clicks yet.</p>
          ) : (
            <ol className="space-y-1 text-sm">
              {s.topExcursions.map((e) => (
                <li key={e.excursion_id} className="flex justify-between">
                  <span className="text-secondary">{e.title}</span>
                  <span className="font-mono text-muted-foreground">{e.clicks}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 font-semibold text-secondary">Top 5 ranked Coming Soon (Borda)</h3>
          {s.topConcepts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rankings yet.</p>
          ) : (
            <ol className="space-y-1 text-sm">
              {s.topConcepts.map((c) => (
                <li key={c.id} className="flex justify-between">
                  <span className="text-secondary">{c.title}</span>
                  <span className="font-mono text-muted-foreground">{c.borda_score}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  );
}
