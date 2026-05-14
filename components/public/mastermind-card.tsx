// components/public/mastermind-card.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export interface MastermindCardData {
  id: string;
  slug: string;
  title: string;
  one_line: string;
  image_url: string;
  tier: "paid_t1" | "local_t2";
  location: string | null;
  verified: boolean;
}

export function MastermindCard({ mastermind: m }: { mastermind: MastermindCardData }) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md">
      <Link href={`/masterminds/gate/masterminds:${m.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={m.image_url} alt={m.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition group-hover:scale-105" />
          <Badge className={`absolute left-3 top-3 ${m.tier === "paid_t1" ? "bg-prm-coral text-white" : "bg-prm-teal text-white"}`}>
            {m.tier === "paid_t1" ? "Premier" : "Community"}
          </Badge>
          {m.verified && <Badge className="absolute right-3 top-3 bg-secondary/90 text-white">Verified</Badge>}
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-jakarta text-lg font-semibold text-secondary">{m.title}</h3>
          <p className="line-clamp-2 text-sm text-muted-foreground">{m.one_line}</p>
          {m.location && <p className="text-xs text-muted-foreground">📍 {m.location}</p>}
        </div>
        <div className="border-t bg-prm-offwhite px-4 py-3">
          <span className="text-sm font-semibold text-prm-teal">Learn more →</span>
        </div>
      </Link>
    </article>
  );
}
