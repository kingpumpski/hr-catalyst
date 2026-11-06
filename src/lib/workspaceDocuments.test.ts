import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestSupabase, type AuthSession, type Workspace } from "@/lib/supabaseAuth";
import { publishWorkspaceDocument, type WorkspaceDocument } from "@/lib/workspaceDocuments";

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
  status: "draft",
  updated_at: "2026-11-06T00:00:00Z",
} satisfies WorkspaceDocument;

describe("atomic workspace document publishing", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls the transactional publish RPC with the owner session and immutable snapshot", async () => {
    vi.mocked(requestSupabase).mockResolvedValue([
      { version_id: "version-123", version_number: 4 },
    ]);

    const snapshot = { profile: { name: "Test Owner" }, experience: [] };
    const result = await publishWorkspaceDocument(session, workspace, document, snapshot);

    expect(result).toEqual({ id: "version-123", version_number: 4 });
    expect(requestSupabase).toHaveBeenCalledOnce();
    expect(requestSupabase).toHaveBeenCalledWith(
      "/rest/v1/rpc/publish_workspace_document",
      {
        method: "POST",
        accessToken: "owner-access-token",
        body: {
          p_workspace_id: "workspace-123",
          p_document_id: "document-123",
          p_content_snapshot: snapshot,
        },
      },
    );
  });

  it("fails closed when the server does not return a published version", async () => {
    vi.mocked(requestSupabase).mockResolvedValue([]);
    await expect(publishWorkspaceDocument(session, workspace, document, {}))
      .rejects.toThrow("The document version could not be published.");
  });
});

import { getWorkspaceDocumentEditorPath } from "@/lib/workspaceDocuments";

describe("workspace document editor routes", () => {
  it("opens the correct catalogue editor tab for each saved document type", () => {
    expect(getWorkspaceDocumentEditorPath({ slug: "finance-cv", document_type: "cv" })).toBe("/cv/finance?tab=cv");
    expect(getWorkspaceDocumentEditorPath({ slug: "finance-resume", document_type: "resume" })).toBe("/cv/finance?tab=resume");
    expect(getWorkspaceDocumentEditorPath({ slug: "finance-letter", document_type: "cover_letter" })).toBe("/cv/finance?tab=letter");
  });
});
