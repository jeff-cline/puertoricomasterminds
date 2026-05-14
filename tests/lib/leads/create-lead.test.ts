// tests/lib/leads/create-lead.test.ts
import { describe, it, expect, vi } from "vitest";
import { validateLeadInput } from "@/lib/leads/create-lead";

describe("validateLeadInput", () => {
  const good = { email: "a@b.co", first_name: "A", last_name: "B", funnel: "tourist" as const };

  it("returns null for a valid input", () => {
    expect(validateLeadInput(good)).toBeNull();
  });

  it("rejects missing email", () => {
    expect(validateLeadInput({ ...good, email: "" })).toMatch(/email/i);
  });

  it("rejects malformed email", () => {
    expect(validateLeadInput({ ...good, email: "not-an-email" })).toMatch(/email/i);
  });

  it("rejects missing first name", () => {
    expect(validateLeadInput({ ...good, first_name: "" })).toMatch(/name/i);
  });

  it("rejects missing last name", () => {
    expect(validateLeadInput({ ...good, last_name: "" })).toMatch(/name/i);
  });

  it("rejects unknown funnel", () => {
    expect(validateLeadInput({ ...good, funnel: "bogus" as never })).toMatch(/funnel/i);
  });
});
