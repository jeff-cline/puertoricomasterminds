// Identical to lib/supabase/admin.ts but without the `import "server-only"`
// guard, so it can be used by seed scripts run via tsx (outside Next.js).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export function getServiceRoleSupabase() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
