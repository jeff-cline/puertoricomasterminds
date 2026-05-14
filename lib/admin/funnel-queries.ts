// lib/admin/funnel-queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export type TouristFunnelRow = {
  card_clicks: number;
  gate_views: number;
  gate_yes: number;
  gate_no: number;
  rank_submits: number;
  book_clicks: number;
};

export type GateConversionRow = {
  origin: string | null;
  views: number;
  yes_count: number;
  no_count: number;
};

export async function getTouristFunnel(): Promise<TouristFunnelRow> {
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any).from("v_tourist_funnel").select("*").maybeSingle();
  return (data as TouristFunnelRow | null) ?? { card_clicks: 0, gate_views: 0, gate_yes: 0, gate_no: 0, rank_submits: 0, book_clicks: 0 };
}

export async function getGateConversion(): Promise<GateConversionRow[]> {
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any).from("v_gate_conversion").select("*").order("views", { ascending: false }).limit(20);
  return (data as GateConversionRow[] | null) ?? [];
}
