// components/gate/gate-form.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AffiliateDisclosure } from "@/components/public/affiliate-disclosure";
import { trackEvent } from "@/lib/analytics/events";
import { getOrCreateSessionId } from "@/lib/analytics/session";

export interface GateFormProps {
  origin: string;                 // "excursions:<slug>" or "masterminds:<slug>" or "modal:homepage"
  funnel: "tourist" | "masterminds";
  /** URL to send the user on "no" path (already includes campaign params). */
  noPathRedirectUrl: string;
  /** "Yes" path inside the funnel — typically "/survey" or "/masterminds/survey". */
  yesPathHref: string;
}

interface SubmitArgs {
  decision: "yes" | "no";
  email: string;
  first_name: string;
  last_name: string;
  origin: string;
  funnel: "tourist" | "masterminds";
  session_id: string;
}

async function submitGate(args: SubmitArgs): Promise<{ leadId: string; couponCode: string | null }> {
  const res = await fetch("/api/gate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function GateForm({ origin, funnel, noPathRedirectUrl, yesPathHref }: GateFormProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const formValid = email.includes("@") && firstName.trim() && lastName.trim();

  function go(decision: "yes" | "no") {
    if (!formValid) {
      setError("Please enter your name and email to continue.");
      return;
    }
    setError(null);
    const session_id = getOrCreateSessionId();

    startTransition(async () => {
      try {
        const { leadId, couponCode } = await submitGate({
          decision, email, first_name: firstName, last_name: lastName,
          origin, funnel, session_id,
        });
        await trackEvent({
          eventType: decision === "yes" ? "gate_yes" : "gate_no",
          payload: { origin, funnel },
          leadId,
        });
        if (decision === "yes") {
          // pass leadId + couponCode forward via cookie (set by server) and navigate
          router.push(`${yesPathHref}?lead=${leadId}${couponCode ? `&coupon=${couponCode}` : ""}`);
        } else {
          window.location.href = noPathRedirectUrl;
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-lg">
      <div className="space-y-3">
        <div>
          <Label htmlFor="first">First name</Label>
          <Input id="first" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="last">Last name</Label>
          <Input id="last" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="button"
        size="lg"
        disabled={!formValid || pending}
        onClick={() => go("yes")}
        className="w-full bg-prm-coral text-white text-base font-bold hover:bg-prm-coral/90"
      >
        {pending ? "One moment…" : "Yes — receive my free Transportation Coupon"}
      </Button>

      <button
        type="button"
        disabled={!formValid || pending}
        onClick={() => go("no")}
        className="block w-full text-center text-sm text-muted-foreground underline hover:text-secondary disabled:opacity-50"
      >
        No thanks, take me to my excursion
      </button>

      <AffiliateDisclosure />
    </div>
  );
}
