// components/public/footer.tsx
import Link from "next/link";
import { AffiliateDisclosure } from "./affiliate-disclosure";
import { ExpediaBanner } from "./expedia-banner";
import { RealEstateForm } from "./real-estate-form";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-secondary text-secondary-foreground">
      <div className="container mx-auto grid gap-12 px-4 py-12 md:grid-cols-3">
        <div>
          <h3 className="font-jakarta text-xl font-bold">Puerto Rico Masterminds</h3>
          <p className="mt-2 text-sm text-secondary-foreground/80">
            Discover San Juan&apos;s best tours, excursions, and community — and help
            shape what comes next on our beautiful island.
          </p>
          <div className="mt-6 flex items-center justify-start">
            <ExpediaBanner />
          </div>
        </div>

        <div>
          <h4 className="font-semibold">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-secondary-foreground/80">
            <li><Link href="/excursions">Excursions</Link></li>
            <li><Link href="/masterminds">Masterminds</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Interested in Puerto Rico for business?</h4>
          <p className="mt-2 text-sm text-secondary-foreground/80">
            Real estate, Act 60 tax benefits, relocation — we can connect you.
          </p>
          <div className="mt-4">
            <RealEstateForm />
          </div>
        </div>
      </div>

      <div className="border-t border-secondary-foreground/10">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-6 text-xs text-secondary-foreground/60 md:flex-row md:justify-between">
          <span>&copy; {new Date().getFullYear()} Puerto Rico Masterminds. All Rights Reserved.</span>
          <AffiliateDisclosure className="text-secondary-foreground/60 md:max-w-md" />
        </div>
      </div>
    </footer>
  );
}
