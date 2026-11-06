import { useCallback, useEffect, useState } from "react";
import { Copy, Link2, LoaderCircle, ShieldOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/AuthProvider";
import { createShareUrl } from "@/lib/shareResolver";
import {
  createOwnerShareLink,
  listOwnerShareLinks,
  revokeOwnerShareLink,
  updateOwnerShareLink,
  type OwnerShareLink,
} from "@/lib/shareManagement";
import type { WorkspaceDocument } from "@/lib/workspaceDocuments";

const OwnerShareManager = ({ document }: { document: WorkspaceDocument }) => {
  const { session, workspace } = useAuth();
  const { toast } = useToast();
  const [shares, setShares] = useState<OwnerShareLink[]>([]);
  const [email, setEmail] = useState("");
  const [expiryDays, setExpiryDays] = useState("7");
  const [allowDownload, setAllowDownload] = useState(false);
  const [busy, setBusy] = useState(false);
  const [oneTimeUrl, setOneTimeUrl] = useState("");
  const [editingShareId, setEditingShareId] = useState<string | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editExpiry, setEditExpiry] = useState("7");
  const [editDownload, setEditDownload] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(0);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const timer = window.setInterval(updateNow, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const refresh = useCallback(async () => {
    if (!session || !workspace) return;
    const result = await listOwnerShareLinks(session, workspace, document.id);
    setShares(result);
  }, [session, workspace, document.id]);

  useEffect(() => {
    let active = true;
    if (!session || !workspace) return;
    listOwnerShareLinks(session, workspace, document.id)
      .then((result) => { if (active) setShares(result); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Share links could not be loaded.");
      });
    return () => { active = false; };
  }, [session, workspace, document.id]);

  const create = async () => {
    if (!session || !workspace) return;
    setBusy(true);
    setError("");
    setOneTimeUrl("");
    try {
      const result = await createOwnerShareLink(session, workspace, document, {
        invitedEmail: email,
        allowDownload,
        expiresInDays: expiryDays === "never" ? null : Number(expiryDays),
      });
      const routeType = document.document_type === "cover_letter" ? "letter" : document.document_type === "resume" ? "resume" : "cv";
      setOneTimeUrl(createShareUrl(document.slug, routeType, result.token));
      setEmail("");
      await refresh();
      toast({ title: "Recruiter link created", description: `Version ${result.versionNumber} is ready to share. Copy the link now; the token is shown only once.` });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The recruiter link could not be created.");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (shareId: string) => {
    if (!session || !workspace) return;
    setBusy(true);
    setError("");
    try {
      await revokeOwnerShareLink(session, workspace, shareId);
      await refresh();
      toast({ title: "Recruiter link revoked", description: "This link can no longer be used." });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The recruiter link could not be revoked.");
    } finally {
      setBusy(false);
    }
  };

  const beginEdit = (share: OwnerShareLink) => {
    setEditingShareId(share.id);
    setEditEmail(share.invited_email ?? "");
    setEditDownload(share.allow_download);
    if (!share.expires_at) setEditExpiry("never");
    else {
      const remaining = Math.ceil((Date.parse(share.expires_at) - Date.now()) / (24 * 60 * 60 * 1000));
      setEditExpiry(remaining <= 1 ? "1" : remaining <= 7 ? "7" : "30");
    }
  };

  const saveEdit = async (shareId: string) => {
    if (!session || !workspace) return;
    setBusy(true);
    setError("");
    try {
      await updateOwnerShareLink(session, workspace, shareId, {
        invitedEmail: editEmail,
        allowDownload: editDownload,
        expiresInDays: editExpiry === "never" ? null : Number(editExpiry),
      });
      setEditingShareId(null);
      await refresh();
      toast({ title: "Recruiter link updated", description: "The link's access settings have been saved." });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The recruiter link settings could not be updated.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(oneTimeUrl);
      toast({ title: "Link copied", description: "The private recruiter link is on your clipboard." });
    } catch {
      setError("Clipboard access was unavailable. Select and copy the link manually.");
    }
  };

  const activeShares = shares.filter((share) => !share.revoked_at && (!share.expires_at || (now === 0 || Date.parse(share.expires_at) > now)));

  return (
    <div className="mt-3 w-full rounded-lg border border-border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><p className="text-sm font-semibold">Recruiter links</p><p className="text-xs text-muted-foreground">Only hashes are stored. Raw tokens are displayed once.</p></div>
        <Badge variant="secondary">{activeShares.length} active</Badge>
      </div>
      {document.status === "published" ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
          <Input aria-label="Optional invited recruiter email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Restrict to recruiter email (optional)" />
          <select aria-label="Link expiry" value={expiryDays} onChange={(event) => setExpiryDays(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="1">Expires in 1 day</option><option value="7">Expires in 7 days</option><option value="30">Expires in 30 days</option><option value="never">No expiry</option>
          </select>
          <Button size="sm" onClick={() => void create()} disabled={busy}>{busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}Create link</Button>
          <label className="sm:col-span-3 flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={allowDownload} onChange={(event) => setAllowDownload(event.target.checked)} />Allow the recruiter to download the published document</label>
        </div>
      ) : <p className="mt-3 text-xs text-muted-foreground">Publish a version before creating a recruiter link.</p>}
      {oneTimeUrl && <div className="mt-3 rounded-md border border-primary/30 bg-background p-3"><p className="text-xs font-semibold text-foreground">Copy this link now — it will not be shown again.</p><div className="mt-2 flex flex-wrap gap-2"><Input readOnly value={oneTimeUrl} aria-label="New recruiter share link" /><Button size="sm" variant="outline" onClick={() => void copy()}><Copy className="mr-2 h-4 w-4" />Copy</Button></div></div>}
      {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
      {shares.length > 0 && <ul className="mt-3 space-y-2">{shares.map((share) => {
        const expired = Boolean(share.expires_at && (now !== 0 && Date.parse(share.expires_at) <= now));
        const revoked = Boolean(share.revoked_at);
        return <li key={share.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2">
          <div><p className="text-xs font-medium">{share.invited_email ?? "Anyone with the link"}</p><p className="text-[11px] text-muted-foreground">{share.allow_download ? "Download enabled" : "View only"} · {share.expires_at ? `Expires ${new Date(share.expires_at).toLocaleDateString()}` : "No expiry"}</p></div>
          <div className="flex items-center gap-2"><Badge variant={revoked || expired ? "secondary" : "default"}>{revoked ? "Revoked" : expired ? "Expired" : "Active"}</Badge>{!revoked && !expired && <><Button size="sm" variant="outline" disabled={busy} onClick={() => beginEdit(share)}>Edit</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => void revoke(share.id)} aria-label="Revoke recruiter link"><ShieldOff className="h-4 w-4" /></Button></>}</div>
          {editingShareId === share.id && <div className="mt-3 grid w-full gap-2 sm:grid-cols-[1fr_130px_auto]"><Input aria-label="Invited recruiter email" type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} placeholder="Anyone with link" /><select aria-label="Updated link expiry" value={editExpiry} onChange={(event) => setEditExpiry(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="1">1 day</option><option value="7">7 days</option><option value="30">30 days</option><option value="never">No expiry</option></select><div className="flex gap-2"><Button size="sm" disabled={busy} onClick={() => void saveEdit(share.id)}>Save</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => setEditingShareId(null)}>Cancel</Button></div><label className="sm:col-span-3 flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" checked={editDownload} onChange={(event) => setEditDownload(event.target.checked)} />Allow downloads</label></div>}
        </li>;
      })}</ul>}
    </div>
  );
};

export default OwnerShareManager;
