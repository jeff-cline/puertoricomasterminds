// app/api/admin/excursions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/roles";

export async function POST(req: NextRequest) {
  const user = await getCurrentAdminUser();
  if (!user || !can(user.role, "write:cms")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();
  const supabase = await getServerSupabase();
  const { error, data } = await (supabase as any).from("excursions").insert(body).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
