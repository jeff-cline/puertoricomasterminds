// app/(public)/excursions/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getExcursionBySlug } from "@/lib/excursions/queries";

export default async function ExcursionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const excursion = await getExcursionBySlug(slug);
  if (!excursion) notFound();

  const hrs =
    excursion.duration_max && excursion.duration_max !== excursion.duration_min
      ? `${Math.round(excursion.duration_min / 60)}–${Math.round(excursion.duration_max / 60)} hours`
      : `${Math.round(excursion.duration_min / 60)} hours`;

  const typeLabel =
    excursion.type === "cruise_day"
      ? "Cruise Day"
      : excursion.type === "multi_day"
        ? "Multi-Day Stay"
        : "Cruise or Stay";

  return (
    <article className="container mx-auto max-w-5xl px-4 py-12">
      <div className="overflow-hidden rounded-2xl">
        <Image
          src={excursion.image_url}
          alt={excursion.title}
          width={1600}
          height={900}
          className="h-[400px] w-full object-cover"
          priority
        />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Badge className="bg-prm-teal text-white">{typeLabel}</Badge>
        {excursion.category && <Badge variant="outline">{excursion.category}</Badge>}
      </div>
      <h1 className="mt-4 font-jakarta text-4xl font-bold text-secondary">{excursion.title}</h1>
      <p className="mt-3 text-lg text-muted-foreground">{excursion.short_description}</p>
      <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border bg-card p-6 md:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">From</dt>
          <dd className="mt-1 text-2xl font-bold text-prm-coral">${excursion.price_from_usd}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Duration</dt>
          <dd className="mt-1 text-2xl font-bold text-secondary">{hrs}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Best for</dt>
          <dd className="mt-1 text-secondary">{typeLabel}</dd>
        </div>
      </dl>
      {excursion.long_description && (
        <div className="prose prose-neutral mt-8 max-w-none">
          <p>{excursion.long_description}</p>
        </div>
      )}
      <div className="mt-10 flex items-center gap-4">
        <Link
          href={`/gate/excursions:${excursion.slug}`}
          className="inline-flex items-center rounded-lg px-5 py-2.5 text-base font-medium bg-prm-coral hover:bg-prm-coral/90 text-white transition-colors"
        >
          Book this Excursion
        </Link>
        <Link href="/excursions" className="text-sm text-muted-foreground hover:text-secondary">
          ← All excursions
        </Link>
      </div>
    </article>
  );
}
