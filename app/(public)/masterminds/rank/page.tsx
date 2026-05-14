// app/(public)/masterminds/rank/page.tsx
"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RankList, type RankableItem } from "@/components/rank/rank-list";

function MastermindsRankContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const leadId = sp.get("lead");
  const [items, setItems] = useState<RankableItem[]>([]);
  const [originSlug, setOriginSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!leadId) {
      router.replace("/masterminds");
      return;
    }
    const cookie = document.cookie.split("; ").find((r) => r.startsWith("prm_survey_picks="));
    if (!cookie) {
      router.replace(`/masterminds/survey?lead=${leadId}`);
      return;
    }
    const { pickedIds } = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
    fetch("/api/masterminds-list")
      .then((r) => r.json())
      .then((all: { id: string; slug: string; title: string; image_url: string }[]) => {
        setItems(pickedIds.map((id: string) => all.find((c) => c.id === id)!).filter(Boolean));
      });
    // Also grab the origin slug from the lead's source_origin to redirect at the end
    fetch(`/api/lead/${leadId}`)
      .then((r) => r.json())
      .then((lead: { source_origin?: string }) => {
        const o = lead.source_origin ?? "";
        if (o.startsWith("masterminds:")) setOriginSlug(o.slice("masterminds:".length));
      });
  }, [leadId, router]);

  async function handleSubmit(orderedIds: string[]) {
    await fetch("/api/rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, orderedIds, funnel: "masterminds", entityType: "mastermind" }),
    });
    router.push(`/masterminds/thanks${originSlug ? `?slug=${originSlug}` : ""}`);
  }

  if (!leadId || items.length === 0) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading…</div>;
  }
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
        Rank your top picks
      </h1>
      <p className="mt-3 text-muted-foreground">
        Drag to order — <span className="font-semibold">#1 is the one you'd join first</span>.
      </p>
      <div className="mt-8">
        <RankList items={items} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

export default function MastermindsRankPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Loading…</div>}>
      <MastermindsRankContent />
    </Suspense>
  );
}
