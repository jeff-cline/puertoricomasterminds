// app/(admin)/admin/cms/future-excursions/[id]/future-excursion-form.tsx
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

type FutureExcursionRow = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  image_source: "unsplash" | "manual" | "ai_generated";
  category: string;
  is_sensitive: boolean;
  sort_order: number;
  is_active: boolean;
};

export function FutureExcursionForm({ initial }: { initial: FutureExcursionRow | null }) {
  const router = useRouter();
  const [f, setF] = useState<FutureExcursionRow>(initial ?? {
    slug: "", title: "", description: "", image_url: "",
    image_source: "manual", category: "", is_sensitive: false,
    sort_order: 100, is_active: true,
  });
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof FutureExcursionRow>(k: K, v: FutureExcursionRow[K]) => setF((cur) => ({ ...cur, [k]: v }));

  function save() {
    startTransition(async () => {
      const method = initial?.id ? "PATCH" : "POST";
      const url = initial?.id ? `/api/admin/future-excursions/${initial.id}` : "/api/admin/future-excursions";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (res.ok) router.push("/admin/cms/future-excursions");
    });
  }

  async function del() {
    if (!initial?.id || !confirm("Delete this future excursion?")) return;
    await fetch(`/api/admin/future-excursions/${initial.id}`, { method: "DELETE" });
    router.push("/admin/cms/future-excursions");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-jakarta text-3xl font-bold text-secondary">
        {initial?.id ? "Edit future excursion" : "New future excursion"}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Slug</Label><Input value={f.slug} onChange={(e) => set("slug", e.target.value)} /></div>
        <div><Label>Sort order</Label><Input type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></div>
      </div>
      <div><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
      <div><Label>Description</Label><Textarea rows={5} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div><Label>Image</Label><ImageUpload folder="future-excursions" value={f.image_url} onChange={(url) => set("image_url", url)} /></div>
      <div>
        <Label>Image source</Label>
        <Select value={f.image_source} onValueChange={(v) => set("image_source", v as FutureExcursionRow["image_source"])}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="unsplash">Unsplash</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="ai_generated">AI Generated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div><Label>Category</Label><Input value={f.category} onChange={(e) => set("category", e.target.value)} /></div>
      <div className="flex flex-wrap gap-6 pt-2">
        <label className="flex items-center gap-2">
          <Checkbox checked={f.is_sensitive} onCheckedChange={(v) => set("is_sensitive", Boolean(v))} />
          Sensitive (Coming Soon)
        </label>
        <label className="flex items-center gap-2">
          <Checkbox checked={f.is_active} onCheckedChange={(v) => set("is_active", Boolean(v))} />
          Active
        </label>
      </div>
      <div className="flex gap-3 pt-4">
        <Button onClick={save} disabled={pending} className="bg-prm-coral hover:bg-prm-coral/90 text-white">
          {pending ? "Saving…" : "Save"}
        </Button>
        {initial?.id && <Button variant="destructive" onClick={del}>Delete</Button>}
      </div>
    </div>
  );
}
