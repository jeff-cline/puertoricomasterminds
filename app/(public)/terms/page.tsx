// app/(public)/terms/page.tsx
export default function TermsPage() {
  return (
    <article className="prose prose-neutral container mx-auto max-w-3xl px-4 py-12">
      <h1>Terms of Service</h1>
      <p>
        By using puertoricomasterminds.com you agree these terms. PRM provides information,
        recommendations, and links to third-party booking partners (Viator, Expedia). PRM is not
        the operator of any excursion or mastermind shown on this site; bookings, payments,
        cancellations, and refunds are handled by the third-party provider.
      </p>
      <h2>Coupon redemption</h2>
      <p>
        The Cataño Ferry coupon is provided as a thank-you for completing our survey. Coupons are
        single-use, non-transferable, and subject to vendor availability.
      </p>
      <h2>Disclaimers</h2>
      <p>
        Excursion pricing, availability, and content shown on PRM are sourced from third-party
        partners and may change without notice. Verify details on the booking partner site before
        purchase.
      </p>
    </article>
  );
}
