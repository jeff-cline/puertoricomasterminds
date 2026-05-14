// app/(admin)/admin/cms/masterminds/[id]/mastermind-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/admin/image-upload";

type MastermindRow = {
  id?: string;
  slug: string;
  title: string;
  one_line: string;
  description: string;
  image_url: string;
  destination_url: string;
  tier: "paid_t1" | "local_t2";
  category: string;
  location: string;
  verified: boolean;
  sort_order: number;
  is_active: boolean;
};

export function MastermindForm({ initial }: { initial: MastermindRow | null }) {
  const router = useRouter();
  const [f, setF] = useState<MastermindRow>(initial ?? {
    slug: "", title: "", one_line: "", description: "", image_url: "",
    destination_url: "", tier: "local_t2", category: "", location: "",
    verified: false, sort_order: 100, is_active: true,
  });
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof MastermindRow>(k: K, v: MastermindRow[K]) => setF((cur) => ({ ...cur, [k]: v }));

  function save() {
    startTransition(async () => {
      const method = initial?.id ? "PATCH" : "POST";
      const url = initial?.id ? `/api/admin/masterminds/${initial.id}` : "/api/admin/masterminds";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (res.ok) router.push("/admin/cms/masterminds");
    });
  }

  async function del() {
    if (!initial?.id || !confirm("Delete this mastermind?")) return;
    await fetch(`/api/admin/masterminds/${initial.id}`, { method: "DELETE" });
    router.push("/admin/cms/masterminds");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-jakarta text-3xl font-bold text-secondary">
        {initial?.id ? "Edit mastermind" : "New mastermind"}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Slug</Label><Input value={f.slug} onChange={(e) => set("slug", e.target.value)} /></div>
        <div><Label>Sort order</Label><Input type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></div>
      </div>
      <div><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
      <div><Label>One-line summary</Label><Input value={f.one_line} onChange={(e) => set("one_line", e.target.value)} /></div>
      <div><Label>Description</Label><Textarea rows={5} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div><Label>Image</Label><ImageUpload folder="masterminds" value={f.image_url} onChange={(url) => set("image_url", url)} /></div>
      <div><Label>Destination URL</Label><Input value={f.destination_url} onChange={(e) => set("destination_url", e.target.value)} placeholder="https://..." /></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tier</Label>
          <Select value={f.tier} onValueChange={(v) => set("tier", v as MastermindRow["tier"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="paid_t1">Premier (paid_t1)</SelectItem>
              <SelectItem value="local_t2">Community (local_t2)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Category</Label><Input value={f.category} onChange={(e) => set("category", e.target.value)} /></div>
      </div>
      <div><Label>Location</Label><Input value={f.location} onChange={(e) => set("location", e.target.value)} /></div>
      <div className="flex flex-wrap gap-6 pt-2">
        <label className="flex items-center gap-2">
          <Checkbox checked={f.verified} onCheckedChange={(v) => set("verified", Boolean(v))} />
          Verified
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={f.is_active} onCheckedChange={(v) => set("is_active", Boolean(v))} />
          Active
        </label>
      </div>
      <div className="flex gap-3 pt-4">
        <Button onClick={save} disabled={pending} className="bg-prm-coral hover:bg-prm-coral/90">
          {pending ? "Saving…" : "Save"}
        </Button>
        {initial?.id && <Button variant="destructive" onClick={del}>Delete</Button>}
      </div>
    </div>
  );
}
