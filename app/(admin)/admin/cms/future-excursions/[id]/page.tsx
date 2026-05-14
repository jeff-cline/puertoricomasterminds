// app/(admin)/admin/cms/future-excursions/[id]/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { FutureExcursionForm } from "./future-excursion-form";

export default async function EditFutureExcursionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "new") {
    return <FutureExcursionForm initial={null} />;
  }
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any).from("future_excursions").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <FutureExcursionForm initial={data} />;
}
