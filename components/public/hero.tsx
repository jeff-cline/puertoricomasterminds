// components/public/hero.tsx
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-secondary text-white">
      <Image
        src="https://images.unsplash.com/photo-1591017403286-fd8493524e1d?auto=format&fit=crop&w=1920&q=80"
        alt="Castillo San Felipe del Morro at sunset, Old San Juan"
        width={1920}
        height={900}
        priority
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="relative container mx-auto px-4 py-24 md:py-32">
        <h1 className="font-jakarta text-4xl font-bold tracking-tight md:text-6xl">
          Discover the real Puerto Rico
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-white/90">
          From bioluminescent bays to UNESCO forts, hand-picked excursions for cruise visitors and multi-day travelers alike.
        </p>
        <div className="mt-8">
          <ModeToggle />
        </div>
      </div>
    </section>
  );
}
