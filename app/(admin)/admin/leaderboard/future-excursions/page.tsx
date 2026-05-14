// app/(admin)/admin/leaderboard/future-excursions/page.tsx
import { getFutureExcursionLeaderboard } from "@/lib/admin/leaderboard-queries";

export default async function FutureExcursionsLeaderboardPage() {
  const rows = await getFutureExcursionLeaderboard();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Future Excursions Leaderboard</h1>
        <p className="mt-1 text-muted-foreground">
          Borda-weighted ranking score = sum of (11 − rank_position) across all submissions. Higher = more wanted.
        </p>
      </header>
      <section className="rounded-xl border bg-white p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Concept</th>
              <th className="py-2 pr-4">Total picks</th>
              <th className="py-2 pr-4">#1 votes</th>
              <th className="py-2">Borda</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any, i: number) => (
              <tr key={r.id} className="border-b">
                <td className="py-2 pr-4 font-mono">{i + 1}</td>
                <td className="py-2 pr-4 text-secondary">{r.title}</td>
                <td className="py-2 pr-4 font-mono">{r.total_picks}</td>
                <td className="py-2 pr-4 font-mono">{r.first_place_count}</td>
                <td className="py-2 font-mono font-bold text-prm-coral">{r.borda_score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
