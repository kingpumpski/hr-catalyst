import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Mail, Printer, ShieldAlert, ShieldCheck } from "lucide-react";
import EditableCvDocument from "@/components/EditableCvDocument";
import type { CvEditorData } from "@/lib/cvEditor";
import { getEmailHref } from "@/lib/contactLinks";
import { resolveShare, ShareResolutionError, type ResolvedShare } from "@/lib/shareResolver";
import { useAuth } from "@/components/AuthProvider";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isCvEditorData = (value: unknown): value is CvEditorData => {
  if (!isRecord(value)) return false;
  const profile = value.profile;
  if (!isRecord(profile)) return false;
  const profileIsValid = ["name", "address", "phone", "email", "linkedin"]
    .every((key) => typeof profile[key] === "string");
  const experienceIsValid = Array.isArray(value.experience) && value.experience.every((item) =>
    isRecord(item) &&
    ["id", "company", "title", "location", "period"].every((key) => typeof item[key] === "string") &&
    isStringArray(item.contributions),
  );
  const educationIsValid = Array.isArray(value.education) && value.education.every((item) =>
    isRecord(item) &&
    ["id", "school", "qualification", "field", "period", "location", "description"]
      .every((key) => typeof item[key] === "string"),
  );
  return profileIsValid &&
    typeof value.summary === "string" &&
    isStringArray(value.skills) &&
    isStringArray(value.highlights) &&
    experienceIsValid &&
    educationIsValid &&
    isStringArray(value.leadership) &&
    isStringArray(value.professionalDevelopment) &&
    isStringArray(value.professionalStrengths) &&
    isStringArray(value.languages) &&
    typeof value.references === "string";
};

const isCoverLetterSnapshot = (value: unknown): value is { opening: string; body: string[]; closing: string } => {
  if (!isRecord(value)) return false;
  const letter = isRecord(value.coverLetter) ? value.coverLetter : value;
  return typeof letter.opening === "string" && Array.isArray(letter.body) &&
    letter.body.every((paragraph) => typeof paragraph === "string") && typeof letter.closing === "string";
};

const ShareDocumentPage = () => {
  const location = useLocation();
  return <ShareDocumentContent key={location.pathname} />;
};

type ShareViewState = { share: ResolvedShare | null; error: string; loading: boolean };

const ShareDocumentContent = () => {
  const { documentType } = useParams<{ documentType?: string }>();
  const location = useLocation();
  const { session } = useAuth();
  const [token] = useState(() => {
    const storageKey = `hr-catalyst:share-token:${window.location.pathname}`;
    const fragmentToken = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (fragmentToken) {
      try {
        window.sessionStorage.setItem(storageKey, fragmentToken);
      } catch {
        // The in-memory token still works if browser storage is unavailable.
      }
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      return fragmentToken;
    }
    try {
      return window.sessionStorage.getItem(storageKey) ?? "";
    } catch {
      return "";
    }
  });
  const [viewState, setViewState] = useState<ShareViewState>(() => ({
    share: null,
    error: token ? "" : "This is a private sharing link. Open the complete link supplied by the document owner.",
    loading: Boolean(token),
  }));
  const { share, error, loading } = viewState;

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();

    resolveShare(token, { signal: controller.signal, accessToken: session?.access_token })
      .then((result) => {
        if (documentType === "letter" && result.document.type !== "cover_letter") {
          throw new ShareResolutionError("This link does not contain a cover letter.", 404, "document_type_mismatch");
        }
        if ((documentType === "cv" || documentType === "resume") && result.document.type !== documentType) {
          throw new ShareResolutionError("This link does not contain the requested document type.", 404, "document_type_mismatch");
        }
        setViewState({ share: result, error: "", loading: false });
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setViewState({
          share: null,
          error: reason instanceof Error ? reason.message : "This shared document is unavailable.",
          loading: false,
        });
      });

    return () => controller.abort();
  }, [token, documentType, session?.access_token]);

  const documentContent = share?.document.content;
  const cvData = isCvEditorData(documentContent) ? documentContent : null;
  const canRenderLetter = isCoverLetterSnapshot(documentContent);
  const letter = canRenderLetter && isRecord(documentContent) && isRecord(documentContent.coverLetter)
    ? documentContent.coverLetter
    : documentContent;
  const downloadUrl = share?.download.allowed ? share.download.url : null;
  const contactHref = getEmailHref("Recruiter document request");

  return (
    <main className="cv-document-page min-h-screen bg-background px-6 py-8">
      <div className="container mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Secure recruiter document</p>
            <h1 className="mt-1 text-3xl font-semibold text-foreground">{share?.document.title ?? "Shared document"}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {share?.download.allowed && <Button onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print document</Button>}
            {downloadUrl && <Button variant="outline" asChild><a href={downloadUrl} target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" />Download file</a></Button>}
            <Button variant="outline" asChild><a href={contactHref}><Mail className="mr-2 h-4 w-4" />Contact me</a></Button>
          </div>
        </header>

        {loading && <section className="rounded-xl border border-border bg-card p-8 text-center" role="status"><ShieldCheck className="mx-auto h-8 w-8 text-primary" /><p className="mt-3 font-medium">Verifying secure sharing link…</p><p className="mt-1 text-sm text-muted-foreground">The document is not displayed until the server confirms access.</p></section>}

        {!loading && error && <section className="rounded-xl border border-border bg-card p-8 text-center" role="alert"><ShieldAlert className="mx-auto h-9 w-9 text-destructive" /><h2 className="mt-3 text-xl font-semibold">Document unavailable</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{error}</p>{error.includes("Sign in with the invited email address") && <Button asChild className="mt-5"><Link to={`/auth?next=${encodeURIComponent(location.pathname)}`}>Sign in with invited email</Link></Button>}<Button variant="outline" asChild className="mt-6"><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to main profile</Link></Button></section>}

        {share && <div className="mb-6 flex flex-wrap items-center gap-2 no-print">
          <Badge>{share.document.type === "cover_letter" ? "Cover letter" : share.document.type.toUpperCase()}</Badge>
          <Badge variant={share.download.allowed ? "secondary" : "outline"}>{share.download.allowed ? "Download permitted" : "View only"}</Badge>
          <p className="w-full text-sm text-muted-foreground">Only the published document snapshot approved by the owner is available through this link.</p>
          {!share.download.allowed && <p className="w-full text-xs text-muted-foreground">The owner has disabled document downloads for this share.</p>}
        </div>}

        {share && cvData && <EditableCvDocument data={cvData} />}
        {share && canRenderLetter && isRecord(letter) && <article className="cv-doc mx-auto max-w-3xl">
          <header className="cv-header"><h1>{share.document.title}</h1></header>
          <section><p>{String(letter.opening)}</p></section>
          {(letter.body as string[]).map((paragraph, index) => <section key={index}><p>{paragraph}</p></section>)}
          <section><p>{String(letter.closing)}</p></section>
        </article>}
        {share && !cvData && !canRenderLetter && <section className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">The published snapshot format is not supported by this version of the recruiter viewer. Please contact the document owner for an updated link.</section>}

        <footer className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-5 no-print">
          <Button variant="ghost" asChild><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to main profile</Link></Button>
          <span className="text-xs text-muted-foreground">Private link · access verified on request</span>
        </footer>
      </div>
    </main>
  );
};

export default ShareDocumentPage;
