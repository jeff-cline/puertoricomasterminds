// app/api/rank/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { leadId, orderedIds, funnel, entityType } = await req.json();
  if (!leadId || !Array.isArray(orderedIds) || orderedIds.length < 5) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const rows = orderedIds.slice(0, 10).map((id: string, i: number) => ({
    lead_id: leadId,
    funnel: funnel ?? "tourist",
    entity_type: entityType ?? "future_excursion",
    entity_id: id,
    rank_position: i + 1,
    was_starred: true,
  }));

  const { error } = await (supabase as any).from("rankings").insert(rows);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await (supabase as any).from("events").insert({
    lead_id: leadId,
    session_id: leadId,
    event_type: "rank_submit",
    payload: { funnel: funnel ?? "tourist", count: rows.length },
  });

  return NextResponse.json({ ok: true });
}
