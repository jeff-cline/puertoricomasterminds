// app/(admin)/admin/leads/page.tsx
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { getServerSupabase } from "@/lib/supabase/server";
import { LeadsTable } from "./leads-table";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ funnel?: string; q?: string }>;
}) {
  const user = await getCurrentAdminUser();
  const sp = await searchParams;
  const funnel = sp.funnel ?? "all";
  const q = sp.q?.trim() ?? "";

  const supabase = await getServerSupabase();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
  if (funnel !== "all") query = query.eq("funnel", funnel);
  if (q) query = query.or(`email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`);

  const { data } = await query;
  const canSeePii = user?.role === "super_admin";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Leads</h1>
        <p className="mt-1 text-muted-foreground">{data?.length ?? 0} most recent leads.</p>
      </header>
      <LeadsTable rows={data ?? []} canSeePii={canSeePii} initialFunnel={funnel} initialQuery={q} />
    </div>
  );
}
