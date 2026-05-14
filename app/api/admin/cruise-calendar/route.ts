// app/api/admin/cruise-calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { can } from "@/lib/auth/roles";
import { SHIPS } from "@/db/seed/ships";

export async function POST(req: NextRequest) {
  const user = await getCurrentAdminUser();
  if (!user || !can(user.role, "manage:cruise_calendar")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { call_date, ships } = await req.json();
  if (!call_date || !Array.isArray(ships)) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  // Replace all rows for that date with the new selection
  await supabase.from("daily_port_calls").delete().eq("call_date", call_date);

  const rows = ships.map((shipName: string) => {
    const meta = SHIPS.find((s) => s.name === shipName);
    if (!meta) return null;
    return {
      call_date,
      ship_name: meta.name,
      cruise_line: meta.line,
      call_type: "transit",
      demo_segment: meta.segment,
      added_by: user.id,
    };
  }).filter(Boolean);

  if (rows.length === 0) return NextResponse.json({ ok: true });
  const { error } = await supabase.from("daily_port_calls").insert(rows as Array<NonNullable<typeof rows[number]>>);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
