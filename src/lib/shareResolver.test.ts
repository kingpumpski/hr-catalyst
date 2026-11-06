import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveShare, ShareResolutionError } from "./shareResolver";

const validResponse = {
  document: { title: "Accounting CV", type: "cv", content: { summary: "Validated experience" } },
  download: { allowed: false },
};

describe("resolveShare", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "https://example-project.supabase.co");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "public-test-key");
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
