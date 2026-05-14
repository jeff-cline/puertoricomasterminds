// app/api/lead/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const supabase = getServiceRoleSupabase();
  const { data, error } = await (supabase as any)
    .from("leads")
    .select("id, first_name, last_name, email, coupon_code")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(data);
}
