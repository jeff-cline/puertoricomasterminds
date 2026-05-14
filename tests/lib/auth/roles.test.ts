// tests/lib/auth/roles.test.ts
import { describe, it, expect } from "vitest";
import { can, type Role } from "@/lib/auth/roles";

const all: Role[] = ["super_admin","developer_real_estate","developer_excursion","investor","official","view_only"];

describe("can", () => {
  it("super_admin can do everything", () => {
    for (const action of ["read:leads","write:cms","manage:users","read:real_estate_leads"] as const) {
      expect(can("super_admin", action)).toBe(true);
    }
  });
  it("view_only cannot write anything", () => {
    expect(can("view_only", "write:cms")).toBe(false);
    expect(can("view_only", "manage:users")).toBe(false);
  });
  it("developer_real_estate can read real_estate_leads but not write CMS for excursions", () => {
    expect(can("developer_real_estate", "read:real_estate_leads")).toBe(true);
    expect(can("developer_real_estate", "write:cms")).toBe(false);
  });
  it("developer_excursion can write excursion CMS", () => {
    expect(can("developer_excursion", "write:cms")).toBe(true);
  });
  it("investor and official cannot manage users", () => {
    expect(can("investor", "manage:users")).toBe(false);
    expect(can("official", "manage:users")).toBe(false);
  });
  it("returns false for unknown role", () => {
    expect(can("nope" as Role, "read:leads")).toBe(false);
  });
  it("redactPii is required to see PII for non-super roles on leads", () => {
    expect(can("developer_excursion", "read:leads_pii")).toBe(false);
    expect(can("super_admin", "read:leads_pii")).toBe(true);
  });
});
