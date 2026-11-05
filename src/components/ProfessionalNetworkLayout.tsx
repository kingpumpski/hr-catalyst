import { lazy, Suspense, type ReactNode } from "react";
import { ArrowRight, BriefcaseBusiness, FileText, Globe2, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SocialLinks from "@/components/SocialLinks";
import LazySection from "@/components/LazySection";

const RecruiterSnapshot = lazy(() => import("@/components/RecruiterSnapshot"));
const ProfessionalProfileSections = lazy(() => import("@/components/ProfessionalProfileSections"));
const Experience = lazy(() => import("@/components/Experience"));
const Education = lazy(() => import("@/components/Education"));
const Leadership = lazy(() => import("@/components/Leadership"));
const WorkshopsAndSeminars = lazy(() => import("@/components/WorkshopsAndSeminars"));
const Skills = lazy(() => import("@/components/Skills"));
const Interests = lazy(() => import("@/components/Interests"));
const Contact = lazy(() => import("@/components/Contact"));

const SectionFallback = () => <div className="min-h-[220px]" aria-hidden="true" />;
const Deferred = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<SectionFallback />}>{children}</Suspense>
);

const ProfessionalNetworkLayout = () => (
  <main className="professional-network min-h-screen">
    <Navbar />
    <section id="hero" className="professional-profile-shell px-6 pb-10 pt-28 md:pt-32">
      <div className="container mx-auto max-w-6xl">
        <div className="professional-profile-card overflow-hidden rounded-3xl border p-6 shadow-medium md:p-8">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="professional-avatar flex h-24 w-24 items-center justify-center rounded-2xl text-2xl font-bold shadow-soft md:h-28 md:w-28">KJN</div>
            <div>
              <div className="professional-status mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"><Globe2 className="h-4 w-4" aria-hidden="true" /> Open to remote & international opportunities</div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Kingsley Junior Norku — Operations, Claims &amp; Accounting Professional</h1>
              <p className="mt-2 text-lg font-semibold md:text-xl">BSc. Accounting · Claims, Billing &amp; Healthcare Operations</p>
              <p className="mt-3 max-w-3xl text-sm leading-6 md:text-base">BSc. Accounting · 6+ years across claims management, healthcare operations, accounting, billing, reconciliation, administration, IT support and logistics.</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"><span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" aria-hidden="true" />Accra, Ghana</span><span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4" aria-hidden="true" />6+ years experience</span></div>
            </div>
            <div className="flex flex-wrap gap-3 lg:max-w-[210px] lg:justify-end"><Link to="/cv" className="professional-primary-action inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-smooth hover:-translate-y-0.5"><FileText className="mr-2 h-4 w-4" /> Recruiter documents <ArrowRight className="ml-2 h-4 w-4" /></Link><a href="#contact" className="professional-secondary-action inline-flex items-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition-smooth hover:-translate-y-0.5"><Mail className="mr-2 h-4 w-4" /> Contact</a></div>
          </div>
          <div className="mt-7 border-t pt-5"><SocialLinks variant="profile" /></div>
        </div>
      </div>
    </section>

    <LazySection navId="recruiter-snapshot"><Deferred><RecruiterSnapshot /></Deferred></LazySection>
    <LazySection navId="about"><Deferred><ProfessionalProfileSections /></Deferred></LazySection>

    <section className="container mx-auto grid max-w-6xl gap-8 px-6 pb-20 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,.8fr)]">
      <div className="space-y-8">
        <LazySection navId="experience"><Deferred><Experience /></Deferred></LazySection>
        <LazySection navId="leadership"><Deferred><Leadership /></Deferred></LazySection>
        <LazySection navId="workshops"><Deferred><WorkshopsAndSeminars /></Deferred></LazySection>
      </div>
      <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
        <LazySection navId="skills"><Deferred><div className="professional-side-card rounded-2xl border p-5 shadow-soft"><Skills /></div></Deferred></LazySection>
        <LazySection navId="education"><Deferred><div className="professional-side-card rounded-2xl border p-5 shadow-soft"><Education /></div></Deferred></LazySection>
        <LazySection navId="interests"><Deferred><div className="professional-side-card rounded-2xl border p-5 shadow-soft"><Interests /></div></Deferred></LazySection>
      </aside>
    </section>
    <section className="professional-cta border-y px-6 py-10"><div className="container mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 md:flex-row md:items-center"><div><p className="text-xs font-bold uppercase tracking-[.18em]">Recruiter connection</p><h2 className="mt-2 text-2xl font-bold">Let's discuss the right opportunity.</h2></div><Link to="/cv" className="professional-primary-action inline-flex items-center rounded-xl px-5 py-3 text-sm font-semibold">View CV & recruiter documents <ArrowRight className="ml-2 h-4 w-4" /></Link></div></section>
    <LazySection navId="contact"><Deferred><Contact /></Deferred></LazySection>
    <footer className="professional-footer px-6 py-8 text-center"><p className="text-sm">© {new Date().getFullYear()} Kingsley Junior Norku. All rights reserved.</p></footer>
  </main>
);

export default ProfessionalNetworkLayout;
