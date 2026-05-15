// lib/excursions/queries.ts
import { getServerSupabase } from "@/lib/supabase/server";

export type ExcursionMode = "cruise_day" | "multi_day";

export async function listActiveExcursions(opts?: {
  mode?: ExcursionMode;
  heroOnly?: boolean;
  limit?: number;
}) {
  const supabase = await getServerSupabase();
  // cast to any — stub generated types don't include `excursions` table yet
  let q = (supabase as any)
    .from("excursions")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (opts?.heroOnly) q = q.eq("is_hero", true);
  if (opts?.mode) {
    // 'both' matches either mode
    q = q.or(`type.eq.${opts.mode},type.eq.both`);
  }
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getExcursionBySlug(slug: string) {
  const supabase = await getServerSupabase();
  // cast to any — stub generated types don't include `excursions` table yet
  const { data, error } = await (supabase as any)
    .from("excursions")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}
