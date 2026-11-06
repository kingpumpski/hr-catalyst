import { getSupabaseClientForSession, removePrivateStorageObject, uploadPrivateStorageObject, type AuthSession, type Workspace } from "@/lib/supabaseAuth";
import type { Json } from "@/integrations/supabase/types";

export type WorkspaceDocument = {
  id: string;
  slug: string;
  title: string;
  document_type: "cv" | "resume" | "cover_letter" | "other";
  status: "draft" | "published" | "archived";
  updated_at: string;
};

const documentProjection = "id,slug,title,document_type,status,updated_at" as const;

export const listWorkspaceDocuments = async (session: AuthSession, workspace: Workspace): Promise<WorkspaceDocument[]> => {
  const { data, error } = await getSupabaseClientForSession(session)
    .from("documents")
    .select(documentProjection)
    .eq("workspace_id", workspace.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as WorkspaceDocument[];
};

export const getWorkspaceDocumentContent = async (
  session: AuthSession,
  workspace: Workspace,
  slug: string,
): Promise<{ content: unknown } | null> => {
  const { data, error } = await getSupabaseClientForSession(session)
    .from("documents")
    .select("content")
    .eq("workspace_id", workspace.id)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? { content: data.content } : null;
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
  const { data, error } = await getSupabaseClientForSession(session)
    .from("documents")
    .upsert({
      workspace_id: workspace.id,
      slug: input.slug,
      title: input.title,
      document_type: input.documentType,
      content: input.content as Json,
    }, { onConflict: "workspace_id,slug" })
    .select(documentProjection)
    .single();
  if (error) throw error;
  if (!data) throw new Error("The document was not saved to your private workspace.");
  return data as WorkspaceDocument;
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
  const { data, error } = await getSupabaseClientForSession(session).rpc("publish_workspace_document", {
    p_workspace_id: workspace.id,
    p_document_id: document.id,
    p_content_snapshot: snapshot as Json,
    p_storage_path: storagePath,
  });
  if (error) throw error;
  const version = data?.[0];
  if (!version) throw new Error("The document version could not be published.");
  return { id: version.version_id, version_number: version.version_number };
};
