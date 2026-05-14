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

  const today = new Date().toISOString().slice(0, 10);
  const { data: portCalls } = await (supabase as any)
    .from("daily_port_calls")
    .select("ship_name, cruise_line, demo_segment, call_type")
    .eq("call_date", today);

  const firstShip = portCalls?.[0];
  const cruiseFields = firstShip ? {
    cruise_ship: firstShip.ship_name,
    cruise_line: firstShip.cruise_line,
    cruise_call_type: firstShip.call_type,
    cruise_demo_segment: firstShip.demo_segment,
  } : {};

  const { data, error } = await (supabase as any)
    .from("leads")
    .insert({
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
    })
    .select("id, coupon_code")
    .single();

  if (error) throw error;
  return { leadId: data.id, couponCode: data.coupon_code };
}
