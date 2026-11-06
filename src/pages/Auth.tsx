import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabaseAuth";

type Mode = "signin" | "signup" | "forgot" | "recovery";

const safeNextPath = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : "/owner";

const AuthPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading, signIn, signUp, requestPasswordReset, updatePassword } = useAuth();
  const requestedMode = params.get("mode");
  const [mode, setMode] = useState<Mode>(requestedMode === "recovery" ? "recovery" : "signin");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const nextPath = safeNextPath(params.get("next"));

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-background"><LoaderCircle className="h-7 w-7 animate-spin text-primary" aria-label="Loading account" /></main>;
  if (user && mode !== "recovery" && !recoveryFlow) return <Navigate to={nextPath} replace />;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
        navigate(nextPath, { replace: true });
      } else if (mode === "signup") {
        const hasSession = await signUp(email, password, fullName);
        if (hasSession) navigate("/owner", { replace: true });
        else {
          setMessage("Your account request was received. Check your email for the verification link before signing in.");
          setMode("signin");
        }
      } else if (mode === "forgot") {
        await requestPasswordReset(email);
        setMessage("If the address is registered, a password recovery link will be sent. Check your inbox and spam folder.");
      } else {
        if (password.length < 10) throw new Error("Use at least 10 characters for your new password.");
        if (password !== confirmPassword) throw new Error("The passwords do not match.");
        await updatePassword(password);
        setMessage("Your password has been updated. You can now continue to your workspace.");
        navigate("/owner", { replace: true });
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The account request could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : mode === "recovery" ? "Choose a new password" : "Sign in to HR Catalyst";
  const description = mode === "signup" ? "Create a private workspace for your career documents." : mode === "forgot" ? "We'll send a secure recovery link if the account exists." : mode === "recovery" ? "Set a new password for your HR Catalyst account." : "Access your private workspace, saved documents and secure sharing.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="mr-2 h-4 w-4" />Back to public profile</Link>
        <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><BriefcaseBusiness className="h-6 w-6" /></div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>

        {!isSupabaseConfigured() && <p role="alert" className="mt-5 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">Account access is not configured. The administrator must provide the Supabase project URL and publishable key.</p>}
        {error && <p role="alert" className="mt-5 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">{message}</p>}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === "signup" && <div className="space-y-2"><Label htmlFor="full-name">Full name</Label><Input id="full-name" autoComplete="name" value={fullName} onChange={event => setFullName(event.target.value)} required maxLength={100} /></div>}
          {mode !== "recovery" && <div className="space-y-2"><Label htmlFor="email">Email address</Label><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="email" className="pl-9" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></div></div>}
          {mode !== "forgot" && <div className="space-y-2"><Label htmlFor="password">{mode === "recovery" ? "New password" : "Password"}</Label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input id="password" className="pl-9 pr-10" type={showPassword ? "text" : "password"} autoComplete={mode === "recovery" ? "new-password" : mode === "signup" ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} required minLength={mode === "recovery" || mode === "signup" ? 10 : 1} /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>}
          {mode === "recovery" && <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required minLength={10} /></div>}
          <Button type="submit" className="w-full" disabled={busy || !isSupabaseConfigured()}>{busy && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}{mode === "signup" ? "Create account" : mode === "forgot" ? "Send recovery link" : mode === "recovery" ? "Update password" : "Sign in"}</Button>
        </form>

        {mode === "signin" && <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm"><button type="button" className="text-primary hover:underline" onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}>Forgot password?</button><button type="button" className="text-primary hover:underline" onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>Create account</button></div>}
        {mode === "signup" && <p className="mt-5 text-center text-sm text-muted-foreground">Already registered? <button type="button" className="font-semibold text-primary hover:underline" onClick={() => setMode("signin")}>Sign in</button></p>}
        {(mode === "forgot" || mode === "recovery") && <p className="mt-5 text-center text-sm"><button type="button" className="font-semibold text-primary hover:underline" onClick={() => { setMode("signin"); setError(""); setMessage(""); }}>Return to sign in</button></p>}
        <p className="mt-7 border-t border-border pt-5 text-xs leading-5 text-muted-foreground">Use a unique password. HR Catalyst will never ask you to share your password or verification code with another person.</p>
      </section>
    </main>
  );
};

export default AuthPage;
