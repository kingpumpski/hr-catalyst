import "@/referee-vault-print.css";
import { FormEvent, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, LockKeyhole, Plus, Printer, Save, ShieldCheck, Trash2, UnlockKeyhole } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  clearRefereeVault,
  hasRefereeVault,
  saveRefereeVault,
  unlockRefereeVault,
  type Referee,
} from "@/lib/refereeVault";

const emptyReferee = (): Referee => ({
  id: crypto.randomUUID(),
  name: "",
  role: "",
  organization: "",
  relationship: "",
  email: "",
  phone: "",
  notes: "",
});

const RefereeVault = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [hasVault, setHasVault] = useState(() => hasRefereeVault(userId));
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [vaultPassword, setVaultPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referees, setReferees] = useState<Referee[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const resetFeedback = () => {
    setMessage("");
    setError("");
  };

  const createVault = async (event: FormEvent) => {
    event.preventDefault();
    resetFeedback();
    if (password.length < 8) {
      setError("Use a vault password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      await saveRefereeVault([], password, userId);
      setHasVault(true);
      setUnlocked(true);
      setReferees([]);
      setVaultPassword(password);
      setPassword("");
      setConfirmPassword("");
      setMessage("Private referee vault created on this device.");
    } catch {
      setError("The vault could not be created in this browser.");
    }
  };

  const unlock = async (event: FormEvent) => {
    event.preventDefault();
    resetFeedback();
    try {
      const data = await unlockRefereeVault(password, userId);
      setReferees(data);
      setUnlocked(true);
      setVaultPassword(password);
      setPassword("");
    } catch {
      setError("Unable to unlock the vault. Check your password.");
    }
  };

  const save = async () => {
    resetFeedback();
    if (!vaultPassword) {
      setError("Unlock the vault again before saving changes.");
      return;
    }
    try {
      // Reuse the password that successfully unlocked this vault. Prompting for a
      // fresh password here could silently replace the encryption key on a typo.
      await saveRefereeVault(referees, vaultPassword, userId);
      setMessage("Referee information encrypted and saved locally.");
    } catch {
      setError("The referee information could not be saved.");
    }
  };

  const removeReferee = (id: string) => {
    setReferees((current) => current.filter((referee) => referee.id !== id));
  };

  const copyContact = async (referee: Referee) => {
    const text = [referee.name, referee.role, referee.organization, referee.email, referee.phone]
      .filter(Boolean)
      .join(" | ");
    await navigator.clipboard.writeText(text);
    setMessage(`Contact details copied for ${referee.name || "referee"}.`);
  };

  const lock = () => {
    setUnlocked(false);
    setReferees([]);
    setVaultPassword("");
    resetFeedback();
  };

  const deleteVault = () => {
    if (!window.confirm("Delete the encrypted referee vault from this device? This cannot be undone.")) return;
    clearRefereeVault(userId);
    setHasVault(false);
    setUnlocked(false);
    setReferees([]);
    setPassword("");
    setVaultPassword("");
    setConfirmPassword("");
    setMessage("The local referee vault has been deleted.");
  };

  if (!hasVault) {
    return (
      <main className="referee-vault-main min-h-screen bg-background px-6 py-12">
        <div className="container mx-auto max-w-2xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Back to owner controls</Link>
          </Button>
          <Card className="p-8 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3"><LockKeyhole className="h-6 w-6 text-primary" /></div>
              <div>
                <Badge variant="secondary">Private owner area</Badge>
                <h1 className="mt-2 text-2xl font-bold text-foreground">Create referee vault</h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Store referee contacts separately from the public portfolio. Information is encrypted in this browser and is never rendered on recruiter-facing pages.
            </p>
            <form onSubmit={createVault} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-foreground">Vault password<Input className="mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
              <label className="block text-sm font-medium text-foreground">Confirm password<Input className="mt-2" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" /></label>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full"><ShieldCheck className="mr-2 h-4 w-4" /> Create encrypted vault</Button>
            </form>
          </Card>
        </div>
      </main>
    );
  }

  if (!unlocked) {
    return (
      <main className="referee-vault-main min-h-screen bg-background px-6 py-12">
        <div className="container mx-auto max-w-md">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Back to owner controls</Link>
          </Button>
          <Card className="p-8 shadow-soft">
            <div className="text-center">
              <div className="mx-auto mb-4 w-fit rounded-xl bg-primary/10 p-3"><LockKeyhole className="h-7 w-7 text-primary" /></div>
              <Badge variant="secondary">Encrypted local vault</Badge>
              <h1 className="mt-3 text-2xl font-bold text-foreground">Unlock referees</h1>
              <p className="mt-2 text-sm text-muted-foreground">Your referee data stays encrypted until you unlock it.</p>
            </div>
            <form onSubmit={unlock} className="mt-6 space-y-4">
              <Input type="password" placeholder="Vault password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus autoComplete="current-password" />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full"><UnlockKeyhole className="mr-2 h-4 w-4" /> Unlock vault</Button>
            </form>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="referee-vault-main min-h-screen bg-background px-6 py-12">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Button variant="ghost" asChild className="mb-3 -ml-3"><Link to="/settings"><ArrowLeft className="mr-2 h-4 w-4" /> Owner controls</Link></Button>
            <div className="flex items-center gap-2"><Badge>Private</Badge><Badge variant="secondary">Encrypted</Badge></div>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Referee vault</h1>
            <p className="mt-1 text-muted-foreground">Keep trusted professional referee information ready for applications.</p>
          </div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Print references</Button><Button variant="outline" onClick={lock}><LockKeyhole className="mr-2 h-4 w-4" /> Lock</Button><Button onClick={save}><Save className="mr-2 h-4 w-4" /> Save encrypted</Button></div>
        </div>

        <Card className="mb-6 border-primary/20 bg-primary/5 p-4">
          <p className="text-sm text-muted-foreground"><strong className="text-foreground">Privacy boundary:</strong> referee details are not included in the recruiter-facing portfolio or CV library. The optimized CV can continue to say “References available upon request.”</p>
        </Card>

        {message && <p className="mb-4 text-sm text-emerald-700 dark:text-emerald-400">{message}</p>}
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        <div className="space-y-6">
          {referees.map((referee, index) => (
            <Card key={referee.id} className="p-6 shadow-soft">
              <div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-semibold text-foreground">Referee {index + 1}</h2><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => copyContact(referee)}><Copy className="mr-2 h-4 w-4" /> Copy</Button><Button variant="ghost" size="sm" onClick={() => removeReferee(referee.id)}><Trash2 className="mr-2 h-4 w-4" /> Remove</Button></div></div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium">Full name<Input className="mt-2" value={referee.name} onChange={(e) => setReferees((items) => items.map((item) => item.id === referee.id ? { ...item, name: e.target.value } : item))} /></label>
                <label className="text-sm font-medium">Current / relevant role<Input className="mt-2" value={referee.role} onChange={(e) => setReferees((items) => items.map((item) => item.id === referee.id ? { ...item, role: e.target.value } : item))} /></label>
                <label className="text-sm font-medium">Organization<Input className="mt-2" value={referee.organization} onChange={(e) => setReferees((items) => items.map((item) => item.id === referee.id ? { ...item, organization: e.target.value } : item))} /></label>
                <label className="text-sm font-medium">Relationship to you<Input className="mt-2" value={referee.relationship} onChange={(e) => setReferees((items) => items.map((item) => item.id === referee.id ? { ...item, relationship: e.target.value } : item))} /></label>
                <label className="text-sm font-medium">Email<Input className="mt-2" type="email" value={referee.email} onChange={(e) => setReferees((items) => items.map((item) => item.id === referee.id ? { ...item, email: e.target.value } : item))} /></label>
                <label className="text-sm font-medium">Phone / WhatsApp<Input className="mt-2" value={referee.phone} onChange={(e) => setReferees((items) => items.map((item) => item.id === referee.id ? { ...item, phone: e.target.value } : item))} /></label>
                <label className="text-sm font-medium md:col-span-2">Private notes<Textarea className="mt-2" value={referee.notes} onChange={(e) => setReferees((items) => items.map((item) => item.id === referee.id ? { ...item, notes: e.target.value } : item))} placeholder="Availability, preferred contact method, context, or application notes" /></label>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setReferees((items) => [...items, emptyReferee()])}><Plus className="mr-2 h-4 w-4" /> Add referee</Button>
          <Button onClick={save}><Save className="mr-2 h-4 w-4" /> Save encrypted vault</Button>
          <Button variant="ghost" className="text-destructive" onClick={deleteVault}>Delete vault</Button>
        </div>
        <section className="referee-vault-print" aria-label="Printable referee list">
          <h1>Professional References</h1>
          {referees.map((referee) => (
            <article key={referee.id}>
              <h2>{referee.name}</h2>
              <p>{[referee.role, referee.organization].filter(Boolean).join(" — ")}</p>
              {referee.relationship && <p>Relationship: {referee.relationship}</p>}
              {[referee.email, referee.phone].filter(Boolean).map((value) => <p key={value}>{value}</p>)}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default RefereeVault;
