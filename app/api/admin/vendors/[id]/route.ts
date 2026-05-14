// app/api/admin/vendors/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/roles";

async function gate() {
  const user = await getCurrentAdminUser();
  if (!user || !can(user.role, "write:cms")) return null;
  return user;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await gate())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();
  const supabase = await getServerSupabase();
  const { error } = await (supabase as any).from("vendors").update(body).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  if (!(await gate())) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await ctx.params;
  const supabase = await getServerSupabase();
  const { error } = await (supabase as any).from("vendors").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
