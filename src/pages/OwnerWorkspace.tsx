import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, LoaderCircle, LogOut, Settings2, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/AuthProvider";
import { listWorkspaceDocuments, type WorkspaceDocument } from "@/lib/workspaceDocuments";

const OwnerWorkspace = () => {
  const { session, user, workspace, signOut } = useAuth();
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!session || !workspace) return;
    setLoading(true);
    setError("");
    try {
      setDocuments(await listWorkspaceDocuments(session, workspace));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your documents could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [session, workspace]);

  useEffect(() => {
    if (!session || !workspace) return;
    let active = true;

    listWorkspaceDocuments(session, workspace)
      .then((result) => {
        if (active) {
          setDocuments(result);
          setError("");
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Your documents could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [session, workspace]);

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Private owner area</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Your workspace</h1>
            <p className="mt-2 text-sm text-muted-foreground">{workspace?.name ?? "Preparing your workspace"} · {user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild><Link to="/settings"><Settings2 className="mr-2 h-4 w-4" />Settings</Link></Button>
            <Button variant="ghost" onClick={() => void signOut()}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5"><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2"><UserRound className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Signed in as</p><p className="font-semibold">{user?.email}</p></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2"><ShieldCheck className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Workspace security</p><p className="font-semibold">Account-scoped access</p></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><div className="rounded-lg bg-primary/10 p-2"><FileText className="h-5 w-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Saved documents</p><p className="font-semibold">{documents.length}</p></div></div></Card>
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><h2 className="text-xl font-semibold">Private documents</h2><p className="mt-1 text-sm text-muted-foreground">Documents saved to this account are protected by workspace ownership policies.</p></div>
            <Button asChild><Link to="/cv">Browse CV versions<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
          </div>
          {error && <p role="alert" className="mt-5 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">{error}</p>}
          {loading && <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />Loading private documents…</div>}
          {!loading && !error && documents.length === 0 && <div className="mt-6 rounded-xl border border-dashed border-border p-8 text-center"><FileText className="mx-auto h-8 w-8 text-muted-foreground" /><h3 className="mt-3 font-semibold">No private documents yet</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Open a CV version and use Save to workspace to create your first private draft. You can publish a snapshot when it is ready to share.</p></div>}
          {!loading && documents.length > 0 && <div className="mt-6 divide-y divide-border">{documents.map((document) => <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-medium">{document.title}</p><p className="mt-1 text-xs text-muted-foreground">{document.document_type.replace("_", " ")} · Updated {new Date(document.updated_at).toLocaleDateString()}</p></div><div className="flex items-center gap-3"><Badge variant={document.status === "published" ? "default" : "secondary"}>{document.status}</Badge><Button size="sm" variant="outline" asChild><Link to={`/cv/${encodeURIComponent(document.slug)}`}>Open editor</Link></Button></div></div>)}</div>}
          <div className="mt-5 flex justify-end"><Button variant="ghost" onClick={() => void refresh()} disabled={loading}>Refresh documents</Button></div>
        </section>

        <p className="mt-6 text-xs leading-5 text-muted-foreground">Your private workspace is separate from the public recruiter profile. Do not share your password. Sign out when using a shared device.</p>
      </div>
    </main>
  );
};

export default OwnerWorkspace;
