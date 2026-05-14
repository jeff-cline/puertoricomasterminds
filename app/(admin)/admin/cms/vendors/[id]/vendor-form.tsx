// app/(admin)/admin/cms/vendors/[id]/vendor-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/admin/image-upload";

type VendorRow = {
  id?: string;
  name: string;
  logo_url: string;
  address: string;
  description: string;
  website_url: string;
  phone: string;
  sort_order: number;
  is_active: boolean;
};

export function VendorForm({ initial }: { initial: VendorRow | null }) {
  const router = useRouter();
  const [f, setF] = useState<VendorRow>(initial ?? {
    name: "", logo_url: "", address: "", description: "",
    website_url: "", phone: "", sort_order: 100, is_active: true,
  });
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof VendorRow>(k: K, v: VendorRow[K]) => setF((cur) => ({ ...cur, [k]: v }));

  function save() {
    startTransition(async () => {
      const method = initial?.id ? "PATCH" : "POST";
      const url = initial?.id ? `/api/admin/vendors/${initial.id}` : "/api/admin/vendors";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (res.ok) router.push("/admin/cms/vendors");
    });
  }

  async function del() {
    if (!initial?.id || !confirm("Delete this vendor?")) return;
    await fetch(`/api/admin/vendors/${initial.id}`, { method: "DELETE" });
    router.push("/admin/cms/vendors");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-jakarta text-3xl font-bold text-secondary">
        {initial?.id ? "Edit vendor" : "New vendor"}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Name</Label><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><Label>Sort order</Label><Input type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></div>
      </div>
      <div><Label>Logo</Label><ImageUpload folder="vendors" value={f.logo_url} onChange={(url) => set("logo_url", url)} /></div>
      <div><Label>Address</Label><Input value={f.address} onChange={(e) => set("address", e.target.value)} /></div>
      <div><Label>Description</Label><Textarea rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div><Label>Website URL</Label><Input value={f.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://..." /></div>
      <div><Label>Phone</Label><Input value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 787 555 0000" /></div>
      <div className="flex flex-wrap gap-6 pt-2">
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
