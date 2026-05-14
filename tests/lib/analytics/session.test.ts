// tests/lib/analytics/session.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { getOrCreateSessionId } from "@/lib/analytics/session";

describe("getOrCreateSessionId", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("creates a new UUID-like id on first call", () => {
    const id = getOrCreateSessionId();
    expect(id).toMatch(/^[a-z0-9-]{20,}$/i);
  });

  it("returns the same id on subsequent calls", () => {
    const first = getOrCreateSessionId();
    const second = getOrCreateSessionId();
    expect(second).toBe(first);
  });

  it("stores under the prm_session_id key", () => {
    const id = getOrCreateSessionId();
    expect(localStorage.getItem("prm_session_id")).toBe(id);
  });
});
