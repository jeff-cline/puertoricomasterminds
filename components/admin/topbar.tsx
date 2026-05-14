"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function Topbar({ email, role }: { email: string; role: string }) {
  const router = useRouter();
  async function signOut() {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-6">
      <div className="text-sm text-muted-foreground">
        Signed in as <span className="font-semibold text-secondary">{email}</span> · {role}
      </div>
      <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
    </header>
  );
}
