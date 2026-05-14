// app/(public)/masterminds/page.tsx
import { listMasterminds } from "@/lib/masterminds/queries";
import { MastermindCard } from "@/components/public/mastermind-card";

export default async function MastermindsPage() {
  const masterminds = await listMasterminds();
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="font-jakarta text-4xl font-bold text-secondary md:text-5xl">
          Masterminds & Community on the Island
        </h1>
        <p className="mt-4 text-muted-foreground">
          A curated mix of entrepreneur peer groups and local communities for everyone making
          Puerto Rico home. Tell us which ones matter to you — we'll help shape what comes next.
        </p>
      </header>
      <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {masterminds.map((m: MastermindCard_Item) => <MastermindCard key={m.id} mastermind={m} />)}
      </section>
    </div>
  );
}

// local alias for the untyped DB row
type MastermindCard_Item = {
  id: string;
  slug: string;
  title: string;
  one_line: string;
  image_url: string;
  tier: "paid_t1" | "local_t2";
  location: string | null;
  verified: boolean;
};
