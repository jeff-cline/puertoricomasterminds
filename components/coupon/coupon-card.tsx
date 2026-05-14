// components/coupon/coupon-card.tsx
"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, MapPin } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";

const FERRY_MAPS_URL = "https://www.google.com/maps/dir/?api=1&destination=AcuaExpreso+Cataño+Ferry+Terminal+Old+San+Juan";

export function CouponCard({
  code,
  name,
  email,
  leadId,
}: {
  code: string;
  name: string;
  email: string;
  leadId: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  async function downloadPdf() {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, { backgroundColor: "#ffffff" });
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`PRM-Ferry-Coupon-${code}.pdf`);
    await trackEvent({ eventType: "coupon_download", leadId, payload: { code } });
  }

  return (
    <div className="space-y-4">
      <div ref={ref} className="rounded-2xl border-2 border-dashed border-prm-teal bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-jakarta text-xs uppercase tracking-widest text-prm-teal">Free Ferry Round-Trip</p>
            <h2 className="font-jakarta text-3xl font-bold text-secondary">Cataño Ferry · Round Trip</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Code</p>
            <p className="font-mono text-2xl font-bold text-prm-coral">{code}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Issued to</p>
            <p className="font-semibold text-secondary">{name}</p>
            <p className="text-muted-foreground">{email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Valid for</p>
            <p className="font-semibold text-secondary">One round-trip ride · AcuaExpreso Cataño</p>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Show this coupon at the AcuaExpreso terminal (Pier 2, Old San Juan). Redeem at any
          participating Cataño-side vendor below for a refund of your fare. Thanks for helping
          shape Puerto Rico's future.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={downloadPdf} className="bg-prm-teal hover:bg-prm-teal/90">
          <Download className="mr-2 h-4 w-4" /> Download Coupon (PDF)
        </Button>
        <a href={FERRY_MAPS_URL} target="_blank" rel="noopener noreferrer">
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" /> Directions to Ferry Terminal
          </Button>
        </a>
      </div>
    </div>
  );
}
