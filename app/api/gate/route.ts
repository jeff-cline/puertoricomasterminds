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
    const message = e instanceof Error ? e.message : "lead create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
