// app/(public)/rank/page.tsx
"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RankList, type RankableItem } from "@/components/rank/rank-list";

function RankContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const leadId = sp.get("lead");
  const couponCode = sp.get("coupon");
  const [items, setItems] = useState<RankableItem[]>([]);

  useEffect(() => {
    if (!leadId) {
      router.replace("/");
      return;
    }
    const cookie = document.cookie.split("; ").find((r) => r.startsWith("prm_survey_picks="));
    if (!cookie) {
      router.replace(`/survey?lead=${leadId}${couponCode ? `&coupon=${couponCode}` : ""}`);
      return;
    }
    const { pickedIds } = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
    fetch("/api/concepts")
      .then((r) => r.json())
      .then((all: RankableItem[]) =>
        setItems(pickedIds.map((id: string) => all.find((c) => c.id === id)!).filter(Boolean)),
      );
  }, [leadId, couponCode, router]);

  async function handleSubmit(orderedIds: string[]) {
    await fetch("/api/rank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, orderedIds, funnel: "tourist", entityType: "future_excursion" }),
    });
    const qs = new URLSearchParams({ lead: leadId!, ...(couponCode ? { coupon: couponCode } : {}) });
    router.push(`/coupon?${qs.toString()}`);
  }

  if (!leadId || items.length === 0) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading…</div>;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
        Rank your picks
      </h1>
      <p className="mt-3 text-muted-foreground">
        Drag to order — <span className="font-semibold">#1 is the one you'd go to first</span>.
      </p>
      <div className="mt-8">
        <RankList items={items} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

export default function RankPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Loading…</div>}>
      <RankContent />
    </Suspense>
  );
}
