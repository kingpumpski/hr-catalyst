import { requestSupabase, type AuthSession, type Workspace } from "@/lib/supabaseAuth";
import { createShareCredentials } from "@/lib/shareResolver";
import type { WorkspaceDocument } from "@/lib/workspaceDocuments";

const normalizeInvitedEmail = (value?: string | null) => {
  const email = value?.trim().toLowerCase() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid invited recruiter email address or leave it blank.");
  }
  return email;
};

const buildShareExpiry = (days: number | null | undefined) => {
  if (days == null) return null;
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error("Choose a valid expiry between 1 and 365 days, or no expiry.");
  }
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
};

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
  const email = normalizeInvitedEmail(options.invitedEmail);
  const expiresAt = buildShareExpiry(options.expiresInDays);

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
  const updated = await requestSupabase<Array<{ id: string }>>(
    `/rest/v1/share_links?id=eq.${encodeURIComponent(shareId)}&workspace_id=eq.${encodeURIComponent(workspace.id)}&revoked_at=is.null&select=id`,
    {
      method: "PATCH",
      accessToken: session.access_token,
      prefer: "return=representation",
      body: { revoked_at: new Date().toISOString() },
    },
  );
  if (!updated[0]) throw new Error("This recruiter link is already revoked or is not available in your workspace.");
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
  const email = normalizeInvitedEmail(updates.invitedEmail);
  const expiresAt = buildShareExpiry(updates.expiresInDays);
  const updated = await requestSupabase<Array<{ id: string }>>(
    `/rest/v1/share_links?id=eq.${encodeURIComponent(shareId)}&workspace_id=eq.${encodeURIComponent(workspace.id)}&revoked_at=is.null&select=id`,
    {
      method: "PATCH",
      accessToken: session.access_token,
      prefer: "return=representation",
      body: { invited_email: email, allow_download: updates.allowDownload, expires_at: expiresAt },
    },
  );
  if (!updated[0]) throw new Error("This recruiter link was revoked or changed before the update could be saved.");
};
