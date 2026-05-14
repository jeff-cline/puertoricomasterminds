// app/(admin)/admin/cms/excursions/[id]/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ExcursionForm } from "./excursion-form";

export default async function EditExcursionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "new") {
    return <ExcursionForm initial={null} />;
  }
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any).from("excursions").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <ExcursionForm initial={data} />;
}
