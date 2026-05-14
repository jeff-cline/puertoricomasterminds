import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (!password || typeof password !== "string" || password.length < 12) {
    return NextResponse.json({ error: "password too short" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "not authenticated" }, { status: 401 });

  // Update auth password via the user's own session
  const { error: pwErr } = await supabase.auth.updateUser({ password });
  if (pwErr) return NextResponse.json({ error: pwErr.message }, { status: 400 });

  // Clear the force_password_change flag using service-role (RLS would otherwise require self-update policy)
  const admin = getServiceRoleSupabase();
  await (admin
    .from("users")
    .update({ force_password_change: false, last_login_at: new Date().toISOString() })
    .eq("id", user.id) as any);

  return NextResponse.json({ ok: true });
}
