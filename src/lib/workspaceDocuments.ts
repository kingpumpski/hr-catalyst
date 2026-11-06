import { removePrivateStorageObject, requestSupabase, uploadPrivateStorageObject, type AuthSession, type Workspace } from "@/lib/supabaseAuth";

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

export const getWorkspaceDocumentContent = async (
  session: AuthSession,
  workspace: Workspace,
  slug: string,
): Promise<{ content: unknown } | null> => {
  const rows = await requestSupabase<Array<{ content: unknown }>>(
    `/rest/v1/documents?select=content&workspace_id=eq.${encodeURIComponent(workspace.id)}&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    { accessToken: session.access_token },
  );
  return rows[0] ?? null;
};

export const getWorkspaceDocumentEditorPath = (document: Pick<WorkspaceDocument, "slug" | "document_type">) => {
  const tab = document.document_type === "cover_letter" ? "letter" : document.document_type;
  const editorSlug = document.slug.replace(new RegExp("-" + tab + "$"), "");
  return `/cv/${encodeURIComponent(editorSlug)}?tab=${tab}&workspace=1`;
};

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

export const uploadWorkspaceDocumentArtifact = async (
  session: AuthSession,
  workspace: Workspace,
  document: WorkspaceDocument,
  file: Blob,
) => {
  const path = `${workspace.id}/${document.id}/${crypto.randomUUID()}.docx`;
  await uploadPrivateStorageObject(
    session,
    "hr-catalyst-private",
    path,
    file,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  return path;
};

export const removeWorkspaceDocumentArtifact = (
  session: AuthSession,
  path: string,
) => removePrivateStorageObject(session, "hr-catalyst-private", path);

export const publishWorkspaceDocument = async (
  session: AuthSession,
  workspace: Workspace,
  document: WorkspaceDocument,
  snapshot: unknown,
  storagePath: string,
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
        p_storage_path: storagePath,
      },
    },
  );
  const version = published[0];
  if (!version) throw new Error("The document version could not be published.");
  return { id: version.version_id, version_number: version.version_number };
};
