// app/api/events/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const {
    eventType,
    entityType,
    entityId,
    leadId,
    payload,
    sessionId,
    pagePath,
    referrer,
  } = body as Record<string, unknown>;

  if (typeof eventType !== "string" || typeof sessionId !== "string") {
    return NextResponse.json({ error: "missing eventType or sessionId" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;

  const { error } = await supabase.from("events").insert({
    event_type: eventType,
    entity_type: (entityType as string) ?? null,
    entity_id: (entityId as string) ?? null,
    lead_id: (leadId as string) ?? null,
    payload: (payload as Record<string, unknown>) ?? {},
    session_id: sessionId,
    page_path: (pagePath as string) ?? null,
    referrer: (referrer as string) ?? null,
    ip,
    user_agent: userAgent,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
