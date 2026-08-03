import { lazy, Suspense, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Leadership from "@/components/Leadership";
import WorkshopsAndSeminars from "@/components/WorkshopsAndSeminars";
import Skills from "@/components/Skills";
import Interests from "@/components/Interests";
import Contact from "@/components/Contact";
import LazySection from "@/components/LazySection";
import DocumentSettingsPanel from "@/components/DocumentSettingsPanel";
import type { DocumentSettings } from "@/lib/documentSettings";

const LazySkills = lazy(() => import("@/components/Skills"));
const LazyEducation = lazy(() => import("@/components/Education"));
const LazyInterests = lazy(() => import("@/components/Interests"));
const LazyContact = lazy(() => import("@/components/Contact"));

const Index = () => {
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings | null>(null);
  const [showOwnerControls, setShowOwnerControls] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setShowOwnerControls(params.get("mode") === "owner");
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      {showOwnerControls && (
        <section className="px-6 py-12 bg-background">
          <div className="container max-w-5xl mx-auto">
            <DocumentSettingsPanel onChange={setDocumentSettings} />
            <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
              {documentSettings?.resumeMode
                ? "Resume-style layout is enabled for your document output."
                : "CV-style layout is enabled for your document output."}
            </div>
          </div>
        </section>
      )}
      <Experience />
      <Leadership />
      <WorkshopsAndSeminars />

      <LazySection>
        <Suspense fallback={<div className="min-h-[260px]" /> }>
          <LazySkills />
        </Suspense>
      </LazySection>

      <LazySection>
        <Suspense fallback={<div className="min-h-[260px]" /> }>
          <LazyEducation />
        </Suspense>
      </LazySection>

      <LazySection>
        <Suspense fallback={<div className="min-h-[260px]" /> }>
          <LazyInterests />
        </Suspense>
      </LazySection>

      <LazySection>
        <Suspense fallback={<div className="min-h-[260px]" /> }>
          <LazyContact />
        </Suspense>
      </LazySection>

      <footer className="bg-primary text-primary-foreground py-8 px-6 text-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Kingsley Junior Norku. All rights reserved.
        </p>
      </footer>
    </main>
  );
};

export default Index;
