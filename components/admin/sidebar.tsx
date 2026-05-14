// components/admin/sidebar.tsx
import Link from "next/link";
import { can, type Role } from "@/lib/auth/roles";

const SECTIONS = [
  { label: "Overview", href: "/admin", action: null },
  { label: "Tourist Funnel", href: "/admin/funnel/tourist", action: "read:funnels" as const },
  { label: "Masterminds Funnel", href: "/admin/funnel/masterminds", action: "read:funnels" as const },
  { label: "Future Excursions Leaderboard", href: "/admin/leaderboard/future-excursions", action: "read:leaderboards" as const },
  { label: "Masterminds Leaderboard", href: "/admin/leaderboard/masterminds", action: "read:leaderboards" as const },
  { label: "Leads", href: "/admin/leads", action: "read:leads" as const },
  { label: "Real Estate Leads", href: "/admin/real-estate-leads", action: "read:real_estate_leads" as const },
  { label: "Cruise Calendar", href: "/admin/cruise-calendar", action: "manage:cruise_calendar" as const },
  { label: "CMS · Excursions", href: "/admin/cms/excursions", action: "write:cms" as const },
  { label: "CMS · Future Excursions", href: "/admin/cms/future-excursions", action: "write:cms" as const },
  { label: "CMS · Masterminds", href: "/admin/cms/masterminds", action: "write:cms" as const },
  { label: "CMS · Featured", href: "/admin/cms/featured", action: "write:cms" as const },
  { label: "CMS · Vendors", href: "/admin/cms/vendors", action: "write:cms" as const },
  { label: "Users & Roles", href: "/admin/users", action: "manage:users" as const },
  { label: "Affiliate", href: "/admin/affiliate", action: "view:affiliate" as const },
] as const;

export function Sidebar({ role }: { role: Role }) {
  const visible = SECTIONS.filter((s) => s.action === null || can(role, s.action));
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-secondary text-secondary-foreground md:block">
      <div className="p-6">
        <Link href="/admin" className="font-jakarta text-lg font-bold">
          PRM Admin
        </Link>
      </div>
      <nav className="px-2">
        <ul className="space-y-1">
          {visible.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary-foreground/10"
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
