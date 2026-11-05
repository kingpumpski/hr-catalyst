import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Printer, Mail } from "lucide-react";
import { getCvVersionFromCatalog } from "@/data/cvCatalog";
import type { CvVersion } from "@/data/cvVersions";
import { createOriginalCvContent, loadCvDocumentContent, type CvDocumentContent } from "@/data/cvDocumentContent";
import { getEmailHref } from "@/lib/contactLinks";
import { getSharePageTitle, isShareDocumentType, normalizeShareDocumentType } from "@/lib/shareLinks";
import { getRecruiterDocumentFilename } from "@/lib/recruiterDocument";
import NotFound from "./NotFound";

const CvDocument = lazy(() => import("@/components/CvDocument"));
const ResumeDocument = lazy(() => import("@/components/ResumeDocument"));
const CoverLetterDocument = lazy(() => import("@/components/CoverLetterDocument"));

const ShareDocumentPage = () => {
  const { documentType, slug } = useParams<{ documentType?: string; slug?: string }>();
  const resolvedType = useMemo(() => normalizeShareDocumentType(documentType), [documentType]);
  const version = slug ? getCvVersionFromCatalog(slug) : null;
  const contactHref = getEmailHref("Recruiter document request");

  if (!isShareDocumentType(documentType) || !version) return <NotFound />;
  return <ShareDocumentWorkspace key={`${version.slug}-${resolvedType}`} version={version} resolvedType={resolvedType} contactHref={contactHref} />;
};

const ShareDocumentWorkspace = ({
  version,
  resolvedType,
  contactHref,
}: {
  version: CvVersion;
  resolvedType: ReturnType<typeof normalizeShareDocumentType>;
  contactHref: string;
}) => {
  const [recipientName, setRecipientName] = useState("Hiring Manager");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [contentState] = useState(() => {
    try {
      return { content: loadCvDocumentContent(version), error: null as string | null };
    } catch (error) {
      return {
        content: createOriginalCvContent(version),
        error: error instanceof Error ? error.message : "Saved CV edits could not be loaded.",
      };
    }
  });
  const content: CvDocumentContent = contentState.content;
  const handlePrint = () => {
    if (resolvedType === "cv" || resolvedType === "resume") {
      document.title = getRecruiterDocumentFilename(content.name, resolvedType);
    }
    window.print();
  };

  return (
    <main className="cv-document-page min-h-screen bg-background py-8 px-6">
      <div className="container max-w-4xl mx-auto">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{getSharePageTitle(resolvedType)}</p>
            <h1 className="text-3xl font-semibold text-foreground">{version.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Download / Print</Button>
            <Button variant="outline" asChild><a href={contactHref}><Mail className="mr-2 h-4 w-4" />Contact me</a></Button>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-border bg-muted/20 p-4 no-print">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant={resolvedType === "cv" ? "default" : "secondary"}>CV</Badge>
            <Badge variant={resolvedType === "resume" ? "default" : "secondary"}>Resume</Badge>
            <Badge variant={resolvedType === "letter" ? "default" : "secondary"}>Cover letter</Badge>
          </div>
          <p className="text-sm text-muted-foreground">This page is intentionally restricted to the selected document so recruiters can review it without seeing unrelated portfolio content.</p>
          {contentState.error && resolvedType !== "letter" && <p className="mt-2 text-sm text-destructive" role="alert">{contentState.error} Showing the original CV content.</p>}
        </div>

        {resolvedType === "letter" && (
          <div className="mb-6 rounded-lg border border-border bg-card p-4 no-print">
            <h2 className="text-sm font-semibold text-foreground">Personalise the cover letter</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div><label htmlFor="share-recipient-name" className="mb-1 block text-sm text-foreground">Recipient name</label><Input id="share-recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} /></div>
              <div><label htmlFor="share-company-name" className="mb-1 block text-sm text-foreground">Company name</label><Input id="share-company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
            </div>
            <div className="mt-3"><label htmlFor="share-company-address" className="mb-1 block text-sm text-foreground">Company address</label><Textarea id="share-company-address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} rows={3} /></div>
          </div>
        )}

        <div className="mb-6 flex items-center gap-2 no-print"><Button variant="ghost" asChild><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to main profile</Link></Button></div>

        <Suspense fallback={<div className="cv-doc mx-auto min-h-[12rem] animate-pulse rounded-lg bg-muted" aria-label="Loading document" />}>
          {resolvedType === "resume" ? <ResumeDocument version={version} content={content} /> : resolvedType === "letter" ? <CoverLetterDocument version={version} recipientName={recipientName} companyName={companyName || "[Company Name]"} companyAddress={companyAddress || "[Company Address]"} /> : <CvDocument version={version} content={content} />}
        </Suspense>
      </div>
    </main>
  );
};

export default ShareDocumentPage;
