import { Award, BookOpen, CheckCircle2, FileText, Languages, Lightbulb, MessageSquareQuote, ShieldCheck, Target } from "lucide-react";

const evidence = [
  {
    title: "Claims & healthcare operations",
    description: "Claims administration, case follow-up, billing coordination, records management and provider-facing operations.",
    icon: ShieldCheck,
  },
  {
    title: "Accounting & reconciliation",
    description: "Accounting administration, invoicing, reconciliation, financial records and data validation workflows.",
    icon: FileText,
  },
  {
    title: "Digital operations & IT support",
    description: "Practical IT support, digital workflows, documentation and technology-enabled process improvement.",
    icon: Lightbulb,
  },
];

const ProfessionalProfileSections = () => (
  <section className="container mx-auto max-w-6xl px-6 pb-8">
    <div className="space-y-8">
      <article id="about" data-nav-section="about" className="professional-side-card scroll-mt-24 rounded-2xl border p-6 shadow-soft md:p-8">
        <div className="mb-5 flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-bold">About</h2>
        </div>
        <p className="max-w-4xl text-sm leading-7 text-muted-foreground md:text-base">
          Operations, claims and accounting professional with 6+ years of practical experience across healthcare administration, claims management, billing, accounting support, reconciliation, records management and IT support. Brings a process-focused approach to accurate documentation, stakeholder coordination, case follow-up and dependable service delivery, with openness to remote and international opportunities.
        </p>
      </article>

      <article id="featured" data-nav-section="featured" className="scroll-mt-24">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-muted-foreground">Featured</p>
            <h2 className="mt-1 text-2xl font-bold">Professional strengths</h2>
          </div>
          <Award className="hidden h-6 w-6 text-primary sm:block" aria-hidden="true" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {evidence.map(({ title, description, icon: Icon }) => (
            <article key={title} className="professional-side-card rounded-2xl border p-5 shadow-soft transition-smooth hover:-translate-y-0.5">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
      </article>

      <div className="grid gap-8 lg:grid-cols-2">
        <article id="credentials" data-nav-section="credentials" className="professional-side-card scroll-mt-24 rounded-2xl border p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-bold">Credentials & learning</h2>
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><div><p className="font-semibold">BSc. Accounting</p><p className="text-sm text-muted-foreground">University College of Management Studies</p></div></div>
            <div className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><div><p className="font-semibold">Professional workshops & seminars</p><p className="text-sm text-muted-foreground">See the professional development section for documented participation.</p></div></div>
          </div>
        </article>

        <article id="languages" data-nav-section="languages" className="professional-side-card scroll-mt-24 rounded-2xl border p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <Languages className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-bold">Languages</h2>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {['English', 'Fante', 'Twi'].map((language) => <span key={language} className="rounded-full border px-3 py-1.5 text-sm font-medium">{language}</span>)}
          </div>
        </article>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <article id="credibility" data-nav-section="credibility" className="professional-side-card scroll-mt-24 rounded-2xl border p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <MessageSquareQuote className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-bold">Professional credibility</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">Professional references can be provided to recruiters or employers upon request. Private referee details are intentionally excluded from the public profile.</p>
        </article>

        <article id="preferences" data-nav-section="preferences" className="professional-side-card scroll-mt-24 rounded-2xl border p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-bold">Career preferences</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {['Remote', 'International', 'Claims & Billing', 'Accounting', 'Finance Operations', 'Data & Records', 'Administration', 'Customer Operations'].map((item) => <span key={item} className="rounded-full border px-3 py-1.5 text-sm font-medium">{item}</span>)}
          </div>
        </article>
      </div>
    </div>
  </section>
);

export default ProfessionalProfileSections;
