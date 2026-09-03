import { AtSign, ExternalLink, Facebook, Github, Instagram, Linkedin, Youtube } from "lucide-react";
import { useMemo } from "react";
import { loadSocialSettings } from "@/lib/socialSettings";

type SocialLinksProps = { variant?: "default" | "profile" };

const iconMap = { LinkedIn: Linkedin, GitHub: Github, X: AtSign, Facebook, Instagram, YouTube: Youtube };

const SocialLinks = ({ variant = "default" }: SocialLinksProps) => {
  const links = useMemo(() => loadSocialSettings(), []);
  const activeLinks = useMemo(
    () => links.filter((link) => link.enabled && link.url.trim()),
    [links],
  );

  if (!activeLinks.length) return null;

  if (variant === "profile") {
    return (
      <section aria-labelledby="professional-presence-heading">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Professional presence</p>
            <h2 id="professional-presence-heading" className="mt-1 text-base font-semibold">Connect professionally</h2>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {activeLinks.map((link) => {
            const Icon = iconMap[link.label as keyof typeof iconMap] ?? AtSign;
            return (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left transition-smooth hover:-translate-y-0.5 hover:border-primary hover:shadow-soft" aria-label={`Open ${link.label} profile${link.handle ? ` ${link.handle}` : ""}`}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{link.label}</span>
                  {link.handle && <span className="block truncate text-xs text-muted-foreground">{link.handle}</span>}
                </span>
              </a>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label="Social media profiles">
      {activeLinks.map((link) => {
        const Icon = iconMap[link.label as keyof typeof iconMap] ?? AtSign;
        return (
          <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground transition-smooth hover:-translate-y-0.5 hover:border-primary hover:text-primary" aria-label={`Open ${link.label} profile`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{link.label}</span>
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
