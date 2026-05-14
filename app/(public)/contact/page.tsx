// app/(public)/contact/page.tsx
const WA = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? "";

export default function ContactPage() {
  const waUrl = WA
    ? `https://api.whatsapp.com/send?phone=${WA.replace(/[^\d]/g, "")}`
    : null;

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-jakarta text-4xl font-bold text-secondary">Contact</h1>
      <p className="mt-4 text-muted-foreground">
        Reach the PRM team for partnership, press, or general questions.
      </p>
      <ul className="mt-8 space-y-3 text-secondary">
        <li>📧 <a href="mailto:jeff.cline@me.com" className="text-prm-teal hover:underline">jeff.cline@me.com</a></li>
        {waUrl && <li>💬 <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-prm-teal hover:underline">WhatsApp us</a></li>}
      </ul>
    </article>
  );
}
