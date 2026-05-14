// app/(admin)/admin/real-estate-leads/page.tsx
import { getServerSupabase } from "@/lib/supabase/server";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { redirect } from "next/navigation";
import { can } from "@/lib/auth/roles";

export default async function RealEstateLeadsPage() {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  if (!can(user.role, "read:real_estate_leads")) redirect("/admin");

  interface LeadRow {
    id: string; created_at: string; first_name: string | null; last_name: string | null;
    email: string; phone: string | null; payload: Record<string, unknown> | null;
  }

  const supabase = await getServerSupabase();
  const { data } = await (supabase as any)
    .from("leads").select("*").eq("funnel", "real_estate").order("created_at", { ascending: false }).limit(500) as { data: LeadRow[] | null };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Real Estate Leads</h1>
        <p className="mt-1 text-muted-foreground">Act 60 + real estate inquiries from the footer form.</p>
      </header>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Interests</th>
              <th className="px-4 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r) => {
              const payload = (r.payload ?? {}) as Record<string, unknown>;
              return (
                <tr key={r.id} className="border-b align-top">
                  <td className="px-4 py-2 font-mono text-xs">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{r.first_name} {r.last_name}</td>
                  <td className="px-4 py-2">{r.email}</td>
                  <td className="px-4 py-2">{r.phone ?? "—"}</td>
                  <td className="px-4 py-2">{Array.isArray(payload.interests) ? (payload.interests as string[]).join(", ") : "—"}</td>
                  <td className="px-4 py-2 max-w-md">{typeof payload.note === "string" ? payload.note : "—"}</td>
                </tr>
              );
            })}
            {(data?.length ?? 0) === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No real estate leads yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
