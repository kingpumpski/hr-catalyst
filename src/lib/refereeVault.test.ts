import { describe, expect, it, vi } from "vitest";
import { hasRefereeVault, refereeVaultStorageKey, unlockRefereeVault } from "@/lib/refereeVault";

describe("referee vault account isolation", () => {
  it("uses a distinct encrypted storage namespace for each authenticated owner", () => {
    expect(refereeVaultStorageKey("owner-a")).not.toBe(refereeVaultStorageKey("owner-b"));
    expect(refereeVaultStorageKey("owner-a")).toContain(":owner-a");
  });

  it("does not treat an anonymous legacy vault as belonging to an authenticated owner", () => {
    const getItem = vi.fn((key: string) => key === refereeVaultStorageKey() ? "legacy-ciphertext" : null);
    vi.stubGlobal("window", { localStorage: { getItem } });
    vi.stubGlobal("localStorage", { getItem });

    expect(hasRefereeVault("owner-a")).toBe(false);
    expect(getItem).toHaveBeenCalledTimes(1);
    expect(getItem).toHaveBeenCalledWith(refereeVaultStorageKey("owner-a"));
    vi.unstubAllGlobals();
  });

  it("retains the legacy key only for the unauthenticated storage namespace", () => {
    expect(refereeVaultStorageKey()).toBe("hr-catalyst-referee-vault-v1");
  });

  it("does not fall back to the anonymous vault when an owner has no vault", async () => {
    const getItem = vi.fn(() => null);
    vi.stubGlobal("localStorage", { getItem });
    await expect(unlockRefereeVault("password", "owner-a")).resolves.toEqual([]);
    expect(getItem).toHaveBeenCalledTimes(1);
    expect(getItem).toHaveBeenCalledWith(refereeVaultStorageKey("owner-a"));
    vi.unstubAllGlobals();
  });
});
