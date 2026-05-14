// app/(admin)/admin/cms/featured/[id]/featured-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/admin/image-upload";

type FeaturedRow = {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  target_url: string;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  click_count?: number;
};

export function FeaturedForm({ initial }: { initial: FeaturedRow | null }) {
  const router = useRouter();
  const [f, setF] = useState<FeaturedRow>(initial ?? {
    title: "", description: "", image_url: "", target_url: "",
    sort_order: 100, starts_at: null, ends_at: null, is_active: true,
  });
  const [pending, startTransition] = useTransition();
  const set = <K extends keyof FeaturedRow>(k: K, v: FeaturedRow[K]) => setF((cur) => ({ ...cur, [k]: v }));

  function save() {
    startTransition(async () => {
      const method = initial?.id ? "PATCH" : "POST";
      const url = initial?.id ? `/api/admin/featured/${initial.id}` : "/api/admin/featured";
      const payload = { ...f };
      // Exclude click_count from payload — read-only
      delete (payload as any).click_count;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) router.push("/admin/cms/featured");
    });
  }

  async function del() {
    if (!initial?.id || !confirm("Delete this featured destination?")) return;
    await fetch(`/api/admin/featured/${initial.id}`, { method: "DELETE" });
    router.push("/admin/cms/featured");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-jakarta text-3xl font-bold text-secondary">
        {initial?.id ? "Edit featured destination" : "New featured destination"}
      </h1>
      {initial?.id && (
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Clicks: <span className="font-mono font-semibold text-secondary">{initial.click_count ?? 0}</span>
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
        <div><Label>Sort order</Label><Input type="number" value={f.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} /></div>
      </div>
      <div><Label>Description</Label><Textarea rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div><Label>Image</Label><ImageUpload folder="featured" value={f.image_url} onChange={(url) => set("image_url", url)} /></div>
      <div><Label>Target URL</Label><Input value={f.target_url} onChange={(e) => set("target_url", e.target.value)} placeholder="https://..." /></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Starts at (optional)</Label>
          <Input
            type="datetime-local"
            value={f.starts_at ? f.starts_at.slice(0, 16) : ""}
            onChange={(e) => set("starts_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
          />
        </div>
        <div>
          <Label>Ends at (optional)</Label>
          <Input
            type="datetime-local"
            value={f.ends_at ? f.ends_at.slice(0, 16) : ""}
            onChange={(e) => set("ends_at", e.target.value ? new Date(e.target.value).toISOString() : null)}
          />
        </div>
      </div>
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
