// app/(admin)/admin/cruise-calendar/cruise-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SHIPS } from "@/db/seed/ships";

export function CruiseForm({ initialDate, initialShips }: { initialDate: string; initialShips: string[] }) {
  const router = useRouter();
  const [date, setDate] = useState(initialDate);
  const [picked, setPicked] = useState<string[]>(initialShips);
  const [pending, startTransition] = useTransition();

  function togglePick(name: string) {
    setPicked((cur) => cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name]);
  }
  function save() {
    startTransition(async () => {
      await fetch("/api/admin/cruise-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ call_date: date, ships: picked }),
      });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-3">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button onClick={save} disabled={pending} className="bg-prm-coral hover:bg-prm-coral/90">
          {pending ? "Saving…" : `Save (${picked.length} ships)`}
        </Button>
      </div>

      {(["mega_family","premium_mainstream","luxury","fun_ships"] as const).map((segment) => (
        <section key={segment} className="rounded-xl border bg-white p-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {segment.replace("_", " ")}
          </h3>
          <div className="grid gap-2 md:grid-cols-2">
            {SHIPS.filter((s) => s.segment === segment).map((s) => (
              <label key={s.name} className="flex items-center gap-2 text-sm">
                <Checkbox checked={picked.includes(s.name)} onCheckedChange={() => togglePick(s.name)} />
                <span className="text-secondary">{s.name}</span>
                <span className="text-xs text-muted-foreground">· {s.line}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
