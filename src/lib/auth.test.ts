import { describe, expect, it } from "vitest";
import { hasOwnerRole } from "@/lib/auth";

describe("owner role", () => {
  it("accepts only the server-assigned app metadata owner role", () => {
    expect(hasOwnerRole({ role: "owner" })).toBe(true);
    expect(hasOwnerRole({ role: "viewer" })).toBe(false);
    expect(hasOwnerRole({ role: "viewer", user_metadata: { role: "owner" } })).toBe(false);
    expect(hasOwnerRole(null)).toBe(false);
    expect(hasOwnerRole(undefined)).toBe(false);
  });
});
