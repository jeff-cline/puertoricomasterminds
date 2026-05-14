// lib/admin/leaderboard-queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export async function getFutureExcursionLeaderboard() {
  const supabase = await getServerSupabase();
  const { data, error } = await (supabase as any)
    .from("v_future_excursion_leaderboard").select("*");
  if (error) throw error;
  return (data ?? []) as any[];
}

export async function getMastermindLeaderboard() {
  const supabase = await getServerSupabase();
  const { data, error } = await (supabase as any)
    .from("v_mastermind_leaderboard").select("*");
  if (error) throw error;
  return (data ?? []) as any[];
}
