import { beforeEach, describe, expect, it, vi } from "vitest";
import { createShareCredentials, createShareUrl, resolveShare, ShareResolutionError } from "./shareResolver";

const validResponse = {
  document: { title: "Accounting CV", type: "cv", content: { summary: "Validated experience" } },
  download: { allowed: false },
};

describe("resolveShare", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example-project.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "public-test-key");
  });

  it("creates a random token and stores only its SHA-256 digest for persistence", async () => {
    const first = await createShareCredentials();
    const second = await createShareCredentials();
    expect(first.token).toHaveLength(64);
    expect(first.tokenHash).toHaveLength(64);
    expect(first.token).not.toBe(first.tokenHash);
    expect(first.token).not.toBe(second.token);
    expect(first.tokenHash).not.toBe(second.tokenHash);
  });

  it("places the raw token in a URL fragment rather than the query string", () => {
    const url = new URL(createShareUrl("finance-cv", "cv", "a".repeat(64), "https://hr-catalyst-five.vercel.app", "/"));
    expect(url.pathname).toBe("/share/cv/finance-cv");
    expect(url.search).toBe("");
    expect(new URLSearchParams(url.hash.slice(1)).get("token")).toBe("a".repeat(64));
  });

  it("posts the token to the server-side resolver without caching", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(validResponse), { status: 200 }));
    const result = await resolveShare("a".repeat(48), { fetcher });

    expect(result.document.title).toBe("Accounting CV");
    expect(fetcher).toHaveBeenCalledWith(
      "https://example-project.supabase.co/functions/v1/resolve-share",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        body: JSON.stringify({ token: "a".repeat(48) }),
        headers: expect.objectContaining({ apikey: "public-test-key" }),
      }),
    );
  });

  it("rejects short tokens before making a network request", async () => {
    const fetcher = vi.fn();
    await expect(resolveShare("short", { fetcher })).rejects.toMatchObject({
      code: "invalid_token",
      status: 400,
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("does not expose revoked or expired links as documents", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "share_not_found_or_expired" }), { status: 404 }),
    );
    await expect(resolveShare("b".repeat(48), { fetcher })).rejects.toBeInstanceOf(ShareResolutionError);
  });

  it("rejects download URLs outside the configured Supabase origin", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ...validResponse,
      download: { allowed: true, url: "https://attacker.example/file.pdf" },
    }), { status: 200 }));
    await expect(resolveShare("c".repeat(48), { fetcher })).rejects.toMatchObject({
      code: "unsafe_download_url",
      status: 502,
    });
  });
});
