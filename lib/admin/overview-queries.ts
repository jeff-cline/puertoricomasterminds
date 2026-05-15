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

// ─────────────────────────────────────────────────────────────────────────────
// NEW: Dashboard sales-engine queries
// ─────────────────────────────────────────────────────────────────────────────

export interface DayPoint {
  day: string;   // ISO date string "YYYY-MM-DD"
  value: number;
}

export interface KpiSparklineData {
  leads30d: DayPoint[];
  gateYes30d: DayPoint[];
  rankings30d: DayPoint[];
  realEstate30d: DayPoint[];
  totalLeads30d: number;
  totalGateYes: number;
  totalRankings: number;
  totalRealEstate: number;
  prevLeads30d: number;
  prevGateYes: number;
  prevRankings: number;
  prevRealEstate: number;
}

/** 30-day daily sparklines for the 4 KPI cards */
export async function getKpiSparklines(): Promise<KpiSparklineData> {
  const supabase = await getServerSupabase();
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * 86_400_000);
  const d60 = new Date(now.getTime() - 60 * 86_400_000);

  // Generate a zero-filled 30-day series map helper
  const emptyMap = (): Record<string, number> => {
    const m: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86_400_000);
      m[d.toISOString().slice(0, 10)] = 0;
    }
    return m;
  };

  // --- Leads sparkline (last 30d) ---
  const { data: leadsRaw } = await (supabase as any)
    .from("leads")
    .select("created_at")
    .gte("created_at", d30.toISOString());

  const leadsMap = emptyMap();
  for (const r of (leadsRaw ?? []) as { created_at: string }[]) {
    const day = r.created_at.slice(0, 10);
    if (day in leadsMap) leadsMap[day]++;
  }
  const leads30d: DayPoint[] = Object.entries(leadsMap).map(([day, value]) => ({ day, value }));

  // --- Gate YES sparkline ---
  const { data: gateRaw } = await (supabase as any)
    .from("events")
    .select("created_at")
    .eq("event_type", "gate_yes")
    .gte("created_at", d30.toISOString());

  const gateMap = emptyMap();
  for (const r of (gateRaw ?? []) as { created_at: string }[]) {
    const day = r.created_at.slice(0, 10);
    if (day in gateMap) gateMap[day]++;
  }
  const gateYes30d: DayPoint[] = Object.entries(gateMap).map(([day, value]) => ({ day, value }));

  // --- Rankings sparkline ---
  const { data: rankRaw } = await (supabase as any)
    .from("rankings")
    .select("created_at")
    .gte("created_at", d30.toISOString());

  const rankMap = emptyMap();
  for (const r of (rankRaw ?? []) as { created_at: string }[]) {
    const day = r.created_at.slice(0, 10);
    if (day in rankMap) rankMap[day]++;
  }
  const rankings30d: DayPoint[] = Object.entries(rankMap).map(([day, value]) => ({ day, value }));

  // --- Real estate leads sparkline ---
  const { data: reRaw } = await (supabase as any)
    .from("leads")
    .select("created_at")
    .eq("funnel", "real_estate")
    .gte("created_at", d30.toISOString());

  const reMap = emptyMap();
  for (const r of (reRaw ?? []) as { created_at: string }[]) {
    const day = r.created_at.slice(0, 10);
    if (day in reMap) reMap[day]++;
  }
  const realEstate30d: DayPoint[] = Object.entries(reMap).map(([day, value]) => ({ day, value }));

  // Totals
  const totalLeads30d = (leadsRaw ?? []).length;
  const totalGateYes = (gateRaw ?? []).length;
  const totalRankings = (rankRaw ?? []).length;
  const totalRealEstate = (reRaw ?? []).length;

  // Previous period (30-60d ago)
  const [prevLeadsRes, prevGateRes, prevRankRes, prevReRes] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true })
      .gte("created_at", d60.toISOString()).lt("created_at", d30.toISOString()),
    (supabase as any).from("events").select("*", { count: "exact", head: true })
      .eq("event_type", "gate_yes")
      .gte("created_at", d60.toISOString()).lt("created_at", d30.toISOString()),
    (supabase as any).from("rankings").select("*", { count: "exact", head: true })
      .gte("created_at", d60.toISOString()).lt("created_at", d30.toISOString()),
    supabase.from("leads").select("*", { count: "exact", head: true })
      .eq("funnel", "real_estate")
      .gte("created_at", d60.toISOString()).lt("created_at", d30.toISOString()),
  ]);

  return {
    leads30d,
    gateYes30d,
    rankings30d,
    realEstate30d,
    totalLeads30d,
    totalGateYes,
    totalRankings,
    totalRealEstate,
    prevLeads30d: prevLeadsRes.count ?? 0,
    prevGateYes: prevGateRes.count ?? 0,
    prevRankings: prevRankRes.count ?? 0,
    prevRealEstate: prevReRes.count ?? 0,
  };
}

export interface FunnelStage {
  name: string;
  value: number;
  fill: string;
}

/** 6-stage conversion funnel */
export async function getFunnelStages(): Promise<FunnelStage[]> {
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any).from("v_tourist_funnel").select("*").maybeSingle();
  const d = data ?? { card_clicks: 0, gate_views: 0, gate_yes: 0, gate_no: 0, rank_submits: 0, book_clicks: 0 };

  return [
    { name: "Card Views", value: d.card_clicks,  fill: "#0FB5BA" },
    { name: "Gate Views", value: d.gate_views,   fill: "#0EA5A9" },
    { name: "Gate YES",   value: d.gate_yes,     fill: "#FF7A45" },
    { name: "Survey",     value: d.rank_submits, fill: "#E86A3A" },
    { name: "Rank Submit",value: d.rank_submits, fill: "#C15A30" },
    { name: "BOOK Click", value: d.book_clicks,  fill: "#9A4B26" },
  ];
}

export interface ComingSoonItem {
  id: string;
  title: string;
  borda_score: number;
  total_picks: number;
  first_place_count: number;
  category?: string;
  image_url?: string;
}

/** Full leaderboard for coming-soon chart, joined with image_url */
export async function getComingSoonLeaderboard(): Promise<ComingSoonItem[]> {
  const supabase = await getServerSupabase();
  const [boardRes, imgRes] = await Promise.all([
    (supabase as any).from("v_future_excursion_leaderboard").select("*"),
    (supabase as any).from("future_excursions").select("id, image_url, category"),
  ]);
  const imgs = ((imgRes.data ?? []) as { id: string; image_url: string; category: string | null }[])
    .reduce<Record<string, { image_url: string; category: string | null }>>((acc, r) => {
      acc[r.id] = { image_url: r.image_url, category: r.category };
      return acc;
    }, {});
  return ((boardRes.data ?? []) as ComingSoonItem[]).map((row) => ({
    ...row,
    image_url: imgs[row.id]?.image_url,
    category: row.category ?? imgs[row.id]?.category ?? undefined,
  }));
}

export interface CruisePaxDonut {
  name: string;
  value: number;
  fill: string;
}

export interface CruisePaxDay {
  day: string;
  mega_family: number;
  premium_mainstream: number;
  luxury: number;
  fun_ships: number;
}

const DEMO_COLORS: Record<string, string> = {
  mega_family: "#0FB5BA",
  premium_mainstream: "#FF7A45",
  luxury: "#9B59B6",
  fun_ships: "#F39C12",
};

/** Donut data for today's cruise pax mix */
export async function getCruisePaxBreakdown(date: string): Promise<CruisePaxDonut[]> {
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any)
    .from("daily_port_calls")
    .select("demo_segment")
    .eq("call_date", date);

  const counts: Record<string, number> = {
    mega_family: 0, premium_mainstream: 0, luxury: 0, fun_ships: 0,
  };
  for (const r of (data ?? []) as { demo_segment: string }[]) {
    if (r.demo_segment in counts) counts[r.demo_segment]++;
  }

  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: v,
      fill: DEMO_COLORS[k] ?? "#888",
    }));
}

/** Stacked bar data — cruise pax calls over last N days */
export async function getCruisePaxOverTime(days: number): Promise<CruisePaxDay[]> {
  const supabase = await getServerSupabase();
  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
  const { data } = await (supabase as any)
    .from("daily_port_calls")
    .select("call_date, demo_segment")
    .gte("call_date", since)
    .order("call_date", { ascending: true });

  const map: Record<string, CruisePaxDay> = {};
  for (const r of (data ?? []) as { call_date: string; demo_segment: string }[]) {
    if (!map[r.call_date]) {
      map[r.call_date] = { day: r.call_date, mega_family: 0, premium_mainstream: 0, luxury: 0, fun_ships: 0 };
    }
    const seg = r.demo_segment as keyof CruisePaxDay;
    if (seg in map[r.call_date]) (map[r.call_date][seg] as number)++;
  }
  return Object.values(map);
}

export interface TrendingExcursion {
  excursion_id: string;
  title: string;
  category: string | null;
  image_url: string;
  current: number;
  previous: number;
  delta: number;
}

/** Top 10 trending excursions with WoW delta */
export async function getTrendingExcursions(days: number = 30): Promise<TrendingExcursion[]> {
  const supabase = await getServerSupabase();
  const now = Date.now();
  const sinceA = new Date(now - days * 86_400_000).toISOString();
  const sinceB = new Date(now - 2 * days * 86_400_000).toISOString();

  const [curRes, prevRes, excRes] = await Promise.all([
    (supabase as any)
      .from("events")
      .select("entity_id")
      .eq("event_type", "card_click")
      .eq("entity_type", "excursion")
      .gte("created_at", sinceA),
    (supabase as any)
      .from("events")
      .select("entity_id")
      .eq("event_type", "card_click")
      .eq("entity_type", "excursion")
      .gte("created_at", sinceB)
      .lt("created_at", sinceA),
    supabase
      .from("excursions")
      .select("id, title, category, image_url")
      .eq("is_active", true),
  ]);

  const curMap: Record<string, number> = {};
  for (const r of (curRes.data ?? []) as { entity_id: string }[]) {
    curMap[r.entity_id] = (curMap[r.entity_id] ?? 0) + 1;
  }
  const prevMap: Record<string, number> = {};
  for (const r of (prevRes.data ?? []) as { entity_id: string }[]) {
    prevMap[r.entity_id] = (prevMap[r.entity_id] ?? 0) + 1;
  }

  const excursions = (excRes.data ?? []) as { id: string; title: string; category: string | null; image_url: string }[];

  // If we have click data, sort by current clicks. Otherwise sort by sort_order proxy
  // (use the first 10 active excursions) so the empty state still shows thumbnails.
  const sorted = excursions
    .map((e) => ({
      excursion_id: e.id,
      title: e.title,
      category: e.category,
      image_url: e.image_url,
      current: curMap[e.id] ?? 0,
      previous: prevMap[e.id] ?? 0,
      delta: (curMap[e.id] ?? 0) - (prevMap[e.id] ?? 0),
    }))
    .sort((a, b) => b.current - a.current);

  return sorted.slice(0, 10);
}

export interface ActivityItem {
  id: string;
  created_at: string;
  event_type: string;
  entity_type: string | null;
  payload: Record<string, unknown>;
  funnel?: string;
  label: string;
}

const FRIENDLY: Record<string, string> = {
  gate_yes: "Gate YES — visitor entered funnel",
  gate_no: "Gate NO — visitor exited",
  gate_view: "Gate view",
  card_click: "Excursion card clicked",
  rank_submit: "Coming Soon ranking submitted",
  book_button_click: "BOOK button clicked → Viator",
  survey_complete: "Survey completed",
};

/** Last N activity events with human-readable labels */
export async function getLiveActivity(limit: number = 20): Promise<ActivityItem[]> {
  const supabase = await getServerSupabase();

  // Recent leads
  const { data: leadsData } = await (supabase as any)
    .from("leads")
    .select("id, created_at, funnel, payload")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Recent events
  const { data: eventsData } = await (supabase as any)
    .from("events")
    .select("id, created_at, event_type, entity_type, payload")
    .order("created_at", { ascending: false })
    .limit(limit * 2);

  const leadItems: ActivityItem[] = (leadsData ?? []).map((l: any) => ({
    id: `lead-${l.id}`,
    created_at: l.created_at,
    event_type: "lead_captured",
    entity_type: "lead",
    payload: l.payload ?? {},
    funnel: l.funnel,
    label: `Lead captured — ${l.funnel?.replace(/_/g, " ") ?? "unknown"} funnel`,
  }));

  const eventItems: ActivityItem[] = ((eventsData ?? []) as any[]).map((e) => ({
    id: `event-${e.id}`,
    created_at: e.created_at,
    event_type: e.event_type,
    entity_type: e.entity_type ?? null,
    payload: e.payload ?? {},
    label: FRIENDLY[e.event_type] ?? e.event_type,
  }));

  return [...leadItems, ...eventItems]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

/** Port calls for today + pax count estimate */
export interface TodayPortCall {
  ship_name: string;
  cruise_line: string;
  call_type: string;
  demo_segment: string;
}

export async function getTodayPortCalls(): Promise<TodayPortCall[]> {
  const supabase = await getServerSupabase();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await (supabase as any)
    .from("daily_port_calls")
    .select("ship_name, cruise_line, call_type, demo_segment")
    .eq("call_date", today);
  return (data ?? []) as TodayPortCall[];
}
