import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, FileText, Globe2, Mail, ShieldCheck } from "lucide-react";

const Hero = () => {
  const scrollTo = (id: string) => {
    const target = document.getElementById(id) ?? document.querySelector<HTMLElement>(`[data-nav-section="${id}"]`);
    if (!target) return;
    const headerOffset = 84;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, elementPosition - headerOffset), behavior: "smooth" });
    window.history.replaceState(null, "", `/#${id}`);
  };

  return (
    <section id="hero" className="relative overflow-hidden px-6 pb-20 pt-28 md:pt-32">
      <div className="absolute inset-0 gradient-primary" />
      <div className="hero-glow absolute -right-24 top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="hero-glow absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
      <div className="container relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.2fr_.8fr]">
        <div className="hero-stagger animate-fade-in">
          <div className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-sm"><Globe2 className="h-4 w-4" aria-hidden="true" />Open to remote & international opportunities</div>
          <h1 className="max-w-4xl text-white leading-tight">Operations, Claims & Accounting Professional</h1>
          <p className="mt-5 text-xl font-medium text-white md:text-2xl">Kingsley Junior Norku, BSc. Accounting</p>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/85 md:text-lg">6+ years of progressive experience across claims management, healthcare operations, accounting, billing, reconciliation, administration, IT support and logistics. Bringing accuracy, accountability and practical problem-solving to teams locally and remotely.</p>
          <div className="mt-7 flex flex-wrap gap-2">{["Claims & Billing", "Accounting & Reconciliation", "Data & Records", "Operations & Administration"].map((item) => <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white/90 backdrop-blur-sm transition-smooth hover:-translate-y-0.5 hover:bg-white/20">{item}</span>)}</div>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button size="lg" asChild className="bg-accent text-accent-foreground shadow-medium transition-smooth hover:bg-accent/90"><Link to="/cv"><FileText className="mr-2 h-5 w-5" />Explore recruiter documents<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" className="border-white/30 bg-white/10 text-white backdrop-blur-sm transition-smooth hover:bg-white/20" onClick={() => scrollTo("contact")}><Mail className="mr-2 h-5 w-5" />Contact me</Button>
          </div>
        </div>
        <div className="hero-profile-card relative hidden lg:block" aria-label="Professional profile highlights">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 shadow-medium backdrop-blur-md">
            <div className="mb-6 flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-xl font-bold text-primary shadow-soft">KJN</div><div><p className="font-semibold text-white">Recruiter-ready profile</p><p className="text-sm text-white/70">Accra, Ghana · Remote-ready</p></div></div>
            <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-black/10 p-4 transition-smooth hover:-translate-y-1"><BriefcaseBusiness className="mb-3 h-5 w-5 text-white" aria-hidden="true" /><p className="text-2xl font-bold text-white">6+</p><p className="text-sm text-white/70">Years of experience</p></div><div className="rounded-2xl border border-white/10 bg-black/10 p-4 transition-smooth hover:-translate-y-1"><ShieldCheck className="mb-3 h-5 w-5 text-white" aria-hidden="true" /><p className="text-2xl font-bold text-white">BSc</p><p className="text-sm text-white/70">Accounting</p></div></div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-black/10 p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Career focus</p><p className="mt-2 text-sm leading-6 text-white/85">Claims · Billing · Accounting · Invoicing · Data Operations · Customer Support · Administration · Logistics</p></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
