import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getOrCreateWorkspace,
  readPersistedSession,
  refreshAuthSession,
  signInWithPassword,
  signUpWithPassword,
  type AuthSession,
} from "@/lib/supabaseAuth";

const session: AuthSession = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: 4_000_000_000,
  user: { id: "user-123", email: "owner@example.com" },
};

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("HR Catalyst Supabase authentication", () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://project.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test_key");
    vi.stubGlobal("window", {
      location: { origin: "https://hr-catalyst.example", pathname: "/auth", search: "" },
      history: { replaceState: vi.fn() },
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
        removeItem: (key: string) => storage.delete(key),
      },
    });
    storage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("sends the publishable key and password credentials to Supabase Auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue(response(session));
    vi.stubGlobal("fetch", fetchMock);
    const result = await signInWithPassword(" Owner@Example.com ", "correct horse battery staple");
    expect(result.user.id).toBe("user-123");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://project.supabase.co/auth/v1/token?grant_type=password",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          apikey: "sb_publishable_test_key",
          "Content-Type": "application/json",
        }),
      }),
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      email: "owner@example.com",
      password: "correct horse battery staple",
    });
    expect(readPersistedSession()?.refresh_token).toBe("refresh-token");
  });

  it("supports email-confirmation signup responses without inventing a session", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ user: { id: "pending-user", email: "new@example.com" } })));
    const result = await signUpWithPassword("new@example.com", "long-secure-password", "New Owner");
    expect(result.user?.id).toBe("pending-user");
    expect(result.session).toBeNull();
    expect(readPersistedSession()).toBeNull();
  });

  it("rotates the refresh token when a session is refreshed", async () => {
    const refreshed = { ...session, access_token: "new-access", refresh_token: "new-refresh" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response(refreshed)));
    const result = await refreshAuthSession(session);
    expect(result.access_token).toBe("new-access");
    expect(result.refresh_token).toBe("new-refresh");
    expect(readPersistedSession()?.refresh_token).toBe("new-refresh");
  });

  it("creates a private workspace only after an authenticated lookup returns none", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response([{ id: "workspace-123", name: "My HR Catalyst workspace" }]));
    vi.stubGlobal("fetch", fetchMock);
    const workspace = await getOrCreateWorkspace(session);
    expect(workspace.id).toBe("workspace-123");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Bearer access-token");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      owner_id: "user-123",
      name: "My HR Catalyst workspace",
    });
  });
});
