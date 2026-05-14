// lib/supabase/types.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      excursions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      future_excursions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      masterminds: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      featured_destinations: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      vendors: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      leads: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      events: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      rankings: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      users: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      audit_log: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
      daily_port_calls: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> };
    };
    Views: {
      v_daily_leads: { Row: Record<string, unknown> };
      v_weekly_leads: { Row: Record<string, unknown> };
      v_monthly_leads: { Row: Record<string, unknown> };
      v_top_excursions_30d: { Row: Record<string, unknown> };
      v_future_excursion_leaderboard: { Row: Record<string, unknown> };
      v_mastermind_leaderboard: { Row: Record<string, unknown> };
      v_gate_conversion: { Row: Record<string, unknown> };
      v_tourist_funnel: { Row: Record<string, unknown> };
      v_leads_by_cruise_demo: { Row: Record<string, unknown> };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
