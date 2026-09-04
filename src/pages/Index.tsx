import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LazySection from "@/components/LazySection";
import { usePresentationTheme } from "@/components/PresentationThemeProvider";

const RecruiterSnapshot = lazy(() => import("@/components/RecruiterSnapshot"));
const Experience = lazy(() => import("@/components/Experience"));
const Leadership = lazy(() => import("@/components/Leadership"));
const WorkshopsAndSeminars = lazy(() => import("@/components/WorkshopsAndSeminars"));
const Skills = lazy(() => import("@/components/Skills"));
const Education = lazy(() => import("@/components/Education"));
const Interests = lazy(() => import("@/components/Interests"));
const Contact = lazy(() => import("@/components/Contact"));
const ProfessionalNetworkLayout = lazy(() => import("@/components/ProfessionalNetworkLayout"));

const SectionFallback = () => <div className="min-h-24" aria-hidden="true" />;

const Index = () => {
  const { theme } = usePresentationTheme();

  if (theme === "professional") {
    return (
      <Suspense fallback={<SectionFallback />}>
        <ProfessionalNetworkLayout />
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
