import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export async function seedFutureExcursions() {
  const supabase = getServiceRoleSupabase();
  // stub — populated in Task E5
  console.log("  (future-excursions seed stub — populated in Task E5)");
}
