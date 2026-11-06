import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestSupabase, type AuthSession, type Workspace } from "@/lib/supabaseAuth";
import { createOwnerShareLink, revokeOwnerShareLink, updateOwnerShareLink } from "@/lib/shareManagement";
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
    const latestVersion = { id: "version-9", version_number: 9, storage_path: "workspace-123/document-123/version-9.docx" };
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

  it("rejects malformed invited email addresses before inserting a share", async () => {
    vi.mocked(requestSupabase).mockResolvedValueOnce([{
      id: "version-9",
      version_number: 9,
      storage_path: null,
    }]);
    await expect(createOwnerShareLink(session, workspace, document, {
      invitedEmail: "not-an-email",
      allowDownload: false,
      expiresInDays: 7,
    })).rejects.toThrow("Enter a valid invited recruiter email address or leave it blank.");
    expect(requestSupabase).toHaveBeenCalledOnce();
  });

  it("rejects invalid expiry periods before inserting a share", async () => {
    vi.mocked(requestSupabase).mockResolvedValueOnce([{
      id: "version-9",
      version_number: 9,
      storage_path: null,
    }]);
    await expect(createOwnerShareLink(session, workspace, document, {
      invitedEmail: "",
      allowDownload: false,
      expiresInDays: 366,
    })).rejects.toThrow("Choose a valid expiry between 1 and 365 days, or no expiry.");
    expect(requestSupabase).toHaveBeenCalledOnce();
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
    vi.mocked(requestSupabase)
      .mockResolvedValueOnce([{ document_version_id: "version-123" }])
      .mockResolvedValueOnce([{ storage_path: "workspace-123/document-123/version-123.docx" }])
      .mockResolvedValueOnce([{ id: "share-456" }]);
    await updateOwnerShareLink(session, workspace, "share-456", {
      invitedEmail: " Hiring@Example.com ",
      allowDownload: true,
      expiresInDays: 30,
    });
    expect(requestSupabase).toHaveBeenCalledTimes(3);
    const [path, options] = vi.mocked(requestSupabase).mock.calls[2];
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


describe("recruiter share revocation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("confirms the active share was actually revoked", async () => {
    vi.mocked(requestSupabase).mockResolvedValueOnce([{ id: "share-456" }]);
    await revokeOwnerShareLink(session, workspace, "share-456");
    expect(requestSupabase).toHaveBeenCalledOnce();
    const [path, options] = vi.mocked(requestSupabase).mock.calls[0];
    expect(path).toContain("id=eq.share-456");
    expect(path).toContain("workspace_id=eq.workspace-123");
    expect(path).toContain("revoked_at=is.null");
    expect(path).toContain("select=id");
    expect(options?.method).toBe("PATCH");
    expect(options?.accessToken).toBe("owner-access-token");
    expect(options?.prefer).toBe("return=representation");
    expect(typeof (options?.body as Record<string, unknown>).revoked_at).toBe("string");
  });

  it("reports a stale or already-revoked link instead of silently succeeding", async () => {
    vi.mocked(requestSupabase).mockResolvedValueOnce([]);
    await expect(revokeOwnerShareLink(session, workspace, "share-456"))
      .rejects.toThrow("This recruiter link is already revoked or is not available in your workspace.");
  });
});


describe("stale recruiter share settings", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not report a successful settings update when the link was revoked concurrently", async () => {
    vi.mocked(requestSupabase)
      .mockResolvedValueOnce([{ document_version_id: "version-123" }])
      .mockResolvedValueOnce([{ storage_path: "workspace-123/document-123/version-123.docx" }])
      .mockResolvedValueOnce([]);
    await expect(updateOwnerShareLink(session, workspace, "share-456", {
      invitedEmail: "hiring@example.com",
      allowDownload: true,
      expiresInDays: 30,
    })).rejects.toThrow("This recruiter link was revoked or changed before the update could be saved.");
  });
});
