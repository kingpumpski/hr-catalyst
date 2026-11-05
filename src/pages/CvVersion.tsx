import { lazy, Suspense, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CvContentEditor from "@/components/CvContentEditor";
import { ArrowLeft, FileDown, Printer } from "lucide-react";
import { getCvVersionFromCatalog } from "@/data/cvCatalog";
import type { CvVersion } from "@/data/cvVersions";
import {
  createOriginalCvContent,
  getCvContentIssues,
  loadCvDocumentContent,
  resetCvDocumentContent,
  saveCvDocumentContent,
  type CvDocumentContent,
} from "@/data/cvDocumentContent";
import NotFound from "./NotFound";
import { useSeo } from "@/lib/seo";
import { getRecruiterDocumentFilename, getRecruiterDocumentTitle } from "@/lib/recruiterDocument";
import { toast } from "@/hooks/use-toast";

const CvDocument = lazy(() => import("@/components/CvDocument"));
const ResumeDocument = lazy(() => import("@/components/ResumeDocument"));
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
  return <CvVersionWorkspace key={version.slug} version={version} />;
};

const CvVersionWorkspace = ({ version }: { version: CvVersion }) => {
  const [tab, setTab] = useState<DocumentTab>("cv");
  const [recipientName, setRecipientName] = useState("Hiring Manager");
  const [employerName, setEmployerName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobReference, setJobReference] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<CvDocumentContent | null>(null);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [initialContentState] = useState(() => {
    try {
      return { content: loadCvDocumentContent(version), error: null as string | null };
    } catch (error) {
      return {
        content: createOriginalCvContent(version),
        error: error instanceof Error ? error.message : "Saved CV edits could not be loaded.",
      };
    }
  });
  const [content, setContent] = useState(initialContentState.content);
  const [storageError, setStorageError] = useState<string | null>(initialContentState.error);
  const tabRefs = useRef<Partial<Record<DocumentTab, HTMLButtonElement | null>>>({});
  const previewContent = editing && draft ? draft : content;
  const activeVersion = {
    ...version,
    summary: previewContent.summary,
    coreSkills: previewContent.coreSkills,
    highlights: previewContent.highlights,
  };

  useSeo({
    title: getRecruiterDocumentTitle(tab === "resume" ? "resume" : "cv", content.name),
    description: content.summary.slice(0, 150),
    path: `/cv/${version.slug}`,
  });

  const letterInputs = { recipientName, employerName, companyAddress, jobTitle, jobReference };

  const handlePrint = () => {
    if (tab === "cv" || tab === "resume") {
      document.title = getRecruiterDocumentFilename(content.name, tab);
    }
    window.print();
  };

  const handleDocxDownload = async () => {
    setIsExporting(true);
    try {
      const { downloadCvDocx, downloadCoverLetterDocx } = await import("@/lib/docxExport");
      if (tab === "letter") await downloadCoverLetterDocx(version, letterInputs);
      else await downloadCvDocx(activeVersion, tab, content);
    } catch {
      toast({ title: "Word download failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSave = () => {
    if (!draft) return;
    const issues = getCvContentIssues(draft);
    setValidationIssues(issues);
    if (issues.length) return;
    try {
      saveCvDocumentContent(version.slug, draft);
      setContent(draft);
      setDraft(null);
      setEditing(false);
      setStorageError(null);
      toast({ title: "CV changes saved", description: "This version is saved in this browser on this device." });
    } catch (error) {
      toast({
        title: "CV changes could not be saved",
        description: error instanceof Error ? error.message : "Check browser storage and try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setDraft(null);
    setValidationIssues([]);
    setEditing(false);
  };

  const handleReset = () => {
    if (!window.confirm("Reset this CV version to its original content? Your saved edits for this version will be removed.")) return;
    try {
      resetCvDocumentContent(version.slug);
      const original = createOriginalCvContent(version);
      setContent(original);
      setDraft(null);
      setValidationIssues([]);
      setEditing(false);
      setStorageError(null);
      toast({ title: "Original CV restored", description: "Saved edits for this version have been removed." });
    } catch (error) {
      toast({
        title: "CV could not be reset",
        description: error instanceof Error ? error.message : "Check browser storage and try again.",
        variant: "destructive",
      });
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
      <div className="container max-w-3xl mx-auto">
        <div className="no-print">
          <Button variant="ghost" asChild className="mb-6"><Link to="/cv"><ArrowLeft className="mr-2 h-4 w-4" /> All versions</Link></Button>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div><h1 className="text-3xl font-semibold text-foreground">{version.title}</h1><p className="text-sm text-muted-foreground">{version.targetRoles}</p></div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handlePrint} disabled={editing}><Printer className="mr-2 h-4 w-4" />Download {documentLabels[tab]} as PDF</Button>
              <Button variant="outline" onClick={handleDocxDownload} disabled={isExporting || editing}>
                <FileDown className="mr-2 h-4 w-4" />{isExporting ? "Preparing…" : `Download ${documentLabels[tab]} as Word`}
              </Button>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Career document type">
            {documentTabs.map((documentTab) => (
              <Button key={documentTab} ref={(element) => { tabRefs.current[documentTab] = element; }} variant={tab === documentTab ? "default" : "outline"} id={`document-tab-${documentTab}`} role="tab" aria-selected={tab === documentTab} aria-controls={`document-panel-${documentTab}`} tabIndex={tab === documentTab ? 0 : -1} disabled={editing && documentTab === "letter"} onClick={() => setTab(documentTab)} onKeyDown={handleTabKeyDown}>{documentLabels[documentTab]}</Button>
            ))}
          </div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">{version.keywords.map((keyword) => <Badge key={keyword} variant="secondary" className="text-xs">{keyword}</Badge>)}</div>
            {tab !== "letter" && (
              <div className="flex gap-2">
                {!editing && <Button variant="outline" onClick={() => { setDraft(structuredClone(content)); setEditing(true); }}>Edit CV content</Button>}
                {!editing && tab !== "letter" && <Button variant="ghost" onClick={handleReset}>Reset to original</Button>}
              </div>
            )}
          </div>

          {storageError && (
            <p className="mb-4 rounded-md border border-destructive/50 p-3 text-sm text-destructive" role="alert">
              {storageError} The original content is shown; browser-local saving may be unavailable.
            </p>
          )}

          {editing && draft && (
            <>
              <CvContentEditor content={draft} versionTitle={`${version.title} ${tab === "resume" ? "Resume" : "CV"}`} onChange={(updated) => { setDraft(updated); setValidationIssues([]); }} />
              {validationIssues.length > 0 && (
                <div className="mb-4 rounded-md border border-destructive/50 p-4 text-sm text-destructive" role="alert" aria-live="assertive">
                  <p className="font-semibold">Resolve these issues before saving:</p>
                  <ul className="mt-2 list-disc pl-5">{validationIssues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
                </div>
              )}
              <div className="no-print mb-8 flex flex-wrap gap-2">
                <Button onClick={handleSave}>Save changes</Button>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button variant="ghost" onClick={handleReset}>Reset to original</Button>
              </div>
            </>
          )}

          {tab === "letter" && (
            <div className="mb-8 rounded-lg border border-border bg-muted/20 p-4 no-print">
              <h2 className="text-sm font-semibold text-foreground">Tailor this cover letter</h2>
              <p className="mt-1 text-sm text-muted-foreground">Enter the employer and job title — the letter below rewrites itself instantly.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div><label className="mb-1 block text-sm text-foreground" htmlFor="employer-name">Employer name</label><Input id="employer-name" value={employerName} onChange={(event) => setEmployerName(event.target.value)} placeholder="Company or organisation" /></div>
                <div><label className="mb-1 block text-sm text-foreground" htmlFor="job-title">Job title</label><Input id="job-title" value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} placeholder={version.title} /></div>
                <div><label className="mb-1 block text-sm text-foreground" htmlFor="recipient-name">Recipient name</label><Input id="recipient-name" value={recipientName} onChange={(event) => setRecipientName(event.target.value)} placeholder="Hiring Manager" /></div>
                <div><label className="mb-1 block text-sm text-foreground" htmlFor="job-reference">Job reference (optional)</label><Input id="job-reference" value={jobReference} onChange={(event) => setJobReference(event.target.value)} placeholder="e.g. REF/2026/014" /></div>
              </div>
              <div className="mt-3"><label className="mb-1 block text-sm text-foreground" htmlFor="company-address">Employer address</label><Textarea id="company-address" value={companyAddress} onChange={(event) => setCompanyAddress(event.target.value)} placeholder="Employer address" rows={3} /></div>
            </div>
          )}

          <Suspense fallback={null}>
            <AtsKeywordChecker
              version={activeVersion}
              content={previewContent}
              onApplyContent={(updatedContent) => {
                setDraft(updatedContent);
                setEditing(true);
                setValidationIssues([]);
                toast({
                  title: "Suggestions applied to an unsaved draft",
                  description: "Review the updated document, then save your changes to keep them.",
                });
              }}
            />
          </Suspense>
        </div>
        <Suspense fallback={<DocumentFallback />}>
          <div id={`document-panel-${tab}`} role="tabpanel" aria-labelledby={`document-tab-${tab}`} tabIndex={-1}>
            {tab === "cv" ? (
              <>
                <div className={editing ? "cv-draft-preview" : undefined}>
                  <CvDocument version={activeVersion} content={previewContent} documentType="cv" />
                </div>
                {editing && <div className="cv-saved-print-preview"><CvDocument version={version} content={content} documentType="cv" /></div>}
              </>
            ) : tab === "resume" ? (
              <>
                <div className={editing ? "cv-draft-preview" : undefined}>
                  <ResumeDocument version={activeVersion} content={previewContent} />
                </div>
                {editing && <div className="cv-saved-print-preview"><ResumeDocument version={version} content={content} /></div>}
              </>
            ) : <CoverLetterDocument version={version} {...letterInputs} />}
          </div>
        </Suspense>
      </div>
    </main>
  );
};

export default CvVersionPage;
