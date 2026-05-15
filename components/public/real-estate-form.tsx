// components/public/real-estate-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export function RealEstateForm() {
  const [interestRE, setRE] = useState(false);
  const [interestAct60, setAct60] = useState(false);
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const valid =
    (interestRE || interestAct60) &&
    firstName.trim() && lastName.trim() && email.includes("@");

  function submit() {
    if (!valid) {
      setError("Please choose at least one interest and fill name + email.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/real-estate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          interests: [interestRE && "real_estate", interestAct60 && "act_60"].filter(Boolean),
          note,
        }),
      });
      if (!res.ok) {
        setError("Could not submit. Please try again.");
        return;
      }
      router.push("/real-estate-interest");
    });
  }

  return (
    <div className="space-y-3 text-secondary-foreground">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={interestRE} onCheckedChange={(v) => setRE(Boolean(v))} />
          Real estate on the island
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={interestAct60} onCheckedChange={(v) => setAct60(Boolean(v))} />
          Act 60 tax benefits
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="First name" value={firstName} onChange={(e) => setFirst(e.target.value)} className="bg-white text-secondary" />
        <Input placeholder="Last name" value={lastName} onChange={(e) => setLast(e.target.value)} className="bg-white text-secondary" />
      </div>
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white text-secondary" />
      <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-white text-secondary" />
      <Textarea placeholder="Tell us more (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="bg-white text-secondary" />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button onClick={submit} disabled={!valid || pending} className="w-full bg-prm-coral hover:bg-prm-coral/90 text-white">
        {pending ? "Sending…" : "Request More Info"}
      </Button>
    </div>
  );
}
