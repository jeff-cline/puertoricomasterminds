// app/api/gate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads/create-lead";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const { decision, email, first_name, last_name, origin, funnel, session_id } = body;

  if (!["yes", "no"].includes(decision)) {
    return NextResponse.json({ error: "invalid decision" }, { status: 400 });
  }

  try {
    const { leadId, couponCode } = await createLead({
      email,
      first_name,
      last_name,
      funnel,
      source_origin: origin,
      session_id,
      payload: { gate_decision: decision },
    });
    return NextResponse.json({ leadId, couponCode });
  } catch (e) {
    // Supabase PostgrestError is an object, not an Error instance. Surface
    // the .message field directly so the client and the server logs both
    // see the real reason (RLS denial, constraint violation, etc).
    const err = e as { message?: string; code?: string; details?: string };
    const message = err?.message || "lead create failed";
    console.error("[gate] createLead failed:", err);
    return NextResponse.json(
      { error: message, code: err?.code, details: err?.details },
      { status: 400 },
    );
  }
}
