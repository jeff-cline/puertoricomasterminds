// lib/masterminds/queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export async function listMasterminds() {
  const supabase = await getServerSupabase();
  const { data, error } = await (supabase as any)
    .from("masterminds")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getMastermindBySlug(slug: string) {
  const supabase = await getServerSupabase();
  const { data, error } = await (supabase as any)
    .from("masterminds")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
