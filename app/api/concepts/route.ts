// app/api/concepts/route.ts
import { NextResponse } from "next/server";
import { listFutureExcursions } from "@/lib/futures/queries";

export async function GET() {
  const concepts = await listFutureExcursions();
  return NextResponse.json(concepts);
}
