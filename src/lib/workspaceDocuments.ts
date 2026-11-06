import { requestSupabase, type AuthSession, type Workspace } from "@/lib/supabaseAuth";

export type WorkspaceDocument = {
  id: string;
  slug: string;
  title: string;
  document_type: "cv" | "resume" | "cover_letter" | "other";
  status: "draft" | "published" | "archived";
  updated_at: string;
};

export const listWorkspaceDocuments = (session: AuthSession, workspace: Workspace) =>
  requestSupabase<WorkspaceDocument[]>(
    `/rest/v1/documents?select=id,slug,title,document_type,status,updated_at&workspace_id=eq.${encodeURIComponent(workspace.id)}&order=updated_at.desc`,
    { accessToken: session.access_token },
  );

export const saveWorkspaceDocument = async (
  session: AuthSession,
  workspace: Workspace,
  input: { slug: string; title: string; documentType: WorkspaceDocument["document_type"]; content: unknown },
) => {
  const rows = await requestSupabase<WorkspaceDocument[]>("/rest/v1/documents?on_conflict=workspace_id,slug", {
    method: "POST",
    accessToken: session.access_token,
    prefer: "resolution=merge-duplicates,return=representation",
    body: {
      workspace_id: workspace.id,
      slug: input.slug,
      title: input.title,
      document_type: input.documentType,
      content: input.content,
    },
  });
  if (!rows[0]) throw new Error("The document was not saved to your private workspace.");
  return rows[0];
};

export const publishWorkspaceDocument = async (
  session: AuthSession,
  workspace: Workspace,
  document: WorkspaceDocument,
  snapshot: unknown,
) => {
  const published = await requestSupabase<Array<{ version_id: string; version_number: number }>>(
    "/rest/v1/rpc/publish_workspace_document",
    {
      method: "POST",
      accessToken: session.access_token,
      body: {
        p_workspace_id: workspace.id,
        p_document_id: document.id,
        p_content_snapshot: snapshot,
      },
    },
  );
  const version = published[0];
  if (!version) throw new Error("The document version could not be published.");
  return { id: version.version_id, version_number: version.version_number };
};
