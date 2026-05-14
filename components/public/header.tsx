// components/public/header.tsx
import Link from "next/link";
import { TripAdvisorBadge } from "./tripadvisor-badge";

const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";

export function Header() {
  const waUrl = WHATSAPP_PHONE
    ? `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE.replace(/[^\d]/g, "")}`
    : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-jakarta text-lg font-bold tracking-tight text-secondary">
            Puerto Rico <span className="text-prm-teal">Masterminds</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-secondary">
          <Link href="/excursions">Excursions</Link>
          <Link href="/masterminds">Masterminds</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-3">
          <TripAdvisorBadge />
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
               className="hidden lg:inline text-sm text-secondary hover:text-prm-teal">
              WhatsApp
            </a>
          )}
          <Link
            href="/excursions"
            className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium bg-prm-coral hover:bg-prm-coral/90 text-white transition-colors"
          >
            Book a Tour
          </Link>
        </div>
      </div>
    </header>
  );
}
