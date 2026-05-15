// lib/leads/create-lead.ts
"use server";
import { getServerSupabase } from "@/lib/supabase/server";
import { generateCouponCode } from "@/lib/coupon/generate-code";
import { validateLeadInput, type LeadInput } from "@/lib/leads/validate";

export async function createLead(input: LeadInput): Promise<{ leadId: string; couponCode: string | null }> {
  const err = validateLeadInput(input);
  if (err) throw new Error(err);

  const supabase = await getServerSupabase();
  const couponCode = input.funnel === "tourist" ? generateCouponCode() : null;

  // Auto cruise-tagging is best-effort. RLS blocks anon SELECT on
  // daily_port_calls, so this returns empty for anonymous funnel visitors —
  // that's expected. Any error here must NOT block lead creation.
  let cruiseFields: Record<string, string> = {};
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data: portCalls } = await (supabase as any)
      .from("daily_port_calls")
      .select("ship_name, cruise_line, demo_segment, call_type")
      .eq("call_date", today);
    const firstShip = portCalls?.[0];
    if (firstShip) {
      cruiseFields = {
        cruise_ship: firstShip.ship_name,
        cruise_line: firstShip.cruise_line,
        cruise_call_type: firstShip.call_type,
        cruise_demo_segment: firstShip.demo_segment,
      };
    }
  } catch {
    // swallow — cruise tagging is enrichment, never blocks lead capture
  }

  // Generate the lead id client-side so we can return it WITHOUT chaining
  // .select() after .insert(). PostgREST's post-insert SELECT (triggered by
  // the `Prefer: return=representation` header supabase-js adds when you
  // call .select()) is blocked by RLS for anon — surfaces as a confusing
  // 42501 "row violates RLS" even though the INSERT itself was fine.
  const leadId = crypto.randomUUID();

  const { error } = await (supabase as any)
    .from("leads")
    .insert({
      id: leadId,
      email: input.email.toLowerCase().trim(),
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      phone: input.phone ?? null,
      funnel: input.funnel,
      source_origin: input.source_origin ?? null,
      session_id: input.session_id ?? null,
      consent_marketing: input.consent_marketing ?? false,
      coupon_code: couponCode,
      payload: input.payload ?? {},
      ...cruiseFields,
    });

  if (error) throw error;
  return { leadId, couponCode };
}
