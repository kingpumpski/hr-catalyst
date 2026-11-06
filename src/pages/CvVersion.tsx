import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileDown, Printer } from "lucide-react";
import { getCvVersionFromCatalog } from "@/data/cvCatalog";
import type { CvVersion } from "@/data/cvVersions";
import NotFound from "./NotFound";
import { useSeo } from "@/lib/seo";
import { getRecruiterDocumentTitle } from "@/lib/recruiterDocument";
import { toast } from "@/hooks/use-toast";
import CvEditorPanel from "@/components/CvEditorPanel";
import EditableCvDocument from "@/components/EditableCvDocument";
import { loadCvEditorData, saveCvEditorData, type CvEditorData } from "@/lib/cvEditor";
import { useAuth } from "@/components/AuthProvider";
import { hasRefereeVault, unlockRefereeVault, type Referee } from "@/lib/refereeVault";
import { loadDocumentSettings } from "@/lib/documentSettings";
import { formatRefereesForDocument } from "@/lib/refereeDocument";
import { buildCoverLetter } from "@/lib/coverLetter";
import { getWorkspaceDocumentContent, listWorkspaceDocuments, publishWorkspaceDocument, removeWorkspaceDocumentArtifact, saveWorkspaceDocument, uploadWorkspaceDocumentArtifact } from "@/lib/workspaceDocuments";

const CoverLetterDocument = lazy(() => import("@/components/CoverLetterDocument"));
const AtsKeywordChecker = lazy(() => import("@/components/AtsKeywordChecker"));

type DocumentTab = "cv" | "resume" | "letter";
const documentTabs: DocumentTab[] = ["cv", "resume", "letter"];
const documentLabels: Record<DocumentTab, string> = { cv: "CV", resume: "Resume", letter: "Cover Letter" };
const DocumentFallback = () => <div className="min-h-[60vh] rounded-lg border border-border bg-background" aria-hidden="true" />;

const CvVersionPage = () => {
  const { slug } = useParams();
  const version = getCvVersionFromCatalog(slug);
  if (!version) return <NotFound />;
  return <CvVersionContent key={version.slug} version={version} />;
};

const CvVersionContent = ({ version }: { version: CvVersion }) => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab");
  const workspaceMode = searchParams.get("workspace") === "1";
  const [workspaceTab] = useState<DocumentTab>(initialTab === "resume" || initialTab === "letter" ? initialTab : "cv");
  const [tab, setTab] = useState<DocumentTab>(workspaceTab);
  const [recipientName, setRecipientName] = useState("Hiring Manager");
  const [employerName, setEmployerName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobReference, setJobReference] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { session, workspace, user } = useAuth();
  const userId = session?.user.id;
  const [editorData, setEditorData] = useState<CvEditorData>(() => loadCvEditorData(version.slug, version, userId));
  const [workspaceBusy, setWorkspaceBusy] = useState(false);
  const [workspaceFeedback, setWorkspaceFeedback] = useState("");
  const [referencePassword, setReferencePassword] = useState("");
  const [vaultReferees, setVaultReferees] = useState<Referee[] | null>(null);
  const [vaultError, setVaultError] = useState("");
  const [selectedRefereeIds, setSelectedRefereeIds] = useState<Record<"cv" | "resume", string[]>>({ cv: [], resume: [] });
  const [includeReferees, setIncludeReferees] = useState<Record<"cv" | "resume", boolean>>({ cv: false, resume: false });
  const tabRefs = useRef<Partial<Record<DocumentTab, HTMLButtonElement | null>>>({});
  const storageOwnerRef = useRef(userId);
  useEffect(() => {
    if (storageOwnerRef.current !== userId) return;
    if (!saveCvEditorData(version.slug, editorData, version, userId)) {
      toast({ title: "Changes were not saved", description: "Browser storage is unavailable. Download a copy before leaving this page.", variant: "destructive" });
    }
  }, [version, version.slug, editorData, userId]);
  useEffect(() => {
    if (storageOwnerRef.current === userId) return;
    storageOwnerRef.current = userId;
    setEditorData(loadCvEditorData(version.slug, version, userId));
  }, [userId, version.slug]);
  useEffect(() => {
    if (!workspaceMode || !session || !workspace) return;
    let active = true;
    getWorkspaceDocumentContent(session, workspace, `${version.slug}-${workspaceTab}`)
      .then((saved) => {
        if (!active || !saved) return;
        const content = saved.content;
        if (workspaceTab !== "letter" && content && typeof content === "object") {
          setEditorData(content as CvEditorData);
        } else if (workspaceTab === "letter" && content && typeof content === "object") {
          const inputs = (content as { letterInputs?: Partial<{ recipientName: string; employerName: string; jobTitle: string; jobReference: string; companyAddress: string }> }).letterInputs;
          if (inputs) {
            setRecipientName(inputs.recipientName ?? "Hiring Manager");
            setEmployerName(inputs.employerName ?? "");
            setJobTitle(inputs.jobTitle ?? "");
            setJobReference(inputs.jobReference ?? "");
            setCompanyAddress(inputs.companyAddress ?? "");
          }
        }
      })
      .catch((reason: unknown) => {
        if (active) setWorkspaceFeedback(reason instanceof Error ? reason.message : "Saved workspace content could not be loaded.");
      });
    return () => { active = false; };
  }, [workspaceMode, session, workspace, version.slug, workspaceTab]);

  const activeDocumentKind = tab === "resume" ? "resume" : "cv";
  const selectedReferees = vaultReferees?.filter((referee) =>
    selectedRefereeIds[activeDocumentKind].includes(referee.id),
  ) ?? [];
  const includedReferenceText = formatRefereesForDocument(selectedReferees);
  const documentData = tab !== "letter" && includeReferees[activeDocumentKind] && includedReferenceText
    ? { ...editorData, references: includedReferenceText }
    : editorData;
  const showReferences = loadDocumentSettings().showReferences;

  useSeo({
    title: getRecruiterDocumentTitle(tab === "resume" ? "resume" : "cv"),
    description: version.summary.slice(0, 150),
    path: `/cv/${version.slug}`,
  });

  const letterInputs = { recipientName, employerName, companyAddress, jobTitle, jobReference };
  const saveToWorkspace = async (publish: boolean) => {
    if (!session || !workspace) return;
    setWorkspaceBusy(true);
    setWorkspaceFeedback("");
    let uploadedArtifactPath: string | null = null;
    try {
      const documentType = tab === "letter" ? "cover_letter" : tab;
      const slug = `${version.slug}-${tab}`;
      const title = `${version.title} — ${documentType === "cover_letter" ? "Cover Letter" : documentType.toUpperCase()}`;
      const existing = (await listWorkspaceDocuments(session, workspace)).find((item) => item.slug === slug);
      if (existing && !window.confirm(`A private ${documentType.replace("_", " ")} already exists in your workspace. Replace its current draft with this browser version?`)) return;
      const coverLetter = tab === "letter" ? buildCoverLetter(version, letterInputs) : null;
      const content = tab === "letter" ? { coverLetter, letterInputs } : editorData;
      const saved = await saveWorkspaceDocument(session, workspace, { slug, title, documentType, content });
      if (publish) {
        const snapshot = tab === "letter" && coverLetter
          ? { coverLetter: { opening: `${coverLetter.greeting} ${coverLetter.paragraphs[0]}`, body: coverLetter.paragraphs.slice(1, -2), closing: `${coverLetter.paragraphs.at(-2) ?? ""} ${coverLetter.paragraphs.at(-1) ?? ""} ${coverLetter.signOff}` } }
          : editorData;
        const artifact = tab === "letter"
          ? await import("@/lib/docxExport").then(({ createCoverLetterDocxBlob }) => createCoverLetterDocxBlob(version, letterInputs))
          : await import("@/lib/editedCvDocx").then(({ createEditedCvDocxBlob }) => createEditedCvDocxBlob(editorData));
        uploadedArtifactPath = await uploadWorkspaceDocumentArtifact(session, workspace, saved, artifact);
        const published = await publishWorkspaceDocument(session, workspace, saved, snapshot, uploadedArtifactPath);
        uploadedArtifactPath = null;
        setWorkspaceFeedback(`Published immutable version ${published.version_number} with a private Word download to your workspace.`);
      } else {
        setWorkspaceFeedback("Saved securely to your private workspace as a draft.");
      }
    } catch (reason) {
      if (uploadedArtifactPath && session) {
        await removeWorkspaceDocumentArtifact(session, uploadedArtifactPath).catch(() => undefined);
      }
      setWorkspaceFeedback(reason instanceof Error ? reason.message : "The document could not be saved to your workspace.");
    } finally {
      setWorkspaceBusy(false);
    }
  };

  const handleUnlockVault = async (event: React.FormEvent) => {
    event.preventDefault();
    setVaultError("");
    try {
      const unlockedReferees = await unlockRefereeVault(referencePassword, userId);
      setVaultReferees(unlockedReferees);
      setReferencePassword("");
    } catch (error) {
      setVaultError(error instanceof Error ? error.message : "The referee vault could not be unlocked.");
    }
  };
  const lockVault = () => {
    setVaultReferees(null);
    setSelectedRefereeIds({ cv: [], resume: [] });
    setIncludeReferees({ cv: false, resume: false });
    setReferencePassword("");
    setVaultError("");
  };
  const toggleReferee = (id: string, checked: boolean) => {
    setSelectedRefereeIds((current) => ({
      ...current,
      [activeDocumentKind]: checked
        ? [...current[activeDocumentKind], id]
        : current[activeDocumentKind].filter((selectedId) => selectedId !== id),
    }));
  };
  const handlePrint = () => {
    if (tab !== "letter") document.title = getRecruiterDocumentTitle(tab);
    window.print();
  };
  const handleDocxDownload = async () => {
    setIsExporting(true);
    try {
      if (tab === "letter") {
        const { downloadCoverLetterDocx } = await import("@/lib/docxExport");
        await downloadCoverLetterDocx(version, letterInputs);
      } else if (editorData) {
        const { downloadEditedCvDocx } = await import("@/lib/editedCvDocx");
        await downloadEditedCvDocx(documentData, tab);
      }
    } catch {
      toast({ title: "Word download failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };
  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = documentTabs.indexOf(tab);
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % documentTabs.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + documentTabs.length) % documentTabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = documentTabs.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextTab = documentTabs[nextIndex];
    setTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  return (
    <main className="cv-document-page min-h-screen py-12 px-6">
      <div className="container max-w-5xl mx-auto">
        <div className="no-print">
          <Button variant="ghost" asChild className="mb-6"><Link to="/cv"><ArrowLeft className="mr-2 h-4 w-4" /> All versions</Link></Button>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div><h1 className="text-3xl font-semibold text-foreground">{version.title}</h1><p className="text-sm text-muted-foreground">{version.targetRoles}</p></div>
            <div className="flex flex-wrap gap-2">
              {user ? <><Button variant="outline" onClick={() => void saveToWorkspace(false)} disabled={workspaceBusy}>{workspaceBusy ? "Saving…" : "Save to workspace"}</Button><Button variant="secondary" onClick={() => void saveToWorkspace(true)} disabled={workspaceBusy}>{workspaceBusy ? "Publishing…" : "Publish snapshot"}</Button></> : <Button variant="outline" asChild><Link to={`/auth?next=${encodeURIComponent(`/cv/${version.slug}`)}`}>Sign in to save</Link></Button>}
              <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Download {documentLabels[tab]} as PDF</Button>
              <Button variant="outline" onClick={handleDocxDownload} disabled={isExporting}><FileDown className="mr-2 h-4 w-4" />{isExporting ? "Preparing…" : `Download ${documentLabels[tab]} as Word`}</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Career document type">
            {documentTabs.map((documentTab) => <Button key={documentTab} ref={(element) => { tabRefs.current[documentTab] = element; }} variant={tab === documentTab ? "default" : "outline"} id={`document-tab-${documentTab}`} role="tab" aria-selected={tab === documentTab} aria-controls={`document-panel-${documentTab}`} tabIndex={tab === documentTab ? 0 : -1} onClick={() => setTab(documentTab)} onKeyDown={handleTabKeyDown}>{documentLabels[documentTab]}</Button>)}
          </div>
          {workspaceFeedback && <p role="status" className="mb-4 rounded-lg border border-border bg-muted/30 p-3 text-sm">{workspaceFeedback}</p>}
          <div className="flex flex-wrap gap-2 mb-8">{version.keywords.map((k) => <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>)}</div>
          {tab !== "letter" && <CvEditorPanel value={editorData} onChange={setEditorData} />}
          {tab !== "letter" && <section className="mb-8 rounded-lg border border-border bg-muted/20 p-4" aria-labelledby="reference-inclusion-title">
            <h2 id="reference-inclusion-title" className="text-sm font-semibold text-foreground">Optional references for this {documentLabels[tab]}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Referee details remain encrypted in your private local vault. Selected details are included only in this private preview and its downloads, never in public recruiter shares or published snapshots.</p>
            {!hasRefereeVault(userId) && vaultReferees === null ? (
              <Button variant="outline" asChild className="mt-4"><Link to="/owner/referees">Create or manage referee vault</Link></Button>
            ) : vaultReferees === null ? (
              <form onSubmit={handleUnlockVault} className="mt-4 flex flex-wrap items-end gap-3">
                <label className="min-w-56 flex-1 text-sm font-medium text-foreground">Vault password<Input className="mt-2" type="password" autoComplete="current-password" value={referencePassword} onChange={(event) => setReferencePassword(event.target.value)} required /></label>
                <Button type="submit">Unlock referee vault</Button>
              </form>
            ) : (
              <div className="mt-4 space-y-3">
                {vaultReferees.length > 0 ? vaultReferees.map((referee) => (
                  <label key={referee.id} className="flex items-start gap-3 rounded-md border border-border bg-background p-3 text-sm">
                    <input type="checkbox" className="mt-1" checked={selectedRefereeIds[activeDocumentKind].includes(referee.id)} onChange={(event) => toggleReferee(referee.id, event.target.checked)} />
                    <span><strong className="text-foreground">{referee.name || "Unnamed referee"}</strong><span className="block text-muted-foreground">{[referee.role, referee.organization].filter(Boolean).join(" · ")}</span></span>
                  </label>
                )) : <p className="text-sm text-muted-foreground">No referees are saved in the vault yet.</p>}
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input type="checkbox" checked={includeReferees[activeDocumentKind]} disabled={!selectedReferees.length || !showReferences} onChange={(event) => setIncludeReferees((current) => ({ ...current, [activeDocumentKind]: event.target.checked }))} />
                    Include selected referees in this {documentLabels[tab]} preview and downloads
                  </label>
                  <Button variant="outline" size="sm" onClick={lockVault}>Lock vault</Button>
                </div>
                {!showReferences && <p className="text-xs text-muted-foreground">References are disabled in document settings. Enable “Show references” in Settings to print or export them.</p>}
              </div>
            )}
            {vaultError && <p className="mt-3 text-sm text-destructive" role="alert">{vaultError}</p>}
          </section>}
          {tab === "letter" && <div className="mb-8 rounded-lg border border-border bg-muted/20 p-4 no-print">
            <h2 className="text-sm font-semibold text-foreground">Tailor this cover letter</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter the employer and job title — the letter below rewrites itself instantly.</p>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div><label className="text-sm text-foreground mb-1 block" htmlFor="employer-name">Employer name</label><Input id="employer-name" value={employerName} onChange={(e) => setEmployerName(e.target.value)} placeholder="Company or organisation" /></div>
              <div><label className="text-sm text-foreground mb-1 block" htmlFor="job-title">Job title</label><Input id="job-title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder={version.title} /></div>
              <div><label className="text-sm text-foreground mb-1 block" htmlFor="recipient-name">Recipient name</label><Input id="recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Hiring Manager" /></div>
              <div><label className="text-sm text-foreground mb-1 block" htmlFor="job-reference">Job reference (optional)</label><Input id="job-reference" value={jobReference} onChange={(e) => setJobReference(e.target.value)} placeholder="e.g. REF/2026/014" /></div>
            </div>
            <div className="mt-3"><label className="text-sm text-foreground mb-1 block" htmlFor="company-address">Employer address</label><Textarea id="company-address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Employer address" rows={3} /></div>
          </div>}
          {tab !== "letter" && <Suspense fallback={null}><AtsKeywordChecker version={version} editorData={editorData} onApply={setEditorData} /></Suspense>}
        </div>
        <Suspense fallback={<DocumentFallback />}>
          <div id={`document-panel-${tab}`} role="tabpanel" aria-labelledby={`document-tab-${tab}`} tabIndex={-1}>
            {tab === "letter" ? <CoverLetterDocument version={version} {...letterInputs} /> : <EditableCvDocument data={documentData} kind={tab} />}
          </div>
        </Suspense>
      </div>
    </main>
  );
};
export default CvVersionPage;
