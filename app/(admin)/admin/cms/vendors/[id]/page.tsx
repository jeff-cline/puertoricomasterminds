// app/(admin)/admin/cms/vendors/[id]/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { VendorForm } from "./vendor-form";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "new") {
    return <VendorForm initial={null} />;
  }
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any).from("vendors").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <VendorForm initial={data} />;
}
