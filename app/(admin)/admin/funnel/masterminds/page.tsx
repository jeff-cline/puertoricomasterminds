// app/(admin)/admin/funnel/masterminds/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { StatCard } from "@/components/admin/stat-card";

async function getMastermindsFunnel() {
  const supabase = await getServerSupabase();
  const { count: rankSubmits } = await supabase
    .from("rankings").select("*", { count: "exact", head: true }).eq("funnel", "masterminds");
  const { count: leads } = await supabase
    .from("leads").select("*", { count: "exact", head: true }).eq("funnel", "masterminds");
  // Card clicks for masterminds aren't tracked yet (no card click handler on /masterminds);
  // we use lead count as the funnel entry point for now.
  return { leads: leads ?? 0, rank_submits: rankSubmits ?? 0 };
}

async function getMastermindsGateConv() {
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from("v_gate_conversion")
    .select("*")
    .like("origin", "masterminds:%")
    .order("views", { ascending: false });
  return data ?? [];
}

export default async function MastermindsFunnelPage() {
  const f = await getMastermindsFunnel();
  const conv = await getMastermindsGateConv();
  const pct = (n: number, base: number) => (base > 0 ? `${Math.round((n / base) * 100)}%` : "—");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Masterminds Funnel</h1>
        <p className="mt-1 text-muted-foreground">Resident funnel — masterminds discovery to ranked picks.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Masterminds leads" value={f.leads} />
        <StatCard label="Rank submits" value={f.rank_submits} sub={pct(f.rank_submits, f.leads) + " of leads"} />
        <StatCard label="Origins tracked" value={conv.length} />
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h3 className="mb-3 font-semibold text-secondary">Gate conversion by mastermind</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4">Mastermind</th>
                <th className="py-2 pr-4">Views</th>
                <th className="py-2 pr-4">Yes</th>
                <th className="py-2 pr-4">No</th>
                <th className="py-2">Yes rate</th>
              </tr>
            </thead>
            <tbody>
              {conv.map((row) => (
                <tr key={row.origin ?? "(none)"} className="border-b">
                  <td className="py-2 pr-4 text-secondary">{row.origin?.replace("masterminds:", "") ?? "(unknown)"}</td>
                  <td className="py-2 pr-4 font-mono">{row.views}</td>
                  <td className="py-2 pr-4 font-mono">{row.yes_count}</td>
                  <td className="py-2 pr-4 font-mono">{row.no_count}</td>
                  <td className="py-2 font-mono">{pct(row.yes_count, row.views)}</td>
                </tr>
              ))}
              {conv.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No mastermind gate views yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
