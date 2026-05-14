import { redirect } from "next/navigation";
import { getCurrentAdminUser } from "@/lib/auth/current-user";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentAdminUser();
  if (!user) redirect("/admin/login");
  if (user.force_password_change) redirect("/admin/change-password");

  return (
    <div className="flex min-h-screen bg-prm-offwhite">
      <Sidebar role={user.role} />
      <div className="flex flex-1 flex-col">
        <Topbar email={user.email} role={user.role} />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
