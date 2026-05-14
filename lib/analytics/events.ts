// lib/analytics/events.ts
"use client";
import { getOrCreateSessionId } from "./session";

export type EventType =
  | "card_click"
  | "gate_view"
  | "gate_yes"
  | "gate_no"
  | "survey_pick"
  | "survey_unpick"
  | "rank_submit"
  | "coupon_view"
  | "coupon_download"
  | "book_button_click"
  | "featured_click"
  | "modal_view"
  | "modal_yes"
  | "modal_no"
  | "real_estate_submit";

export type EventEntityType =
  | "excursion"
  | "future_excursion"
  | "mastermind"
  | "featured_destination"
  | "vendor"
  | "masterminds_funnel"
  | "tourist_funnel";

export interface TrackEventInput {
  eventType: EventType;
  entityType?: EventEntityType;
  entityId?: string;
  leadId?: string;
  payload?: Record<string, unknown>;
}

export async function trackEvent(input: TrackEventInput): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        sessionId: getOrCreateSessionId(),
        pagePath: window.location.pathname,
        referrer: document.referrer || null,
      }),
      keepalive: true,
    });
  } catch (e) {
    // Analytics failures must not break the funnel
    console.warn("trackEvent failed", e);
  }
}
