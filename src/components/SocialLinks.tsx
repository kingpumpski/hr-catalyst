import { Github, Instagram, Linkedin, Facebook, Youtube, AtSign } from "lucide-react";
import { socialLinks } from "@/data/siteConfig";

const iconMap = {
  LinkedIn: Linkedin,
  GitHub: Github,
  X: AtSign,
  Facebook,
  Instagram,
  YouTube: Youtube,
};

const SocialLinks = () => {
  const activeLinks = socialLinks.filter((link) => link.url.trim());

  if (!activeLinks.length) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label="Social media profiles">
      {activeLinks.map((link) => {
        const Icon = iconMap[link.label as keyof typeof iconMap] ?? AtSign;
        return (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm text-foreground transition-smooth hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            aria-label={`Open ${link.label} profile`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{link.label}</span>
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
