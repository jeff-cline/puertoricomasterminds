// lib/leads/create-lead.ts
"use server";
import { getServerSupabase } from "@/lib/supabase/server";
import { generateCouponCode } from "@/lib/coupon/generate-code";

export type Funnel = "tourist" | "masterminds" | "real_estate";

export interface LeadInput {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  funnel: Funnel;
  source_origin?: string;
  session_id?: string;
  consent_marketing?: boolean;
  payload?: Record<string, unknown>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadInput(input: LeadInput): string | null {
  if (!input.email || !EMAIL_RE.test(input.email)) return "valid email is required";
  if (!input.first_name?.trim()) return "first name is required";
  if (!input.last_name?.trim()) return "last name is required";
  if (!["tourist", "masterminds", "real_estate"].includes(input.funnel)) return "invalid funnel";
  return null;
}

export async function createLead(input: LeadInput): Promise<{ leadId: string; couponCode: string | null }> {
  const err = validateLeadInput(input);
  if (err) throw new Error(err);

  const supabase = await getServerSupabase();
  const couponCode = input.funnel === "tourist" ? generateCouponCode() : null;

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
    })
    .select("id, coupon_code")
    .single();

  if (error) throw error;
  return { leadId: data.id, couponCode: data.coupon_code };
}
