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
  const versions = await requestSupabase<Array<{ version_number: number }>>(
    `/rest/v1/document_versions?select=version_number&document_id=eq.${encodeURIComponent(document.id)}&order=version_number.desc&limit=1`,
    { accessToken: session.access_token },
  );
  const nextVersion = (versions[0]?.version_number ?? 0) + 1;
  const inserted = await requestSupabase<Array<{ id: string; version_number: number }>>("/rest/v1/document_versions", {
    method: "POST",
    accessToken: session.access_token,
    prefer: "return=representation",
    body: {
      workspace_id: workspace.id,
      document_id: document.id,
      version_number: nextVersion,
      document_type: document.document_type,
      content_snapshot: snapshot,
      created_by: session.user.id,
    },
  });
  const version = inserted[0];
  if (!version) throw new Error("The document version could not be published.");
  await requestSupabase<unknown>(
    `/rest/v1/documents?id=eq.${encodeURIComponent(document.id)}&workspace_id=eq.${encodeURIComponent(workspace.id)}`,
    { method: "PATCH", accessToken: session.access_token, prefer: "return=minimal", body: { status: "published" } },
  );
  await requestSupabase<unknown>("/rest/v1/audit_logs", {
    method: "POST",
    accessToken: session.access_token,
    prefer: "return=minimal",
    body: {
      workspace_id: workspace.id,
      actor_id: session.user.id,
      action: "document.published",
      target_type: "document",
      target_id: document.id,
      metadata: { version_id: version.id, version_number: version.version_number },
    },
  });
  return version;
};
