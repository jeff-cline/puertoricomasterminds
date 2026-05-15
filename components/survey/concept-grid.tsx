// components/survey/concept-grid.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics/events";

export interface ConceptCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  is_sensitive: boolean;
}

const MIN_PICKS = 5;
const MAX_PICKS = 10;

export function ConceptGrid({
  concepts,
  leadId,
  onSubmit,
}: {
  concepts: ConceptCardData[];
  leadId: string;
  onSubmit: (pickedIds: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  function toggle(id: string) {
    setPicked((cur) => {
      if (cur.includes(id)) {
        trackEvent({ eventType: "survey_unpick", entityType: "future_excursion", entityId: id, leadId });
        return cur.filter((x) => x !== id);
      }
      if (cur.length >= MAX_PICKS) return cur;
      trackEvent({ eventType: "survey_pick", entityType: "future_excursion", entityId: id, leadId });
      return [...cur, id];
    });
  }

  const canSubmit = picked.length >= MIN_PICKS && !pending;

  return (
    <>
      <div className="sticky top-16 z-30 mb-8 rounded-xl border bg-white/80 p-4 shadow-sm backdrop-blur">
        <p className="text-sm text-secondary">
          Pick <span className="font-bold">at least {MIN_PICKS}</span>, up to {MAX_PICKS} —
          you've picked <span className="font-bold text-prm-coral">{picked.length}</span>.
        </p>
        <Button
          className="mt-3 w-full bg-prm-coral hover:bg-prm-coral/90 text-white"
          disabled={!canSubmit}
          onClick={() => { setPending(true); onSubmit(picked); }}
        >
          {pending ? "Continuing…" : `Continue to ranking (${picked.length} picked)`}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {concepts.map((c) => {
          const isPicked = picked.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggle(c.id)}
              className={`group overflow-hidden rounded-xl border bg-card text-left shadow-sm transition ${
                isPicked ? "ring-2 ring-prm-coral" : "hover:shadow-md"
              }`}
            >
              <div className="relative aspect-[4/3]">
                <Image src={c.image_url} alt={c.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                <Badge className="absolute left-3 top-3 bg-prm-teal text-white">Coming Soon / Under Review</Badge>
                <div className={`absolute right-3 top-3 rounded-full p-2 ${
                  isPicked ? "bg-prm-coral text-white" : "bg-white/90 text-secondary"
                }`}>
                  <Star className="h-5 w-5" fill={isPicked ? "currentColor" : "none"} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-jakarta text-lg font-semibold text-secondary">{c.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
