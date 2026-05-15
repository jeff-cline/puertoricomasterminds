// app/(admin)/admin/cms/excursions/[id]/excursion-form.tsx
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

type ExcursionRow = {
  id?: string; slug: string; title: string; short_description: string; long_description?: string | null;
  image_url: string; image_credit?: string | null; price_from_usd: number;
  duration_min: number; duration_max?: number | null; type: "cruise_day" | "multi_day" | "both";
  viator_slug: string; viator_attraction_id: string; viator_base_level: "San-Juan" | "Puerto-Rico" | "Vieques" | "Fajardo";
  category?: string | null; tags?: string[]; is_hero?: boolean; sort_order: number; is_active?: boolean;
};

export function ExcursionForm({ initial }: { initial: ExcursionRow | null }) {
  const router = useRouter();
  const [f, setF] = useState<ExcursionRow>(initial ?? {
    slug: "", title: "", short_description: "", image_url: "", price_from_usd: 0,
    duration_min: 60, type: "cruise_day", viator_slug: "", viator_attraction_id: "",
    viator_base_level: "San-Juan", category: "", tags: [], sort_order: 100, is_active: true, is_hero: false,
  });
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof ExcursionRow>(k: K, v: ExcursionRow[K]) => setF((cur) => ({ ...cur, [k]: v }));

  function save() {
    startTransition(async () => {
      const method = initial?.id ? "PATCH" : "POST";
      const url = initial?.id ? `/api/admin/excursions/${initial.id}` : "/api/admin/excursions";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (res.ok) router.push("/admin/cms/excursions");
    });
  }

  async function del() {
    if (!initial?.id || !confirm("Delete this excursion?")) return;
    await fetch(`/api/admin/excursions/${initial.id}`, { method: "DELETE" });
    router.push("/admin/cms/excursions");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-jakarta text-3xl font-bold text-secondary">
        {initial?.id ? "Edit excursion" : "New excursion"}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Slug</Label><Input value={f.slug} onChange={(e) => set("slug", e.target.value)} /></div>
        <div><Label>Sort order</Label><Input type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></div>
      </div>
      <div><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
      <div><Label>Short description</Label><Textarea value={f.short_description} onChange={(e) => set("short_description", e.target.value)} /></div>
      <div><Label>Long description (optional)</Label><Textarea rows={6} value={f.long_description ?? ""} onChange={(e) => set("long_description", e.target.value)} /></div>
      <div><Label>Image</Label><ImageUpload folder="excursions" value={f.image_url} onChange={(url) => set("image_url", url)} /></div>
      <div><Label>Image credit (optional)</Label><Input value={f.image_credit ?? ""} onChange={(e) => set("image_credit", e.target.value)} /></div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Price from (USD)</Label><Input type="number" value={f.price_from_usd} onChange={(e) => set("price_from_usd", Number(e.target.value))} /></div>
        <div><Label>Duration min (min)</Label><Input type="number" value={f.duration_min} onChange={(e) => set("duration_min", Number(e.target.value))} /></div>
        <div><Label>Duration max (min)</Label><Input type="number" value={f.duration_max ?? 0} onChange={(e) => set("duration_max", Number(e.target.value) || null)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Select value={f.type} onValueChange={(v) => set("type", v as ExcursionRow["type"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="cruise_day">Cruise Day</SelectItem>
              <SelectItem value="multi_day">Multi-Day</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Viator base level</Label>
          <Select value={f.viator_base_level} onValueChange={(v) => set("viator_base_level", v as ExcursionRow["viator_base_level"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="San-Juan">San-Juan</SelectItem>
              <SelectItem value="Puerto-Rico">Puerto-Rico</SelectItem>
              <SelectItem value="Vieques">Vieques</SelectItem>
              <SelectItem value="Fajardo">Fajardo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Viator slug</Label><Input value={f.viator_slug} onChange={(e) => set("viator_slug", e.target.value)} placeholder="Old-San-Juan" /></div>
        <div><Label>Viator attraction id</Label><Input value={f.viator_attraction_id} onChange={(e) => set("viator_attraction_id", e.target.value)} placeholder="d903-a2460" /></div>
      </div>
      <div><Label>Category</Label><Input value={f.category ?? ""} onChange={(e) => set("category", e.target.value)} /></div>
      <div className="flex flex-wrap gap-6 pt-2">
        <label className="flex items-center gap-2"><Checkbox checked={f.is_hero ?? false} onCheckedChange={(v) => set("is_hero", Boolean(v))} /> Hero on homepage</label>
        <label className="flex items-center gap-2"><Checkbox checked={f.is_active ?? true} onCheckedChange={(v) => set("is_active", Boolean(v))} /> Active</label>
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
