// app/(admin)/admin/cms/masterminds/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function MastermindsCmsPage() {
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any).from("masterminds").select("*").order("sort_order");
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-jakarta text-3xl font-bold text-secondary">CMS · Masterminds</h1>
          <p className="mt-1 text-muted-foreground">{data?.length ?? 0} masterminds.</p>
        </div>
        <Link href="/admin/cms/masterminds/new">
          <Button className="bg-prm-coral hover:bg-prm-coral/90 text-white">New mastermind</Button>
        </Link>
      </header>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2">Sort</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Tier</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Verified</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r: any) => (
              <tr key={r.id} className="border-b">
                <td className="px-4 py-2 font-mono text-xs">{r.sort_order}</td>
                <td className="px-4 py-2 text-secondary">{r.title}</td>
                <td className="px-4 py-2 text-xs">{r.tier}</td>
                <td className="px-4 py-2 text-xs">{r.location}</td>
                <td className="px-4 py-2">{r.verified ? "✓" : "—"}</td>
                <td className="px-4 py-2">{r.is_active ? "✓" : "—"}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/cms/masterminds/${r.id}`} className="text-prm-teal hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
