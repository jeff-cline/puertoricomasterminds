import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export async function seedShips() {
  const supabase = getServiceRoleSupabase();
  // stub — populated in Task K5
  console.log("  (ships seed stub — populated in Task K5)");
}
