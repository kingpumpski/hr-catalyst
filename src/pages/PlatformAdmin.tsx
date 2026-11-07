import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, MailPlus, RefreshCw, ShieldCheck, ShieldMinus, ShieldPlus, UserRound, UserRoundX, UserRoundCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabaseAuth";

type AdminUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
  is_platform_admin: boolean;
};

const callAdmin = async <T,>(action: string, extra: Record<string, string> = {}): Promise<T> => {
  const { data, error } = await getSupabaseClient().functions.invoke<T>("platform-admin", {
    body: { action, ...extra },
  });
  if (error) throw new Error(error.message || "The administrator request failed.");
  if (!data) throw new Error("The administrator service returned no data.");
  return data;
};

const PlatformAdmin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await callAdmin<{ users: AdminUser[] }>("list-users");
      setUsers(result.users);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Administrator access could not be verified.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    callAdmin<{ users: AdminUser[] }>("list-users")
      .then(result => { if (active) setUsers(result.users); })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : "Administrator access could not be verified.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const invite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSendingInvite(true);
    try {
      await callAdmin("invite-user", { email });
      toast.success("Invitation sent. The recipient must verify their email before signing in.");
      setEmail("");
      await refresh();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Invitation could not be sent.");
    } finally {
      setSendingInvite(false);
    }
  };

  const updateUser = async (target: AdminUser, action: string, confirmation: string) => {
    if (!window.confirm(confirmation)) return;
    setBusyId(target.id);
    try {
      await callAdmin(action, { userId: target.id });
      toast.success("Account permissions updated.");
      await refresh();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "The account could not be updated.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Link to="/owner" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Back to workspace</Link>
        <header className="mb-8 mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Restricted platform access</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Platform administration</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage account invitations, access status and administrator assignments. Private CV content and referee vaults are not exposed here.</p>
          </div>
          <Button variant="outline" onClick={() => void refresh()} disabled={loading}><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-5"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Your administrator account</p><p className="font-semibold">{user?.email}</p></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Accounts in first page</p><p className="text-2xl font-semibold tabular-nums">{users.length}</p></div></div></Card>
          <Card className="p-5"><div className="flex items-center gap-3"><ShieldPlus className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Platform administrators</p><p className="text-2xl font-semibold tabular-nums">{users.filter(item => item.is_platform_admin).length}</p></div></div></Card>
        </div>

        <Card className="mb-6 p-5">
          <h2 className="font-semibold">Invite a user</h2>
          <p className="mt-1 text-sm text-muted-foreground">Send an email invitation. The recipient creates their password and verifies their email through Supabase.</p>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={invite}>
            <div className="flex-1 space-y-2"><Label htmlFor="invite-email">Email address</Label><Input id="invite-email" type="email" value={email} onChange={event => setEmail(event.target.value)} maxLength={320} required placeholder="person@example.com" /></div>
            <Button type="submit" disabled={sendingInvite || !email.trim()}>{sendingInvite ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <MailPlus className="mr-2 h-4 w-4" />}Send invitation</Button>
          </form>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">Registered accounts</h2><p className="mt-1 text-sm text-muted-foreground">The first 100 accounts are shown. Account administration never displays passwords or private documents.</p></div><Badge variant="outline">Protected service</Badge></div>
          {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">{error}</p>}
          {loading && <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground"><LoaderCircle className="h-4 w-4 animate-spin" />Loading accounts…</div>}
          {!loading && !error && users.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No accounts found.</p>}
          {!loading && users.length > 0 && <div className="mt-5 divide-y divide-border">{users.map(account => {
            const suspended = Boolean(account.banned_until);
            const busy = busyId === account.id;
            return <div key={account.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="break-all font-medium">{account.email ?? "No email address"}</p>
                <p className="mt-1 text-xs text-muted-foreground">Created {new Date(account.created_at).toLocaleDateString()} · {account.last_sign_in_at ? `Last active ${new Date(account.last_sign_in_at).toLocaleDateString()}` : "Never signed in"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant={account.email_confirmed_at ? "secondary" : "outline"}>{account.email_confirmed_at ? "Email verified" : "Unverified"}</Badge>
                  <Badge variant={suspended ? "destructive" : "secondary"}>{suspended ? "Suspended" : "Active"}</Badge>
                  {account.is_platform_admin && <Badge><ShieldCheck className="mr-1 h-3 w-3" />Platform admin</Badge>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {account.is_platform_admin
                  ? <Button size="sm" variant="outline" disabled={busy || account.id === user?.id} onClick={() => void updateUser(account, "revoke-admin", `Remove platform administrator access from ${account.email}?`)}><ShieldMinus className="mr-2 h-4 w-4" />Revoke admin</Button>
                  : <Button size="sm" variant="outline" disabled={busy} onClick={() => void updateUser(account, "grant-admin", `Grant platform administrator access to ${account.email}?`)}><ShieldPlus className="mr-2 h-4 w-4" />Make admin</Button>}
                {suspended
                  ? <Button size="sm" variant="outline" disabled={busy || account.id === user?.id} onClick={() => void updateUser(account, "restore-user", `Restore sign-in access for ${account.email}?`)}><UserRoundCheck className="mr-2 h-4 w-4" />Restore</Button>
                  : <Button size="sm" variant="destructive" disabled={busy || account.id === user?.id} onClick={() => void updateUser(account, "suspend-user", `Suspend sign-in access for ${account.email}?`)}><UserRoundX className="mr-2 h-4 w-4" />Suspend</Button>}
              </div>
            </div>;
          })}</div>}
        </Card>
        <p className="mt-6 text-xs leading-5 text-muted-foreground">Administrator access is verified by the server against a protected database table. The first administrator must be provisioned by the project owner in the Supabase SQL Editor. All administrator actions are recorded in a protected audit table.</p>
      </div>
    </main>
  );
};

export default PlatformAdmin;
