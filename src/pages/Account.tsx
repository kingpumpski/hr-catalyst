import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/useAuth";

const Account = () => {
  const { configured, loading, session, isOwner, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const returnTo = (location.state as { from?: unknown } | null)?.from;
  const destination = typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/cv";

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const authError = await signIn(email.trim(), password);
      if (authError) {
        setError(authError.message);
      } else {
        setPassword("");
        navigate(destination, { replace: true });
      }
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    setError("");
    try {
      const authError = await signOut();
      if (authError) setError(authError.message);
    } catch (signOutError) {
      setError(signOutError instanceof Error ? signOutError.message : "Sign out failed. Please try again.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-md p-8 shadow-soft">
        <Button variant="ghost" asChild className="mb-5 -ml-3"><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to profile</Link></Button>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3"><ShieldCheck className="h-6 w-6 text-primary" /></div>
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account access</p><h1 className="text-2xl font-bold text-foreground">Owner sign-in</h1></div>
        </div>

        {loading ? <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">Checking your session…</p> : !configured ? (
          <p className="mt-6 text-sm leading-6 text-destructive">
            Owner sign-in is unavailable because Supabase is not configured. Set the project URL and publishable key in the deployment environment.
          </p>
        ) : session ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">Signed in as <strong className="text-foreground">{session.user.email}</strong>.</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {isOwner ? "Your account has owner access to editing, settings, and the private referee vault." : "This account is a read-only viewer. Only an administrator can assign the project owner role."}
            </p>
            {isOwner && <Button asChild className="w-full"><Link to={destination}>Open owner workspace</Link></Button>}
            <Button variant="outline" className="w-full" onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Sign-in is limited to accounts provisioned by the project administrator. Owner permissions are assigned separately and cannot be self-selected.
            </p>
            <form onSubmit={handleSignIn} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-foreground">Email<Input className="mt-2" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label className="block text-sm font-medium text-foreground">Password<Input className="mt-2" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</Button>
            </form>
          </>
        )}
        {error && session && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
      </Card>
    </main>
  );
};

export default Account;
