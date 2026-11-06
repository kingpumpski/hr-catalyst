import { describe, expect, it } from "vitest";
import { refereeVaultStorageKey } from "@/lib/refereeVault";

describe("referee vault account isolation", () => {
  it("uses a distinct encrypted storage namespace for each authenticated owner", () => {
    expect(refereeVaultStorageKey("owner-a")).not.toBe(refereeVaultStorageKey("owner-b"));
    expect(refereeVaultStorageKey("owner-a")).toContain(":owner-a");
  });

  it("retains the legacy key only for the explicit migration path", () => {
    expect(refereeVaultStorageKey()).toBe("hr-catalyst-referee-vault-v1");
  });
});
