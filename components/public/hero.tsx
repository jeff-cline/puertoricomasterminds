// components/public/hero.tsx
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";

// Iconic El Morro shot — fast-loading (w=1600 q=70 webp) + gradient overlay
// so the headline and tagline stay legible across the full range of image
// brightness. priority + sizes hints help LCP.
const HERO_IMG =
  "https://images.unsplash.com/photo-1589402278102-d3a969a78713?auto=format&fit=crop&w=1600&q=70&fm=webp";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary text-white">
      {/* Background photo */}
      <Image
        src={HERO_IMG}
        alt="El Morro fortress and the Atlantic, Old San Juan"
        width={1600}
        height={750}
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark gradient overlay so headline stays legible regardless of
          the image's local brightness. Heaviest at the bottom-left where
          the text sits, fading to transparent on the right. */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(110deg, rgba(10,37,64,0.85) 0%, rgba(10,37,64,0.65) 40%, rgba(10,37,64,0.25) 75%, rgba(10,37,64,0) 100%)",
        }}
      />
      {/* Bottom vignette so the toggle stays readable on tall mobile */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        aria-hidden
        style={{
          background:
            "linear-gradient(to top, rgba(10,37,64,0.55) 0%, rgba(10,37,64,0) 100%)",
        }}
      />

      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <p
          className="font-jakarta text-xs font-semibold uppercase tracking-[0.2em] text-prm-teal/90"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.45)" }}
        >
          Puerto Rico Masterminds
        </p>
        <h1
          className="mt-3 font-jakarta text-4xl font-bold tracking-tight md:text-6xl"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.55)" }}
        >
          Discover the real Puerto Rico
        </h1>
        <p
          className="mt-4 max-w-2xl text-lg text-white md:text-xl"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.55)" }}
        >
          From bioluminescent bays to UNESCO forts, hand-picked excursions
          for cruise visitors and multi-day travelers alike.
        </p>
        <div className="mt-8">
          <ModeToggle />
        </div>
      </div>
    </section>
  );
}
