// lib/admin/funnel-queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export async function getTouristFunnel() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.from("v_tourist_funnel").select("*").maybeSingle();
  return data ?? { card_clicks: 0, gate_views: 0, gate_yes: 0, gate_no: 0, rank_submits: 0, book_clicks: 0 };
}

export async function getGateConversion() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.from("v_gate_conversion").select("*").order("views", { ascending: false }).limit(20);
  return data ?? [];
}
