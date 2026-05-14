// components/admin/image-upload.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ImageUpload({ folder, value, onChange }: { folder: string; value: string; onChange: (url: string) => void; }) {
  const [uploading, setUploading] = useState(false);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const { url } = await res.json();
      onChange(url);
    } finally { setUploading(false); }
  }

  return (
    <div className="space-y-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
      <div className="flex items-center gap-2">
        <Input type="file" accept="image/*" onChange={upload} disabled={uploading} />
        {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
      </div>
      {value && <img src={value} alt="" className="mt-2 h-24 w-32 rounded object-cover" />}
    </div>
  );
}
