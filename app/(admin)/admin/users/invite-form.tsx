// app/(admin)/admin/users/invite-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = [
  "developer_real_estate","developer_excursion","investor","official","view_only",
] as const;

export function InviteForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("view_only");
  const [tempPw, setTempPw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function invite() {
    setError(null); setTempPw(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name: name, role }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "invite failed"); return; }
      setTempPw(json.temp_password);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div>
          <Label>Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as typeof ROLES[number])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {tempPw && (
        <div className="rounded border border-success bg-success/5 p-3 text-sm">
          Invite sent. Share these credentials securely:
          <div className="mt-2 font-mono text-secondary">{email} / {tempPw}</div>
          <p className="mt-1 text-xs text-muted-foreground">User will be forced to change on first login.</p>
        </div>
      )}
      <Button onClick={invite} disabled={!email || !name || pending} className="bg-prm-coral hover:bg-prm-coral/90 text-white">
        {pending ? "Inviting…" : "Invite"}
      </Button>
    </div>
  );
}
