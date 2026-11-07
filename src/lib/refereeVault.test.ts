import { describe, expect, it, vi } from "vitest";
import { clearRefereeVaultForSession, hasRefereeVault, hasRefereeVaultForSession, refereeVaultStorageKey, unlockRefereeVault, saveRefereeVaultForSession, unlockRefereeVaultForSession } from "@/lib/refereeVault";
import { requestSupabase } from "@/lib/supabaseAuth";

vi.mock("@/lib/supabaseAuth", () => ({ requestSupabase: vi.fn() }));

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

describe("encrypted cloud referee vault", () => {
  const session = {
    access_token: "owner-access-token",
    refresh_token: "owner-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: 0,
    user: { id: "owner-123" },
  };
  const referee = {
    id: "ref-1",
    name: "Private Referee",
    role: "Director",
    organization: "Example Organisation",
    relationship: "Former supervisor",
    email: "referee@example.test",
    phone: "+233000000000",
    notes: "Confidential private note",
  };

  it("sends encrypted ciphertext only and scopes the write to the signed-in owner", async () => {
    vi.mocked(requestSupabase).mockResolvedValueOnce(null as never);
    vi.stubGlobal("localStorage", { setItem: vi.fn() });

    await saveRefereeVaultForSession([referee], "a-long-test-passphrase", session);

    const [path, options] = vi.mocked(requestSupabase).mock.calls[0] as unknown as [
      string,
      { method: string; accessToken: string; body: Record<string, unknown> },
    ];
    expect(path).toContain("on_conflict=user_id");
    expect(options.method).toBe("POST");
    expect(options.accessToken).toBe(session.access_token);
    expect(options.body.user_id).toBe(session.user.id);
    expect(options.body.iterations).toBe(600_000);
    expect(JSON.stringify(options.body)).not.toContain("Private Referee");
    expect(JSON.stringify(options.body)).not.toContain("Confidential private note");
    vi.unstubAllGlobals();
  });

  it("decrypts the owner-scoped cloud payload using the vault password", async () => {
    vi.clearAllMocks();
    const payloads: Array<Record<string, unknown>> = [];
    vi.mocked(requestSupabase)
      .mockImplementationOnce(async (_path, options) => { payloads.push(options?.body as Record<string, unknown>); return null as never; })
      .mockImplementationOnce(async () => [{ ...payloads[0], user_id: session.user.id }] as never);
    vi.stubGlobal("localStorage", { setItem: vi.fn(), getItem: vi.fn(() => null) });

    await saveRefereeVaultForSession([referee], "a-long-test-passphrase", session);
    const restored = await unlockRefereeVaultForSession("a-long-test-passphrase", session);

    expect(restored).toEqual([referee]);
    expect(vi.mocked(requestSupabase).mock.calls[1][0]).toContain("user_id=eq.owner-123");
    vi.unstubAllGlobals();
  });

  it("fails closed when the authenticated cloud vault cannot be checked", async () => {
    vi.clearAllMocks();
    vi.mocked(requestSupabase).mockRejectedValueOnce(new Error("network unavailable"));
    const getItem = vi.fn(() => "cached-encrypted-data");
    vi.stubGlobal("localStorage", { getItem });

    await expect(hasRefereeVaultForSession(session)).rejects.toThrow("network unavailable");
    expect(getItem).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("keeps cloud saves successful when the encrypted device cache is unavailable", async () => {
    vi.clearAllMocks();
    vi.mocked(requestSupabase).mockResolvedValueOnce(null as never);
    vi.stubGlobal("localStorage", {
      setItem: vi.fn(() => { throw new Error("storage quota exceeded"); }),
    });

    await expect(saveRefereeVaultForSession([referee], "a-long-test-passphrase", session)).resolves.toBeUndefined();
    expect(requestSupabase).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("deletes only the signed-in owner's cloud vault before clearing that owner's cache", async () => {
    vi.clearAllMocks();
    vi.mocked(requestSupabase).mockResolvedValueOnce(null as never);
    const removeItem = vi.fn();
    vi.stubGlobal("localStorage", { removeItem });

    await clearRefereeVaultForSession(session);

    const [path, options] = vi.mocked(requestSupabase).mock.calls[0] as unknown as [
      string,
      { method: string; accessToken: string },
    ];
    expect(path).toContain("/rest/v1/private_referee_vaults?user_id=eq.owner-123");
    expect(options.method).toBe("DELETE");
    expect(options.accessToken).toBe(session.access_token);
    expect(removeItem).toHaveBeenCalledWith(refereeVaultStorageKey(session.user.id));
    vi.unstubAllGlobals();
  });
});
