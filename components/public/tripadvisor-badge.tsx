// components/public/tripadvisor-badge.tsx
import Image from "next/image";

export function TripAdvisorBadge() {
  return (
    <div
      aria-label="TripAdvisor 5-star rating (placeholder until live listing)"
      className="hidden md:flex items-center gap-2 text-xs text-secondary"
    >
      <Image
        src="/images/tripadvisor-5-star-placeholder.svg"
        alt="TripAdvisor 5 stars"
        width={96}
        height={20}
        priority
      />
      <span className="font-semibold">5.0 · TripAdvisor</span>
    </div>
  );
}
