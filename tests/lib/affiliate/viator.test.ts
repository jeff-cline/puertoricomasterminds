// tests/lib/affiliate/viator.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildViatorUrl, VIATOR_FALLBACK_URL } from "@/lib/affiliate/viator";

describe("buildViatorUrl", () => {
  beforeEach(() => {
    vi.stubEnv("VIATOR_PID", "P00301140");
    vi.stubEnv("VIATOR_MCID", "42383");
    vi.stubEnv("VIATOR_MEDIUM", "link");
  });

  it("builds a San Juan-level URL with the right params", () => {
    const url = buildViatorUrl({
      slug: "Old-San-Juan",
      attractionId: "d903-a2460",
      campaign: "homepage-hero-cruise-old-san-juan-walking",
    });
    expect(url).toBe(
      "https://www.viator.com/San-Juan-attractions/Old-San-Juan/d903-a2460" +
        "?pid=P00301140&mcid=42383&medium=link" +
        "&campaign=homepage-hero-cruise-old-san-juan-walking",
    );
  });

  it("supports the Puerto-Rico base level", () => {
    const url = buildViatorUrl({
      slug: "Culebra-Island",
      attractionId: "d36-a19414",
      campaign: "gate-yes-culebra",
      baseLevel: "Puerto-Rico",
    });
    expect(url).toContain("/Puerto-Rico-attractions/Culebra-Island/d36-a19414");
    expect(url).toContain("campaign=gate-yes-culebra");
  });

  it("supports the Vieques base level", () => {
    const url = buildViatorUrl({
      slug: "Bioluminescent-Bay",
      attractionId: "d22812-a22596",
      campaign: "vieques-bio",
      baseLevel: "Vieques",
    });
    expect(url).toContain("/Vieques-attractions/Bioluminescent-Bay/d22812-a22596");
  });

  it("kebab-case slugs are preserved exactly (case-sensitive)", () => {
    const url = buildViatorUrl({
      slug: "Castillo-San-Felipe-del-Morro",
      attractionId: "d903-a3885",
      campaign: "x",
    });
    expect(url).toContain("/Castillo-San-Felipe-del-Morro/");
  });

  it("URL-encodes the campaign value if it contains unsafe chars", () => {
    const url = buildViatorUrl({
      slug: "Old-San-Juan",
      attractionId: "d903-a2460",
      campaign: "test space&special",
    });
    const u = new URL(url);
    expect(u.searchParams.get("campaign")).toBe("test space&special");
  });

  it("falls back to the head URL with the supplied campaign when no slug given", () => {
    const url = buildViatorUrl({ campaign: "PRMBOOKBUTTON" });
    expect(url).toBe(
      "https://www.viator.com/Puerto-Rico-attractions/San-Juan-Gate/d36-a19408" +
        "?pid=P00301140&mcid=42383&medium=link&campaign=PRMBOOKBUTTON",
    );
  });

  it("exports a constant fallback URL for direct use", () => {
    expect(VIATOR_FALLBACK_URL).toContain("/San-Juan-Gate/d36-a19408");
  });

  it("throws when PID env vars are missing", () => {
    vi.stubEnv("VIATOR_PID", "");
    expect(() =>
      buildViatorUrl({
        slug: "x",
        attractionId: "y",
        campaign: "z",
      }),
    ).toThrow(/VIATOR_PID/);
  });
});
