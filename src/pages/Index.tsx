import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import RecruiterSnapshot from "@/components/RecruiterSnapshot";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Leadership from "@/components/Leadership";
import WorkshopsAndSeminars from "@/components/WorkshopsAndSeminars";
import LazySection from "@/components/LazySection";
import Skills from "@/components/Skills";
import Interests from "@/components/Interests";
import Contact from "@/components/Contact";
import DocumentSettingsPanel from "@/components/DocumentSettingsPanel";
import PresentationThemeToggle from "@/components/PresentationThemeToggle";
import ProfessionalNetworkLayout from "@/components/ProfessionalNetworkLayout";
import { Button } from "@/components/ui/button";
import type { DocumentSettings } from "@/lib/documentSettings";
import { LockKeyhole } from "lucide-react";
import { usePresentationTheme } from "@/components/PresentationThemeProvider";

const Index = () => {
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings | null>(null);
  const [showOwnerControls] = useState(
    () => new URLSearchParams(window.location.search).get("mode") === "owner",
  );
  const { theme } = usePresentationTheme();

  if (theme === "professional") {
    return <ProfessionalNetworkLayout />;
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <RecruiterSnapshot />
      {showOwnerControls && (
        <section className="px-6 py-12 bg-background">
          <div className="container max-w-5xl mx-auto">
            <div className="mb-6 rounded-lg border border-border bg-card p-4 shadow-soft">
              <PresentationThemeToggle />
              <p className="mt-2 text-xs text-muted-foreground">
                Choose the public presentation style. Recruiter documents remain ATS-first in every mode.
              </p>
            </div>
            <DocumentSettingsPanel onChange={setDocumentSettings} />
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
      )}
      <Experience />
      <Leadership />
      <WorkshopsAndSeminars />
      <LazySection navId="skills"><Skills /></LazySection>
      <LazySection navId="education"><Education /></LazySection>
      <LazySection navId="interests"><Interests /></LazySection>
      <LazySection navId="contact"><Contact /></LazySection>
      <footer className="bg-primary text-primary-foreground py-8 px-6 text-center">
        <p className="text-sm">© {new Date().getFullYear()} Kingsley Junior Norku. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default Index;
