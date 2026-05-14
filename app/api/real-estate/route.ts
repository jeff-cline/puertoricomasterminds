// app/api/real-estate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/leads/create-lead";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { first_name, last_name, email, phone, interests, note } = body;
  try {
    await createLead({
      email, first_name, last_name, phone,
      funnel: "real_estate",
      payload: { interests, note },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "lead create failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
