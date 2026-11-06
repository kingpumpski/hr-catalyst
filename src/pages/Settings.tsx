import { ArrowLeft, FileText, LockKeyhole, Palette, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DocumentSettingsPanel from "@/components/DocumentSettingsPanel";
import PresentationThemeToggle from "@/components/PresentationThemeToggle";
import SocialProfileSettings from "@/components/SocialProfileSettings";

const Settings = () => {
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b border-border bg-card/95 backdrop-blur-md"><div className="container mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Authenticated project owner</p><h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Settings</h1></div><Button variant="outline" asChild><Link to="/"><ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />Back to profile</Link></Button></div></header>
    <div className="container mx-auto max-w-6xl space-y-8 px-6 py-8 md:py-10">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8"><div className="flex items-start gap-4"><div className="rounded-xl bg-muted p-3"><Palette className="h-5 w-5" aria-hidden="true" /></div><div><h2 className="text-xl font-semibold">Appearance & presentation</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Choose how the public career profile is presented. The selected presentation is remembered in this browser.</p></div></div><div className="mt-6 rounded-xl border border-border bg-background p-4"><PresentationThemeToggle /></div></section>
      <section><div className="mb-4 flex items-start gap-4"><div className="rounded-xl bg-muted p-3"><FileText className="h-5 w-5" aria-hidden="true" /></div><div><h2 className="text-xl font-semibold">Document settings</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Choose the application market and control the content and presentation rules used by downloadable career documents.</p></div></div><DocumentSettingsPanel /></section>
      <section><div className="mb-4 flex items-start gap-4"><div className="rounded-xl bg-muted p-3"><Share2 className="h-5 w-5" aria-hidden="true" /></div><div><h2 className="text-xl font-semibold">Professional profiles</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Manage confirmed social profiles and their public visibility.</p></div></div><SocialProfileSettings /></section>
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft md:p-8"><div className="flex items-start gap-4"><div className="rounded-xl bg-muted p-3"><LockKeyhole className="h-5 w-5" aria-hidden="true" /></div><div className="flex-1"><h2 className="text-xl font-semibold">Privacy & references</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Keep referee information outside the public CV and manage it in the private referee vault.</p><Link to="/owner/referees" className="mt-4 inline-flex items-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-smooth hover:bg-muted">Open private referee vault</Link></div></div></section>
      <section className="rounded-2xl border border-dashed border-border bg-muted/20 p-6"><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Settings roadmap</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Application tracking, profile visibility, availability details, SEO metadata and download preferences can be added here without crowding the public recruiter experience.</p></section>
    </div>
  </main>;
};

export default Settings;
