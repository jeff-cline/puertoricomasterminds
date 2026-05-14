// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentAdminUser();
  if (!me || me.role !== "super_admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const { role, is_active } = await req.json();
  const supabase = getServiceRoleSupabase();

  const { data: before } = await (supabase as any).from("users").select("role, is_active").eq("id", id).maybeSingle();
  const { error } = await (supabase as any).from("users").update({ role, is_active }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await (supabase as any).from("audit_log").insert({
    actor_user_id: me.id, action: "update_user", entity_type: "user", entity_id: id,
    before_value: before, after_value: { role, is_active },
  });
  return NextResponse.json({ ok: true });
}
