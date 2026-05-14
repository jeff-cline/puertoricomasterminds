// app/api/survey/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { leadId, pickedIds } = await req.json();
  if (!leadId || !Array.isArray(pickedIds) || pickedIds.length < 5) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const cookieStore = await cookies();
  cookieStore.set("prm_survey_picks", JSON.stringify({ leadId, pickedIds }), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return NextResponse.json({ ok: true });
}
