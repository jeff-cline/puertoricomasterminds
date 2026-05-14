// app/(public)/survey/page.tsx
"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConceptGrid, type ConceptCardData } from "@/components/survey/concept-grid";

function SurveyContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const leadId = sp.get("lead");
  const couponCode = sp.get("coupon");
  const [concepts, setConcepts] = useState<ConceptCardData[]>([]);

  useEffect(() => {
    if (!leadId) {
      router.replace("/");
      return;
    }
    fetch("/api/concepts")
      .then((r) => r.json())
      .then(setConcepts);
  }, [leadId, router]);

  async function handleSubmit(pickedIds: string[]) {
    await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, pickedIds }),
    });
    const qs = new URLSearchParams({ lead: leadId!, ...(couponCode ? { coupon: couponCode } : {}) });
    router.push(`/rank?${qs.toString()}`);
  }

  if (!leadId || concepts.length === 0) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading…</div>;
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
          Star your top picks
        </h1>
        <p className="mt-4 text-muted-foreground">
          These experiences are under review. Star the ones you'd actually want to do on our island.
        </p>
      </div>
      <div className="mt-8">
        <ConceptGrid concepts={concepts} leadId={leadId} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Loading…</div>}>
      <SurveyContent />
    </Suspense>
  );
}
