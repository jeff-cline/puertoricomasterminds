// lib/futures/queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export async function listFutureExcursions() {
  const supabase = await getServerSupabase();
  const { data, error } = await (supabase as any)
    .from("future_excursions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}
