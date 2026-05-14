// tests/lib/ranking/borda.test.ts
import { describe, it, expect } from "vitest";
import { bordaScore } from "@/lib/ranking/borda";

describe("bordaScore", () => {
  it("returns 0 for an empty list", () => {
    expect(bordaScore([])).toBe(0);
  });
  it("rank 1 contributes 10 points", () => {
    expect(bordaScore([1])).toBe(10);
  });
  it("rank 10 contributes 1 point", () => {
    expect(bordaScore([10])).toBe(1);
  });
  it("sums correctly across multiple ranks", () => {
    // ranks 1, 3, 5 → (11-1)+(11-3)+(11-5) = 10+8+6 = 24
    expect(bordaScore([1, 3, 5])).toBe(24);
  });
  it("ignores out-of-range ranks", () => {
    expect(bordaScore([0, 11, 1])).toBe(10);
  });
});
