"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function validate(pw: string): string | null {
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (!/[A-Z]/.test(pw)) return "Include an uppercase letter.";
  if (!/[a-z]/.test(pw)) return "Include a lowercase letter.";
  if (!/[0-9]/.test(pw)) return "Include a number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Include a special character.";
  return null;
}

export function ChangePasswordForm() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate(pw);
    if (v) { setErr(v); return; }
    if (pw !== confirm) { setErr("Passwords do not match."); return; }
    setErr(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      if (!res.ok) {
        setErr(await res.text());
        return;
      }
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
      <h1 className="font-jakarta text-2xl font-bold text-secondary">Set your password</h1>
      <p className="text-sm text-muted-foreground">
        You&apos;re using a temporary password. Set a new one to continue.
      </p>
      <div className="space-y-2">
        <Label htmlFor="pw">New password</Label>
        <Input id="pw" type="password" autoComplete="new-password" required value={pw} onChange={(e) => setPw(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm new password</Label>
        <Input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <p className="text-xs text-muted-foreground">
        12+ chars, mix of upper/lower, a number, and a special character.
      </p>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" disabled={pending} className="w-full bg-prm-coral hover:bg-prm-coral/90">
        {pending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
