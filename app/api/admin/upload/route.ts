// app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";
import { getCurrentAdminUser } from "@/lib/auth/current-user";

const BUCKET = "prm-images";

export async function POST(req: NextRequest) {
  const user = await getCurrentAdminUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "misc");
  if (!(file instanceof File)) return NextResponse.json({ error: "no file" }, { status: 400 });

  const supabase = getServiceRoleSupabase();
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const arrayBuf = await file.arrayBuffer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuf, {
    contentType: file.type, upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl });
}
