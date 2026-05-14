// app/(public)/masterminds/survey/page.tsx
"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConceptGrid, type ConceptCardData } from "@/components/survey/concept-grid";

function MastermindsSurveyContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const leadId = sp.get("lead");
  const [items, setItems] = useState<ConceptCardData[]>([]);

  useEffect(() => {
    if (!leadId) {
      router.replace("/masterminds");
      return;
    }
    fetch("/api/masterminds-list")
      .then((r) => r.json())
      .then((data) =>
        setItems(
          data.map((m: { id: string; slug: string; title: string; one_line: string; image_url: string }) => ({
            id: m.id, slug: m.slug, title: m.title,
            description: m.one_line, image_url: m.image_url, is_sensitive: false,
          })),
        ),
      );
  }, [leadId, router]);

  async function handleSubmit(pickedIds: string[]) {
    await fetch("/api/survey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, pickedIds }),
    });
    router.push(`/masterminds/rank?lead=${leadId}`);
  }

  if (!leadId || items.length === 0) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading…</div>;
  }
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-jakarta text-3xl font-bold text-secondary md:text-4xl">
          Star the ones you're most interested in
        </h1>
        <p className="mt-4 text-muted-foreground">
          Pick at least 5 that you'd actually want to join or attend.
        </p>
      </div>
      <div className="mt-8">
        <ConceptGrid concepts={items} leadId={leadId} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

export default function MastermindsSurveyPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Loading…</div>}>
      <MastermindsSurveyContent />
    </Suspense>
  );
}
