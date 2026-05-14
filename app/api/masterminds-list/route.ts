// app/api/masterminds-list/route.ts
import { NextResponse } from "next/server";
import { listMasterminds } from "@/lib/masterminds/queries";

export async function GET() {
  return NextResponse.json(await listMasterminds());
}
