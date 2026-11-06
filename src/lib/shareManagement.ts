import { getSupabaseClientForSession, type AuthSession, type Workspace } from "@/lib/supabaseAuth";
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

const shareProjection = "id,document_id,document_version_id,invited_email,allow_download,expires_at,revoked_at,created_at" as const;

export const listOwnerShareLinks = async (
  session: AuthSession,
  workspace: Workspace,
  documentId: string,
): Promise<OwnerShareLink[]> => {
  const { data, error } = await getSupabaseClientForSession(session)
    .from("share_links")
    .select(shareProjection)
    .eq("workspace_id", workspace.id)
    .eq("document_id", documentId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OwnerShareLink[];
};

export const createOwnerShareLink = async (
  session: AuthSession,
  workspace: Workspace,
  document: WorkspaceDocument,
  options: { invitedEmail?: string; allowDownload?: boolean; expiresInDays?: number | null },
) => {
  if (document.status !== "published") throw new Error("Publish this document before creating a recruiter link.");
  const client = getSupabaseClientForSession(session);
  const { data: latest, error: versionError } = await client
    .from("document_versions")
    .select("id,version_number,storage_path")
    .eq("workspace_id", workspace.id)
    .eq("document_id", document.id)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (versionError) throw versionError;
  if (!latest) throw new Error("Publish this document before creating a recruiter link.");
  if (options.allowDownload && !latest.storage_path) {
    throw new Error("Re-publish this document to create a private Word download before enabling downloads.");
  }

  const { token, tokenHash } = await createShareCredentials();
  const email = normalizeInvitedEmail(options.invitedEmail);
  const expiresAt = buildShareExpiry(options.expiresInDays);
  const { data, error } = await client
    .from("share_links")
    .insert({
      workspace_id: workspace.id,
      document_id: document.id,
      document_version_id: latest.id,
      token_hash: tokenHash,
      invited_email: email,
      allow_download: Boolean(options.allowDownload),
      expires_at: expiresAt,
      created_by: session.user.id,
    })
    .select(shareProjection)
    .single();
  if (error) throw error;
  if (!data) throw new Error("The recruiter link could not be created.");
  return { share: data as OwnerShareLink, token, versionNumber: latest.version_number };
};

export const revokeOwnerShareLink = async (
  session: AuthSession,
  workspace: Workspace,
  shareId: string,
) => {
  const { data, error } = await getSupabaseClientForSession(session)
    .from("share_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", shareId)
    .eq("workspace_id", workspace.id)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("This recruiter link is already revoked or is not available in your workspace.");
};

export const updateOwnerShareLink = async (
  session: AuthSession,
  workspace: Workspace,
  shareId: string,
  updates: { invitedEmail: string; allowDownload: boolean; expiresInDays: number | null },
) => {
  const client = getSupabaseClientForSession(session);
  const { data: share, error: shareError } = await client
    .from("share_links")
    .select("document_version_id")
    .eq("id", shareId)
    .eq("workspace_id", workspace.id)
    .is("revoked_at", null)
    .maybeSingle();
  if (shareError) throw shareError;
  if (!share) throw new Error("This recruiter link is no longer active.");

  if (updates.allowDownload) {
    const { data: version, error: versionError } = await client
      .from("document_versions")
      .select("storage_path")
      .eq("id", share.document_version_id)
      .eq("workspace_id", workspace.id)
      .maybeSingle();
    if (versionError) throw versionError;
    if (!version?.storage_path) {
      throw new Error("Re-publish this document to create a private Word download before enabling downloads.");
    }
  }

  const email = normalizeInvitedEmail(updates.invitedEmail);
  const expiresAt = buildShareExpiry(updates.expiresInDays);
  const { data, error } = await client
    .from("share_links")
    .update({ invited_email: email, allow_download: updates.allowDownload, expires_at: expiresAt })
    .eq("id", shareId)
    .eq("workspace_id", workspace.id)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("This recruiter link was revoked or changed before the update could be saved.");
};
