// components/public/affiliate-disclosure.tsx
export function AffiliateDisclosure({ className }: { className?: string }) {
  return (
    <p className={`text-xs text-muted-foreground ${className ?? ""}`}>
      Puerto Rico Masterminds participates in the Viator and Expedia affiliate
      programs. We may earn a commission on bookings made through links on this
      site, at no extra cost to you. We only recommend experiences we believe in.
    </p>
  );
}
