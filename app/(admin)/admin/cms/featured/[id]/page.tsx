// app/(admin)/admin/cms/featured/[id]/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { FeaturedForm } from "./featured-form";

export default async function EditFeaturedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "new") {
    return <FeaturedForm initial={null} />;
  }
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any).from("featured_destinations").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <FeaturedForm initial={data} />;
}
