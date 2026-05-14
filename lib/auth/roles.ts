// lib/auth/roles.ts
export type Role =
  | "super_admin"
  | "developer_real_estate"
  | "developer_excursion"
  | "investor"
  | "official"
  | "view_only";

export type Action =
  | "read:leads"
  | "read:leads_pii"
  | "read:real_estate_leads"
  | "read:funnels"
  | "read:leaderboards"
  | "write:cms"
  | "manage:users"
  | "manage:cruise_calendar"
  | "view:affiliate";

const MATRIX: Record<Role, Action[]> = {
  super_admin: [
    "read:leads","read:leads_pii","read:real_estate_leads","read:funnels","read:leaderboards",
    "write:cms","manage:users","manage:cruise_calendar","view:affiliate",
  ],
  developer_real_estate: [
    "read:leads","read:real_estate_leads","read:funnels","read:leaderboards","view:affiliate",
  ],
  developer_excursion: [
    "read:leads","read:funnels","read:leaderboards","write:cms","manage:cruise_calendar","view:affiliate",
  ],
  investor: ["read:funnels","read:leaderboards","view:affiliate"],
  official: ["read:funnels","read:leaderboards"],
  view_only: ["read:funnels","read:leaderboards"],
};

export function can(role: Role, action: Action): boolean {
  const allowed = MATRIX[role];
  if (!allowed) return false;
  return allowed.includes(action);
}
