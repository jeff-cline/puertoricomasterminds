// app/(public)/masterminds/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getMastermindBySlug } from "@/lib/masterminds/queries";

export default async function MastermindDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = await getMastermindBySlug(slug);
  if (!m) notFound();

  return (
    <article className="container mx-auto max-w-5xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl">
        <Image src={m.image_url} alt={m.title} width={1600} height={900} priority className="h-[400px] w-full object-cover" />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Badge className={m.tier === "paid_t1" ? "bg-prm-coral text-white" : "bg-prm-teal text-white"}>
          {m.tier === "paid_t1" ? "Premier mastermind" : "Local community"}
        </Badge>
        {m.location && <Badge variant="outline">📍 {m.location}</Badge>}
        {m.verified && <Badge variant="secondary">Verified</Badge>}
      </div>
      <h1 className="mt-4 font-jakarta text-4xl font-bold text-secondary">{m.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{m.one_line}</p>
      {m.description && <p className="prose prose-neutral mt-6 max-w-none">{m.description}</p>}
      <div className="mt-10 flex items-center gap-4">
        <Link
          href={`/masterminds/gate/masterminds:${m.slug}`}
          className="inline-flex items-center rounded-lg px-5 py-2.5 text-base font-medium bg-prm-coral hover:bg-prm-coral/90 text-white transition-colors"
        >
          I'm Interested
        </Link>
        <Link href="/masterminds" className="text-sm text-muted-foreground hover:text-secondary">
          ← All masterminds
        </Link>
      </div>
    </article>
  );
}
