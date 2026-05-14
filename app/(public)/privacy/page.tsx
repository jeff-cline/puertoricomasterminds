// app/(public)/privacy/page.tsx
export default function PrivacyPage() {
  return (
    <article className="prose prose-neutral container mx-auto max-w-3xl px-4 py-12">
      <h1>Privacy Policy</h1>
      <p>
        Puerto Rico Masterminds ("we", "us") collects the information you provide via our forms
        (name, email, phone) and analytics about how you use our site. We use this to provide our
        service, improve the experience, and follow up about excursions, masterminds, and real
        estate opportunities you've expressed interest in.
      </p>
      <h2>Affiliate disclosure</h2>
      <p>
        We participate in the Viator and Expedia affiliate programs. When you click a "Book" link
        and complete a purchase, we may earn a commission at no extra cost to you. We only
        recommend experiences and partners we believe in.
      </p>
      <h2>Sharing</h2>
      <p>
        We do not sell your data. We share lead information with our hosting and email providers
        (Supabase, Vercel, and the user's go-live agent) only as needed to operate the service.
      </p>
      <h2>Your rights</h2>
      <p>
        Email <a href="mailto:jeff.cline@me.com">jeff.cline@me.com</a> to request access,
        correction, or deletion of your data.
      </p>
    </article>
  );
}
