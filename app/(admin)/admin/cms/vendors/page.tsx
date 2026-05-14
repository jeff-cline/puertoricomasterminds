// app/(admin)/admin/cms/vendors/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSupabase } from "@/lib/supabase/server";

export default async function VendorsCmsPage() {
  const supabase = await getServerSupabase();
  const { data } = await (supabase as any).from("vendors").select("*").order("sort_order");
  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-jakarta text-3xl font-bold text-secondary">CMS · Vendors</h1>
          <p className="mt-1 text-muted-foreground">{data?.length ?? 0} vendors.</p>
        </div>
        <Link href="/admin/cms/vendors/new">
          <Button className="bg-prm-coral hover:bg-prm-coral/90">New vendor</Button>
        </Link>
      </header>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2">Sort</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Address</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((r: any) => (
              <tr key={r.id} className="border-b">
                <td className="px-4 py-2 font-mono text-xs">{r.sort_order}</td>
                <td className="px-4 py-2 text-secondary">{r.name}</td>
                <td className="px-4 py-2 text-xs">{r.address}</td>
                <td className="px-4 py-2 text-xs">{r.phone}</td>
                <td className="px-4 py-2">{r.is_active ? "✓" : "—"}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/cms/vendors/${r.id}`} className="text-prm-teal hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
