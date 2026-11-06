import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestSupabase, type AuthSession, type Workspace } from "@/lib/supabaseAuth";
import { createOwnerShareLink } from "@/lib/shareManagement";
import type { WorkspaceDocument } from "@/lib/workspaceDocuments";

vi.mock("@/lib/supabaseAuth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabaseAuth")>();
  return { ...actual, requestSupabase: vi.fn() };
});

const session = {
  access_token: "owner-access-token",
  refresh_token: "owner-refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: 4_000_000_000,
  user: { id: "owner-123", email: "owner@example.com" },
} satisfies AuthSession;

const workspace = { id: "workspace-123", name: "My workspace" } satisfies Workspace;
const document = {
  id: "document-123",
  slug: "product-manager-cv",
  title: "Product Manager CV",
  document_type: "cv",
  status: "published",
  updated_at: "2026-11-06T00:00:00Z",
} satisfies WorkspaceDocument;

describe("owner recruiter share management", () => {
  beforeEach(() => vi.clearAllMocks());

  it("persists only the token hash and binds the link to the latest published version", async () => {
    const latestVersion = { id: "version-9", version_number: 9 };
    const createdShare = {
      id: "share-123",
      document_id: document.id,
      document_version_id: latestVersion.id,
      token_hash: "a".repeat(64),
      invited_email: "recruiter@example.com",
      allow_download: false,
      expires_at: null,
      revoked_at: null,
      created_at: "2026-11-06T00:00:00Z",
    };
    vi.mocked(requestSupabase).mockResolvedValueOnce([latestVersion]).mockResolvedValueOnce([createdShare]);

    const result = await createOwnerShareLink(session, workspace, document, {
      invitedEmail: " Recruiter@Example.com ",
      allowDownload: false,
      expiresInDays: null,
    });

    expect(result.share.id).toBe("share-123");
    expect(result.versionNumber).toBe(9);
    expect(result.token).toHaveLength(64);
    expect(result.share.token_hash).toHaveLength(64);
    expect(result.share.token_hash).not.toBe(result.token);
    const insertCall = vi.mocked(requestSupabase).mock.calls[1];
    expect(insertCall[0]).toBe("/rest/v1/share_links");
    const insertOptions = insertCall[1] as { body: Record<string, unknown>; accessToken: string; method: string };
    expect(insertOptions.method).toBe("POST");
    expect(insertOptions.accessToken).toBe("owner-access-token");
    expect(insertOptions.body).toMatchObject({
      workspace_id: "workspace-123",
      document_id: "document-123",
      document_version_id: "version-9",
      invited_email: "recruiter@example.com",
      allow_download: false,
      created_by: "owner-123",
    });
    expect(insertOptions.body.token_hash).toBe(result.share.token_hash);
    expect(insertOptions.body).not.toHaveProperty("token");
  });

  it("refuses to create a share link before the document has a published version", async () => {
    vi.mocked(requestSupabase).mockResolvedValueOnce([]);
    await expect(createOwnerShareLink(session, workspace, document, {}))
      .rejects.toThrow("Publish this document before creating a recruiter link.");
    expect(requestSupabase).toHaveBeenCalledOnce();
  });
});
