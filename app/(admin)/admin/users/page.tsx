// app/(admin)/admin/users/page.tsx
import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { getServerSupabase } from "@/lib/supabase/server";
import { InviteForm } from "./invite-form";

export default async function UsersPage() {
  const me = await getCurrentAdminUser();
  if (!me || me.role !== "super_admin") redirect("/admin");
  const supabase = await getServerSupabase();
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false });
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-jakarta text-3xl font-bold text-secondary">Users & Roles</h1>
        <p className="mt-1 text-muted-foreground">Invite developers, investors, and officials. Super admin only.</p>
      </header>
      <section className="rounded-xl border bg-white p-5">
        <h2 className="mb-3 font-semibold text-secondary">Invite a new admin</h2>
        <InviteForm />
      </section>
      <section className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Force PW change</th>
              <th className="px-4 py-2">Last login</th>
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u: any) => (
              <tr key={u.id} className="border-b">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.full_name ?? "—"}</td>
                <td className="px-4 py-2 text-xs uppercase tracking-wide text-muted-foreground">{u.role}</td>
                <td className="px-4 py-2">{u.is_active ? "✓" : "—"}</td>
                <td className="px-4 py-2">{u.force_password_change ? "yes" : "no"}</td>
                <td className="px-4 py-2 font-mono text-xs">{u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
