import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Printer } from "lucide-react";
import { getCvVersionFromCatalog } from "@/data/cvCatalog";
import NotFound from "./NotFound";

const CvDocument = lazy(() => import("@/components/CvDocument"));
const ResumeDocument = lazy(() => import("@/components/ResumeDocument"));
const CoverLetterDocument = lazy(() => import("@/components/CoverLetterDocument"));

type DocumentTab = "cv" | "resume" | "letter";
const documentTabs: DocumentTab[] = ["cv", "resume", "letter"];
const documentLabels: Record<DocumentTab, string> = { cv: "CV", resume: "Resume", letter: "Cover Letter" };
const DocumentFallback = () => <div className="min-h-[60vh] rounded-lg border border-border bg-background" aria-hidden="true" />;

const CvVersionPage = () => {
  const { slug } = useParams();
  const version = getCvVersionFromCatalog(slug);
  const [tab, setTab] = useState<DocumentTab>("cv");
  const [recipientName, setRecipientName] = useState("Hiring Manager");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const tabRefs = useRef<Partial<Record<DocumentTab, HTMLButtonElement | null>>>({});
  const originalTitleRef = useRef(document.title);
  const restoreTitleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!version) return;
    const handleAfterPrint = () => {
      if (restoreTitleTimeoutRef.current !== null) {
        window.clearTimeout(restoreTitleTimeoutRef.current);
        restoreTitleTimeoutRef.current = null;
      }
      document.title = originalTitleRef.current;
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
      if (restoreTitleTimeoutRef.current !== null) window.clearTimeout(restoreTitleTimeoutRef.current);
    };
  }, [version]);

  if (!version) return <NotFound />;

  const handlePrint = () => {
    originalTitleRef.current = document.title;
    document.title = `Kingsley Junior Norku - ${version.title} - ${documentLabels[tab]}`;
    window.print();
    restoreTitleTimeoutRef.current = window.setTimeout(() => {
      document.title = originalTitleRef.current;
      restoreTitleTimeoutRef.current = null;
    }, 2000);
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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div><h1 className="text-3xl font-semibold text-foreground">{version.title}</h1><p className="text-sm text-muted-foreground">{version.targetRoles}</p></div>
            <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Download / Save {documentLabels[tab]} as PDF</Button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Career document type">
            {documentTabs.map((documentTab) => (
              <Button key={documentTab} ref={(element) => { tabRefs.current[documentTab] = element; }} variant={tab === documentTab ? "default" : "outline"} id={`document-tab-${documentTab}`} role="tab" aria-selected={tab === documentTab} aria-controls={`document-panel-${documentTab}`} tabIndex={tab === documentTab ? 0 : -1} onClick={() => setTab(documentTab)} onKeyDown={handleTabKeyDown}>{documentLabels[documentTab]}</Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-8">{version.keywords.map((k) => <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>)}</div>
          {tab === "letter" && (
            <div className="mb-8 rounded-lg border border-border bg-muted/20 p-4 no-print">
              <h2 className="text-sm font-semibold text-foreground">Quick cover letter update</h2>
              <p className="text-sm text-muted-foreground mt-1">Update the recipient and organisation details before printing or downloading.</p>
              <div className="grid md:grid-cols-2 gap-3 mt-4">
                <div><label className="text-sm text-foreground mb-1 block" htmlFor="recipient-name">Recipient name</label><Input id="recipient-name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Hiring Manager" /></div>
                <div><label className="text-sm text-foreground mb-1 block" htmlFor="company-name">Company name</label><Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name" /></div>
              </div>
              <div className="mt-3"><label className="text-sm text-foreground mb-1 block" htmlFor="company-address">Company address</label><Textarea id="company-address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="Company address" rows={3} /></div>
            </div>
          )}
        </div>
        <Suspense fallback={<DocumentFallback />}>
          <div id={`document-panel-${tab}`} role="tabpanel" aria-labelledby={`document-tab-${tab}`} tabIndex={-1}>
            {tab === "cv" ? <CvDocument version={version} /> : tab === "resume" ? <ResumeDocument version={version} /> : <CoverLetterDocument version={version} recipientName={recipientName} companyName={companyName || "[Company Name]"} companyAddress={companyAddress || "[Company Address]"} />}
          </div>
        </Suspense>
      </div>
    </main>
  );
};

export default CvVersionPage;
