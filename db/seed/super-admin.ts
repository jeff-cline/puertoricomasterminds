// db/seed/super-admin.ts
import { getServiceRoleSupabase } from "./_supabase";

const SEED_EMAIL = "jeff.cline@me.com";
const SEED_PASSWORD = "TEMP!234";
const SEED_NAME = "Jeff Cline";

export async function seedSuperAdmin() {
  const supabase = getServiceRoleSupabase();

  // 1. Check if the auth user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users.find((u) => u.email === SEED_EMAIL);

  let authUserId: string;
  if (existing) {
    authUserId = existing.id;
    console.log(`  auth user already exists: ${SEED_EMAIL}`);
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: SEED_EMAIL,
      password: SEED_PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    authUserId = data.user.id;
    console.log(`  created auth user: ${SEED_EMAIL}`);
  }

  // 2. Upsert the users row with super_admin role + force_password_change=true
  const { error: upsertErr } = await supabase
    .from("users")
    .upsert(
      {
        id: authUserId,
        email: SEED_EMAIL,
        full_name: SEED_NAME,
        role: "super_admin",
        force_password_change: true,
        is_active: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      { onConflict: "id" },
    );
  if (upsertErr) throw upsertErr;
  console.log(`  upserted users row for ${SEED_EMAIL} (force_password_change=true)`);
}
