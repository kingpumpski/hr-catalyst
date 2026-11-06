import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestSupabase, type AuthSession, type Workspace } from "@/lib/supabaseAuth";
import { createOwnerShareLink, updateOwnerShareLink } from "@/lib/shareManagement";
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
    const insertCall = vi.mocked(requestSupabase).mock.calls[1];
    expect(insertCall[0]).toContain("/rest/v1/share_links?select=id,document_id,document_version_id");
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
    expect(insertOptions.body.token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(insertOptions.body.token_hash).not.toBe(result.token);
    expect(insertOptions.body).not.toHaveProperty("token");
    expect(insertCall[0]).toContain("select=id,document_id,document_version_id");
  });

  it("refuses to create a share link before the document has a published version", async () => {
    vi.mocked(requestSupabase).mockResolvedValueOnce([]);
    await expect(createOwnerShareLink(session, workspace, document, {}))
      .rejects.toThrow("Publish this document before creating a recruiter link.");
    expect(requestSupabase).toHaveBeenCalledOnce();
  });
});

describe("recruiter share permission updates", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates only owner-controlled access settings on an active link", async () => {
    vi.mocked(requestSupabase).mockResolvedValue(undefined);
    await updateOwnerShareLink(session, workspace, "share-456", {
      invitedEmail: " Hiring@Example.com ",
      allowDownload: true,
      expiresInDays: 30,
    });
    expect(requestSupabase).toHaveBeenCalledOnce();
    const [path, options] = vi.mocked(requestSupabase).mock.calls[0];
    expect(path).toContain("/rest/v1/share_links?id=eq.share-456");
    expect(path).toContain("workspace_id=eq.workspace-123");
    expect(path).toContain("revoked_at=is.null");
    expect(options?.method).toBe("PATCH");
    expect(options?.accessToken).toBe("owner-access-token");
    expect(options?.body).toMatchObject({
      invited_email: "hiring@example.com",
      allow_download: true,
    });
    expect(typeof (options?.body as Record<string, unknown>).expires_at).toBe("string");
  });
});
