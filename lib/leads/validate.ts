// lib/leads/validate.ts
// Pure validation logic — no server dependencies.

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
