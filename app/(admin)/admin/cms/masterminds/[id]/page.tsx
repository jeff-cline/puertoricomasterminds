// app/(admin)/admin/cms/masterminds/[id]/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { MastermindForm } from "./mastermind-form";

export default async function EditMastermindPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "new") {
    return <MastermindForm initial={null} />;
  }
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any).from("masterminds").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <MastermindForm initial={data} />;
}
