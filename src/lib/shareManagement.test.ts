import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession, Workspace } from "@/lib/supabaseAuth";
import { createOwnerShareLink, revokeOwnerShareLink, updateOwnerShareLink } from "@/lib/shareManagement";
import type { WorkspaceDocument } from "@/lib/workspaceDocuments";

const { getSupabaseClientForSession } = vi.hoisted(() => ({ getSupabaseClientForSession: vi.fn() }));
vi.mock("@/lib/supabaseAuth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/supabaseAuth")>();
  return { ...actual, getSupabaseClientForSession };
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

type Result = { data: unknown; error: unknown };
const setupClient = (responses: Record<string, Result[]>) => {
  const calls: Array<{ table: string; method: string; args: unknown[] }> = [];
  const client = {
    from: (table: string) => {
      const result = responses[table]?.shift() ?? { data: null, error: null };
      const builder: Record<string, (...args: unknown[]) => unknown> = {};
      for (const method of ["select", "insert", "update", "eq", "is", "order", "limit"]) {
        builder[method] = (...args: unknown[]) => {
          calls.push({ table, method, args });
          return builder;
        };
      }
      builder.maybeSingle = async () => result;
      builder.single = async () => result;
      builder.then = (resolve: (value: Result) => unknown, reject?: (reason: unknown) => unknown) =>
        Promise.resolve(result).then(resolve, reject);
      return builder;
    },
  };
  getSupabaseClientForSession.mockReturnValue(client);
  return calls;
};

describe("typed owner recruiter share management", () => {
  beforeEach(() => vi.clearAllMocks());

  it("stores only a token hash and binds a share to the latest published version", async () => {
    const calls = setupClient({
      document_versions: [{ data: { id: "version-9", version_number: 9, storage_path: "workspace-123/document-123/version-9.docx" }, error: null }],
      share_links: [{ data: {
        id: "share-123", document_id: document.id, document_version_id: "version-9",
        invited_email: "recruiter@example.com", allow_download: false, expires_at: null,
        revoked_at: null, created_at: "2026-11-06T00:00:00Z",
      }, error: null }],
    });
    const result = await createOwnerShareLink(session, workspace, document, {
      invitedEmail: " Recruiter@Example.com ", allowDownload: false, expiresInDays: null,
    });
    expect(result.share.id).toBe("share-123");
    expect(result.versionNumber).toBe(9);
    expect(result.token).toHaveLength(64);
    const insert = calls.find((call) => call.table === "share_links" && call.method === "insert");
    expect(insert?.args[0]).toMatchObject({
      workspace_id: workspace.id, document_id: document.id, document_version_id: "version-9",
      invited_email: "recruiter@example.com", allow_download: false, created_by: session.user.id,
    });
    const payload = insert?.args[0] as Record<string, unknown>;
    expect(payload.token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(payload.token_hash).not.toBe(result.token);
    expect(payload).not.toHaveProperty("token");
    expect(getSupabaseClientForSession).toHaveBeenCalledWith(session);
  });

  it("rejects malformed invited email addresses before inserting a share", async () => {
    const calls = setupClient({
      document_versions: [{ data: { id: "version-9", version_number: 9, storage_path: null }, error: null }],
    });
    await expect(createOwnerShareLink(session, workspace, document, {
      invitedEmail: "not-an-email", allowDownload: false, expiresInDays: 7,
    })).rejects.toThrow("Enter a valid invited recruiter email address or leave it blank.");
    expect(calls.some((call) => call.method === "insert")).toBe(false);
  });

  it("rejects invalid expiry periods before inserting a share", async () => {
    const calls = setupClient({
      document_versions: [{ data: { id: "version-9", version_number: 9, storage_path: null }, error: null }],
    });
    await expect(createOwnerShareLink(session, workspace, document, {
      invitedEmail: "", allowDownload: false, expiresInDays: 366,
    })).rejects.toThrow("Choose a valid expiry between 1 and 365 days, or no expiry.");
    expect(calls.some((call) => call.method === "insert")).toBe(false);
  });

  it("refuses to create a share link before the document has a published version", async () => {
    setupClient({ document_versions: [{ data: null, error: null }] });
    await expect(createOwnerShareLink(session, workspace, document, {}))
      .rejects.toThrow("Publish this document before creating a recruiter link.");
  });

  it("propagates lookup errors instead of treating them as missing versions", async () => {
    setupClient({ document_versions: [{ data: null, error: new Error("database unavailable") }] });
    await expect(createOwnerShareLink(session, workspace, document, {})).rejects.toThrow("database unavailable");
  });
});

describe("recruiter share permission updates", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates only owner-controlled settings on an active link with a private artifact", async () => {
    const calls = setupClient({
      share_links: [
        { data: { document_version_id: "version-123" }, error: null },
        { data: { id: "share-456" }, error: null },
      ],
      document_versions: [{ data: { storage_path: "workspace-123/document-123/version-123.docx" }, error: null }],
    });
    await updateOwnerShareLink(session, workspace, "share-456", {
      invitedEmail: " Hiring@Example.com ", allowDownload: true, expiresInDays: 30,
    });
    const update = calls.find((call) => call.table === "share_links" && call.method === "update");
    expect(update?.args[0]).toMatchObject({ invited_email: "hiring@example.com", allow_download: true });
    expect(typeof (update?.args[0] as Record<string, unknown>).expires_at).toBe("string");
    expect(calls.filter((call) => call.method === "eq")).toEqual(expect.arrayContaining([
      expect.objectContaining({ args: ["id", "share-456"] }),
      expect.objectContaining({ args: ["workspace_id", workspace.id] }),
    ]));
  });

  it("does not enable downloads when the published version has no private artifact", async () => {
    setupClient({
      share_links: [{ data: { document_version_id: "version-123" }, error: null }],
      document_versions: [{ data: { storage_path: null }, error: null }],
    });
    await expect(updateOwnerShareLink(session, workspace, "share-456", {
      invitedEmail: "", allowDownload: true, expiresInDays: null,
    })).rejects.toThrow("Re-publish this document to create a private Word download before enabling downloads.");
  });

  it("fails closed if the share was revoked before settings could be updated", async () => {
    setupClient({
      share_links: [
        { data: { document_version_id: "version-123" }, error: null },
        { data: null, error: null },
      ],
      document_versions: [{ data: { storage_path: "workspace-123/document-123/version-123.docx" }, error: null }],
    });
    await expect(updateOwnerShareLink(session, workspace, "share-456", {
      invitedEmail: "hiring@example.com", allowDownload: true, expiresInDays: 30,
    })).rejects.toThrow("This recruiter link was revoked or changed before the update could be saved.");
  });
});

describe("recruiter share revocation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("revokes only an active link in the owner's workspace", async () => {
    const calls = setupClient({ share_links: [{ data: { id: "share-456" }, error: null }] });
    await revokeOwnerShareLink(session, workspace, "share-456");
    expect(calls.find((call) => call.method === "update")?.args[0]).toHaveProperty("revoked_at");
    expect(calls).toEqual(expect.arrayContaining([
      expect.objectContaining({ method: "eq", args: ["id", "share-456"] }),
      expect.objectContaining({ method: "eq", args: ["workspace_id", workspace.id] }),
      expect.objectContaining({ method: "is", args: ["revoked_at", null] }),
    ]));
  });

  it("reports a stale or already-revoked link instead of silently succeeding", async () => {
    setupClient({ share_links: [{ data: null, error: null }] });
    await expect(revokeOwnerShareLink(session, workspace, "share-456"))
      .rejects.toThrow("This recruiter link is already revoked or is not available in your workspace.");
  });
});
