// app/(public)/real-estate-interest/page.tsx
import Link from "next/link";

export default function RealEstateInterestPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-jakarta text-4xl font-bold text-secondary">Thanks — we'll be in touch.</h1>
      <p className="mt-4 text-muted-foreground">
        Someone from our team will follow up about real estate and/or Act 60 on the island.
      </p>
      <Link href="/" className="mt-8 inline-block text-prm-teal hover:underline">← Back home</Link>
    </div>
  );
}
