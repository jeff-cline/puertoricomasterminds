// lib/auth/current-user.ts
import { getServerSupabase } from "@/lib/supabase/server";
import type { Role } from "./roles";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  force_password_change: boolean;
  is_active: boolean;
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, force_password_change, is_active")
    .eq("id", user.id)
    .maybeSingle() as any;
  if (error || !data || !data.is_active) return null;
  return data as AdminUser;
}
