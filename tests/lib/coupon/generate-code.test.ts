// tests/lib/coupon/generate-code.test.ts
import { describe, it, expect } from "vitest";
import { generateCouponCode } from "@/lib/coupon/generate-code";

describe("generateCouponCode", () => {
  it("returns a string starting with PR and 6 alphanumeric chars", () => {
    const code = generateCouponCode();
    expect(code).toMatch(/^PR[A-Z0-9]{6}$/);
  });

  it("excludes ambiguous chars (0, O, 1, I, L)", () => {
    for (let i = 0; i < 100; i++) {
      expect(generateCouponCode()).not.toMatch(/[0OIL1]/);
    }
  });

  it("produces unique values across 1000 invocations", () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) set.add(generateCouponCode());
    expect(set.size).toBeGreaterThan(995);
  });
});
