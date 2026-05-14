// lib/admin/overview-queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

type TopExcursionRow = { excursion_id: string; title: string; clicks: number };
type TopConceptRow = { id: string; title: string; borda_score: number };

export async function getOverviewStats() {
  const supabase = await getServerSupabase();
  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now.getTime() - 7 * 86_400_000);
  const startOfMonth = new Date(now.getTime() - 30 * 86_400_000);

  const counts = async (since: Date, funnel?: string) => {
    let q = supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", since.toISOString());
    if (funnel) q = q.eq("funnel", funnel);
    const { count } = await q;
    return count ?? 0;
  };

  const [
    leadsToday, leadsWeek, leadsMonth,
    touristToday, mindsToday, realEstateToday,
  ] = await Promise.all([
    counts(startOfDay), counts(startOfWeek), counts(startOfMonth),
    counts(startOfDay, "tourist"), counts(startOfDay, "masterminds"), counts(startOfDay, "real_estate"),
  ]);

  const { data: topExcursions } = await (supabase as any)
    .from("v_top_excursions_30d").select("*").limit(5);
  const { data: topConcepts } = await (supabase as any)
    .from("v_future_excursion_leaderboard").select("*").limit(5);

  return {
    leadsToday, leadsWeek, leadsMonth,
    touristToday, mindsToday, realEstateToday,
    topExcursions: (topExcursions ?? []) as TopExcursionRow[],
    topConcepts: (topConcepts ?? []) as TopConceptRow[],
  };
}
