// components/public/help-modal.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/events";

const COOKIE = "prm_help_modal_shown";
const COOKIE_DAYS = 30;
const DELAY_MS = 12_000;

function hasCookie(): boolean {
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=`));
}

function setCookie() {
  const exp = new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE}=1; expires=${exp}; path=/; SameSite=Lax`;
}

export function HelpModal() {
  const [open, setOpen] = useState(false);
  const [exitTriggered, setExitTriggered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined" || hasCookie()) return;
    const t = setTimeout(() => {
      if (!hasCookie()) {
        setOpen(true);
        trackEvent({ eventType: "modal_view", payload: { trigger: "timer" } });
      }
    }, DELAY_MS);

    const onExit = (e: MouseEvent) => {
      if (!exitTriggered && e.clientY <= 0 && !hasCookie()) {
        setExitTriggered(true);
        setOpen(true);
        trackEvent({ eventType: "modal_view", payload: { trigger: "exit_intent" } });
      }
    };
    document.addEventListener("mouseout", onExit);
    return () => { clearTimeout(t); document.removeEventListener("mouseout", onExit); };
  }, [exitTriggered]);

  function dismiss() {
    setCookie();
    setOpen(false);
    trackEvent({ eventType: "modal_no" });
  }

  function accept() {
    setCookie();
    setOpen(false);
    trackEvent({ eventType: "modal_yes" });
    router.push("/gate/modal:homepage");
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) dismiss(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-jakarta text-2xl text-secondary">
            We need your help
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Our beautiful island is growing, with millions of tourists a year. Help us figure out
            what excursions and events visitors want to see while they're here. Take a quick
            survey and we'll give you a free transportation coupon.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-3">
          <Button onClick={accept} className="bg-prm-coral text-white text-base font-bold hover:bg-prm-coral/90">
            Yes — take the survey
          </Button>
          <button onClick={dismiss} className="text-sm text-muted-foreground underline">
            No thanks
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
