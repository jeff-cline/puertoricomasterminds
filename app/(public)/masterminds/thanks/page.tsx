// app/(public)/masterminds/thanks/page.tsx
"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function MastermindsThanksContent() {
  const sp = useSearchParams();
  const slug = sp.get("slug");
  const [countdown, setCountdown] = useState(5);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/masterminds-list`)
      .then((r) => r.json())
      .then((all: { slug: string; destination_url: string; title: string }[]) => {
        const found = all.find((m) => m.slug === slug);
        if (found) setRedirectUrl(found.destination_url);
      });
  }, [slug]);

  useEffect(() => {
    if (!redirectUrl) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    const t = setTimeout(() => { window.location.href = redirectUrl; }, 5000);
    return () => { clearInterval(id); clearTimeout(t); };
  }, [redirectUrl]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-jakarta text-4xl font-bold text-secondary">Thank you</h1>
      <p className="mt-4 text-muted-foreground">
        Your input shapes what our island community looks like next. We'll be in touch.
      </p>
      {redirectUrl ? (
        <>
          <p className="mt-8 text-sm text-muted-foreground">
            Taking you to your mastermind in <span className="font-bold text-prm-coral">{Math.max(countdown, 0)}</span>…
          </p>
          <a href={redirectUrl} className="mt-2 inline-block text-prm-teal underline">
            Go now →
          </a>
        </>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">Loading destination…</p>
      )}
    </div>
  );
}

export default function MastermindsThanksPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Loading…</div>}>
      <MastermindsThanksContent />
    </Suspense>
  );
}
