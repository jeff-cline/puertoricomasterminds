// tests/lib/affiliate/campaign.test.ts
import { describe, it, expect } from "vitest";
import { campaignHandle } from "@/lib/affiliate/campaign";

describe("campaignHandle", () => {
  it("joins context + decision + entity slug with hyphens", () => {
    expect(
      campaignHandle({
        context: "homepage-hero",
        decision: "click",
        entitySlug: "vieques-bio-bay",
      }),
    ).toBe("homepage-hero-click-vieques-bio-bay");
  });

  it("kebab-cases free-text inputs (preserves intentional dashes)", () => {
    expect(
      campaignHandle({
        context: "Excursions Grid",
        decision: "Gate YES",
        entitySlug: "Old San Juan",
      }),
    ).toBe("excursions-grid-gate-yes-old-san-juan");
  });

  it("caps the result at 64 chars (Viator's reasonable upper bound)", () => {
    const out = campaignHandle({
      context: "very-long-context-name-that-might-overflow",
      decision: "gate-yes-with-coupon-download-button-click",
      entitySlug: "extra-long-entity-slug-name",
    });
    expect(out.length).toBeLessThanOrEqual(64);
  });

  it("does not produce trailing or doubled hyphens", () => {
    const out = campaignHandle({
      context: "homepage",
      decision: " ",
      entitySlug: "x",
    });
    expect(out).not.toMatch(/--/);
    expect(out).not.toMatch(/-$/);
  });
});
