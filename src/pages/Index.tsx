import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LazySection from "@/components/LazySection";
import PresentationThemeToggle from "@/components/PresentationThemeToggle";
import { Button } from "@/components/ui/button";
import type { DocumentSettings } from "@/lib/documentSettings";
import { LockKeyhole } from "lucide-react";
import { usePresentationTheme } from "@/components/PresentationThemeProvider";

const RecruiterSnapshot = lazy(() => import("@/components/RecruiterSnapshot"));
const Experience = lazy(() => import("@/components/Experience"));
const Leadership = lazy(() => import("@/components/Leadership"));
const WorkshopsAndSeminars = lazy(() => import("@/components/WorkshopsAndSeminars"));
const Skills = lazy(() => import("@/components/Skills"));
const Education = lazy(() => import("@/components/Education"));
const Interests = lazy(() => import("@/components/Interests"));
const Contact = lazy(() => import("@/components/Contact"));
const DocumentSettingsPanel = lazy(() => import("@/components/DocumentSettingsPanel"));
const ProfessionalNetworkLayout = lazy(() => import("@/components/ProfessionalNetworkLayout"));

const SectionFallback = () => <div className="min-h-24" aria-hidden="true" />;

const Index = () => {
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings | null>(null);
  const [showOwnerControls] = useState(
    () => new URLSearchParams(window.location.search).get("mode") === "owner",
  );
  const { theme } = usePresentationTheme();

  const ownerControls = showOwnerControls ? (
    <section className="px-6 py-10 bg-background">
      <div className="container max-w-5xl mx-auto">
        <div className="mb-6 rounded-lg border border-border bg-card p-4 shadow-soft">
          <PresentationThemeToggle />
          <p className="mt-2 text-xs text-muted-foreground">
            Choose the public presentation style. Recruiter documents remain ATS-first in every mode.
          </p>
        </div>
        <Suspense fallback={<SectionFallback />}>
          <DocumentSettingsPanel onChange={setDocumentSettings} />
        </Suspense>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-dashed border-border bg-muted/20 p-4">
          <div className="text-sm text-muted-foreground">
            {documentSettings?.resumeMode
              ? "Resume-style layout is enabled for your document output."
              : "CV-style layout is enabled for your document output."}
          </div>
          <Button variant="outline" asChild>
            <Link to="/owner/referees">
              <LockKeyhole className="mr-2 h-4 w-4" /> Private referee vault
            </Link>
          </Button>
        </div>
      </div>
    </section>
  ) : null;

  if (theme === "professional") {
    return (
      <Suspense fallback={<SectionFallback />}>
        <ProfessionalNetworkLayout ownerControls={ownerControls} />
      </Suspense>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Suspense fallback={<SectionFallback />}>
        <RecruiterSnapshot />
      </Suspense>
      {ownerControls}
      <LazySection navId="experience"><Suspense fallback={<SectionFallback />}><Experience /></Suspense></LazySection>
      <LazySection navId="leadership"><Suspense fallback={<SectionFallback />}><Leadership /></Suspense></LazySection>
      <LazySection navId="workshops"><Suspense fallback={<SectionFallback />}><WorkshopsAndSeminars /></Suspense></LazySection>
      <LazySection navId="skills"><Suspense fallback={<SectionFallback />}><Skills /></Suspense></LazySection>
      <LazySection navId="education"><Suspense fallback={<SectionFallback />}><Education /></Suspense></LazySection>
      <LazySection navId="interests"><Suspense fallback={<SectionFallback />}><Interests /></Suspense></LazySection>
      <LazySection navId="contact"><Suspense fallback={<SectionFallback />}><Contact /></Suspense></LazySection>
      <footer className="bg-primary text-primary-foreground py-8 px-6 text-center">
        <p className="text-sm">© {new Date().getFullYear()} Kingsley Junior Norku. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default Index;
