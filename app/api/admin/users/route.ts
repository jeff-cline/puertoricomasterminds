// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

function generateTempPassword(): string {
  // Easy-to-read mix of letters/digits + a fixed special
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let body = "";
  for (let i = 0; i < 10; i++) body += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `PRM!${body}`;
}

export async function POST(req: NextRequest) {
  const me = await getCurrentAdminUser();
  if (!me || me.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { email, full_name, role } = await req.json();
  if (!email || !role) return NextResponse.json({ error: "missing email or role" }, { status: 400 });

  const supabase = getServiceRoleSupabase();
  const tempPw = generateTempPassword();
  const { data, error } = await supabase.auth.admin.createUser({
    email, password: tempPw, email_confirm: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { error: upsertErr } = await (supabase as any).from("users").upsert({
    id: data.user.id, email, full_name, role,
    force_password_change: true, is_active: true, invited_by: me.id, invited_at: new Date().toISOString(),
  });
  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

  await (supabase as any).from("audit_log").insert({
    actor_user_id: me.id, action: "create_user", entity_type: "user", entity_id: data.user.id,
    after_value: { email, role },
  });

  return NextResponse.json({ ok: true, temp_password: tempPw });
}
