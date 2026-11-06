import { requestSupabase, type AuthSession, type Workspace } from "@/lib/supabaseAuth";
import { createShareCredentials } from "@/lib/shareResolver";
import type { WorkspaceDocument } from "@/lib/workspaceDocuments";

export type OwnerShareLink = {
  id: string;
  document_id: string;
  document_version_id: string;
  invited_email: string | null;
  allow_download: boolean;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export const listOwnerShareLinks = (
  session: AuthSession,
  workspace: Workspace,
  documentId: string,
) => requestSupabase<OwnerShareLink[]>(
  `/rest/v1/share_links?select=id,document_id,document_version_id,invited_email,allow_download,expires_at,revoked_at,created_at&workspace_id=eq.${encodeURIComponent(workspace.id)}&document_id=eq.${encodeURIComponent(documentId)}&order=created_at.desc`,
  { accessToken: session.access_token },
);

export const createOwnerShareLink = async (
  session: AuthSession,
  workspace: Workspace,
  document: WorkspaceDocument,
  options: { invitedEmail?: string; allowDownload?: boolean; expiresInDays?: number | null },
) => {
  if (document.status !== "published") throw new Error("Publish this document before creating a recruiter link.");
  const versions = await requestSupabase<Array<{ id: string; version_number: number; storage_path: string | null }>>(
    `/rest/v1/document_versions?select=id,version_number,storage_path&workspace_id=eq.${encodeURIComponent(workspace.id)}&document_id=eq.${encodeURIComponent(document.id)}&order=version_number.desc&limit=1`,
    { accessToken: session.access_token },
  );
  const latest = versions[0];
  if (!latest) throw new Error("Publish this document before creating a recruiter link.");
  if (options.allowDownload && !latest.storage_path) throw new Error("Re-publish this document to create a private Word download before enabling downloads.");

  const { token, tokenHash } = await createShareCredentials();
  const email = options.invitedEmail?.trim().toLowerCase() || null;
  const expiresAt = options.expiresInDays == null
    ? null
    : new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const rows = await requestSupabase<OwnerShareLink[]>("/rest/v1/share_links?select=id,document_id,document_version_id,invited_email,allow_download,expires_at,revoked_at,created_at", {
    method: "POST",
    accessToken: session.access_token,
    prefer: "return=representation",
    body: {
      workspace_id: workspace.id,
      document_id: document.id,
      document_version_id: latest.id,
      token_hash: tokenHash,
      invited_email: email,
      allow_download: Boolean(options.allowDownload),
      expires_at: expiresAt,
      created_by: session.user.id,
    },
  });
  if (!rows[0]) throw new Error("The recruiter link could not be created.");
  return { share: rows[0], token, versionNumber: latest.version_number };
};

export const revokeOwnerShareLink = async (
  session: AuthSession,
  workspace: Workspace,
  shareId: string,
) => {
  await requestSupabase<unknown>(
    `/rest/v1/share_links?id=eq.${encodeURIComponent(shareId)}&workspace_id=eq.${encodeURIComponent(workspace.id)}&revoked_at=is.null`,
    {
      method: "PATCH",
      accessToken: session.access_token,
      prefer: "return=minimal",
      body: { revoked_at: new Date().toISOString() },
    },
  );
};

export const updateOwnerShareLink = async (
  session: AuthSession,
  workspace: Workspace,
  shareId: string,
  updates: { invitedEmail: string; allowDownload: boolean; expiresInDays: number | null },
) => {
  const shares = await requestSupabase<Array<{ document_version_id: string }>>(
    `/rest/v1/share_links?select=document_version_id&id=eq.${encodeURIComponent(shareId)}&workspace_id=eq.${encodeURIComponent(workspace.id)}&revoked_at=is.null&limit=1`,
    { accessToken: session.access_token },
  );
  if (!shares[0]) throw new Error("This recruiter link is no longer active.");
  if (updates.allowDownload) {
    const versions = await requestSupabase<Array<{ storage_path: string | null }>>(
      `/rest/v1/document_versions?select=storage_path&id=eq.${encodeURIComponent(shares[0].document_version_id)}&workspace_id=eq.${encodeURIComponent(workspace.id)}&limit=1`,
      { accessToken: session.access_token },
    );
    if (!versions[0]?.storage_path) throw new Error("Re-publish this document to create a private Word download before enabling downloads.");
  }
  const email = updates.invitedEmail.trim().toLowerCase() || null;
  const expiresAt = updates.expiresInDays == null
    ? null
    : new Date(Date.now() + updates.expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  await requestSupabase<unknown>(
    `/rest/v1/share_links?id=eq.${encodeURIComponent(shareId)}&workspace_id=eq.${encodeURIComponent(workspace.id)}&revoked_at=is.null`,
    {
      method: "PATCH",
      accessToken: session.access_token,
      prefer: "return=minimal",
      body: { invited_email: email, allow_download: updates.allowDownload, expires_at: expiresAt },
    },
  );
};
