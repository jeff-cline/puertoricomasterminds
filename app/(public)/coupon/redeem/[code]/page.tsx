// app/(public)/coupon/redeem/[code]/page.tsx
import { notFound } from "next/navigation";
import { getServiceRoleSupabase } from "@/lib/supabase/admin";

export default async function CouponRedeemPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = getServiceRoleSupabase();
  const { data: lead } = await (supabase as any)
    .from("leads")
    .select("first_name, last_name, coupon_code, coupon_redeemed_at, coupon_redeemed_vendor_id, created_at")
    .eq("coupon_code", code.toUpperCase())
    .maybeSingle();

  if (!lead) notFound();

  return (
    <div className="container mx-auto max-w-xl px-4 py-16">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Coupon validation</p>
        <p className="mt-2 font-mono text-3xl font-bold text-prm-coral">{lead.coupon_code}</p>
        <div className="mt-4 space-y-1 text-sm">
          <p><span className="text-muted-foreground">Issued to:</span> {lead.first_name} {lead.last_name}</p>
          <p><span className="text-muted-foreground">Issued on:</span> {new Date(lead.created_at).toLocaleDateString()}</p>
          <p>
            <span className="text-muted-foreground">Status:</span>{" "}
            {lead.coupon_redeemed_at ? (
              <span className="font-semibold text-green-600">Redeemed on {new Date(lead.coupon_redeemed_at).toLocaleDateString()}</span>
            ) : (
              <span className="font-semibold text-prm-coral">Valid — not yet redeemed</span>
            )}
          </p>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          v1: Vendor-side redemption updates land in Phase 2 admin tooling.
        </p>
      </div>
    </div>
  );
}
