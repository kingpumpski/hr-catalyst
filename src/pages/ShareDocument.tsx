import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Printer, Mail } from "lucide-react";
import { getCvVersionFromCatalog } from "@/data/cvCatalog";
import CvDocument from "@/components/CvDocument";
import ResumeDocument from "@/components/ResumeDocument";
import CoverLetterDocument from "@/components/CoverLetterDocument";
import { getSharePageTitle, isShareDocumentType, normalizeShareDocumentType } from "@/lib/shareLinks";
import NotFound from "./NotFound";

const ShareDocumentPage = () => {
  const { documentType, slug } = useParams<{ documentType?: string; slug?: string }>();
  const [recipientName, setRecipientName] = useState("Hiring Manager");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const originalTitleRef = useRef(document.title);
  const restoreTitleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (restoreTitleTimeoutRef.current !== null) {
        window.clearTimeout(restoreTitleTimeoutRef.current);
      }
    };
  }, []);

  if (!isShareDocumentType(documentType)) return <NotFound />;

  const resolvedType = normalizeShareDocumentType(documentType);
  const version = slug ? getCvVersionFromCatalog(slug) : null;

  if (!version) return <NotFound />;

  const handlePrint = () => {
    originalTitleRef.current = document.title;
    document.title = `Kingsley Junior Norku - ${version.title} - ${getSharePageTitle(resolvedType)}`;
    window.print();
    restoreTitleTimeoutRef.current = window.setTimeout(() => {
      document.title = originalTitleRef.current;
      restoreTitleTimeoutRef.current = null;
    }, 2000);
  };

  return (
    <main className="cv-document-page min-h-screen bg-background px-6 py-8">
      <div className="container mx-auto max-w-4xl">
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{getSharePageTitle(resolvedType)}</p>
            <h1 className="text-3xl font-semibold text-foreground">{version.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Download / Print</Button>
            <Button variant="outline" asChild><a href="mailto:kingpumpski@gmail.com?subject=Recruiter%20document%20request"><Mail className="mr-2 h-4 w-4" />Contact me</a></Button>
          </div>
        </div>

        <div className="no-print mb-6 rounded-lg border border-border bg-muted/20 p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant={resolvedType === "cv" ? "default" : "secondary"}>CV</Badge>
            <Badge variant={resolvedType === "resume" ? "default" : "secondary"}>Resume</Badge>
            <Badge variant={resolvedType === "letter" ? "default" : "secondary"}>Cover letter</Badge>
          </div>
          <p className="text-sm text-muted-foreground">This page is intentionally restricted to the selected document so recruiters can review it without seeing unrelated portfolio content.</p>
        </div>

        {resolvedType === "letter" && (
          <div className="no-print mb-6 rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Personalise the cover letter</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="share-recipient-name" className="mb-1 block text-sm text-foreground">Recipient name</label>
                <Input id="share-recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="share-company-name" className="mb-1 block text-sm text-foreground">Company name</label>
                <Input id="share-company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
            </div>
            <div className="mt-3">
              <label htmlFor="share-company-address" className="mb-1 block text-sm text-foreground">Company address</label>
              <Textarea id="share-company-address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} rows={3} />
            </div>
          </div>
        )}

        <div className="no-print mb-6 flex items-center gap-2">
          <Button variant="ghost" asChild><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Back to main profile</Link></Button>
        </div>

        {resolvedType === "resume" ? <ResumeDocument version={version} /> : resolvedType === "letter" ? <CoverLetterDocument version={version} recipientName={recipientName} companyName={companyName || "[Company Name]"} companyAddress={companyAddress || "[Company Address]"} /> : <CvDocument version={version} />}
      </div>
    </main>
  );
};

export default ShareDocumentPage;
