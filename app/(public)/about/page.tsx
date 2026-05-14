// app/(public)/about/page.tsx
export default function AboutPage() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-jakarta text-4xl font-bold text-secondary">About Puerto Rico Masterminds</h1>
      <p className="mt-4 text-muted-foreground">
        Puerto Rico Masterminds (PRM) helps visitors discover the island's best experiences and helps
        residents find their community. Every click and survey response feeds an evidence-based model
        for what excursions, masterminds, and events deserve to come next.
      </p>
      <h2 className="mt-10 font-jakarta text-2xl font-semibold text-secondary">Meet your San Juan concierge</h2>
      <p className="mt-3 text-muted-foreground">
        [Placeholder bio — replace with real concierge details from spec §22.5.] We help you find the
        tours, food, and people that make Puerto Rico unforgettable.
      </p>
    </article>
  );
}
