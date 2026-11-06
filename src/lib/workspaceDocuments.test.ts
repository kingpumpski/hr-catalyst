import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthSession, Workspace } from "@/lib/supabaseAuth";
import { getWorkspaceDocumentEditorPath, publishWorkspaceDocument, type WorkspaceDocument } from "@/lib/workspaceDocuments";

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
  status: "draft",
  updated_at: "2026-11-06T00:00:00Z",
} satisfies WorkspaceDocument;

describe("typed workspace document publishing", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls the transactional publish RPC with the owner session and immutable snapshot", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{ version_id: "version-123", version_number: 4 }],
      error: null,
    });
    getSupabaseClientForSession.mockReturnValue({ rpc });
    const snapshot = { profile: { name: "Test Owner" }, experience: [] };
    const result = await publishWorkspaceDocument(session, workspace, document, snapshot, "workspace-123/document-123/version-4.docx");
    expect(result).toEqual({ id: "version-123", version_number: 4 });
    expect(getSupabaseClientForSession).toHaveBeenCalledWith(session);
    expect(rpc).toHaveBeenCalledWith("publish_workspace_document", {
      p_workspace_id: "workspace-123",
      p_document_id: "document-123",
      p_content_snapshot: snapshot,
      p_storage_path: "workspace-123/document-123/version-4.docx",
    });
  });

  it("fails closed when the server does not return a published version", async () => {
    getSupabaseClientForSession.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    });
    await expect(publishWorkspaceDocument(session, workspace, document, {}, "workspace-123/document-123/version-5.docx"))
      .rejects.toThrow("The document version could not be published.");
  });

  it("propagates RPC errors rather than reporting a successful publish", async () => {
    getSupabaseClientForSession.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: null, error: new Error("permission denied") }),
    });
    await expect(publishWorkspaceDocument(session, workspace, document, {}, "workspace-123/document-123/version-5.docx"))
      .rejects.toThrow("permission denied");
  });
});

describe("workspace document editor routes", () => {
  it("opens the correct catalogue editor tab for each saved document type", () => {
    expect(getWorkspaceDocumentEditorPath({ slug: "finance-cv", document_type: "cv" })).toBe("/cv/finance?tab=cv&workspace=1");
    expect(getWorkspaceDocumentEditorPath({ slug: "finance-resume", document_type: "resume" })).toBe("/cv/finance?tab=resume&workspace=1");
    expect(getWorkspaceDocumentEditorPath({ slug: "finance-letter", document_type: "cover_letter" })).toBe("/cv/finance?tab=letter&workspace=1");
  });
});
