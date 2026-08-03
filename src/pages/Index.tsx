import { lazy, Suspense } from "react";
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

const LazySkills = lazy(() => import("@/components/Skills"));
const LazyEducation = lazy(() => import("@/components/Education"));
const LazyInterests = lazy(() => import("@/components/Interests"));
const LazyContact = lazy(() => import("@/components/Contact"));

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
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
