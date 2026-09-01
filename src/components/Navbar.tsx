import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PresentationThemeToggle from "@/components/PresentationThemeToggle";

const sections = [
  { id: "experience", label: "Experience" },
  { id: "leadership", label: "Leadership" },
  { id: "workshops", label: "Workshops" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "interests", label: "Interests" },
  { id: "contact", label: "Contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    const target = document.getElementById(id);
    if (!target) return;
    const headerOffset = 84;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: elementPosition - headerOffset, behavior: "smooth" });
  };

  const linkClass = scrolled
    ? "text-muted-foreground hover:text-foreground"
    : "text-primary-foreground/90";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${scrolled ? "bg-background/90 backdrop-blur-md shadow-soft" : "bg-transparent"}`}>
      <nav className="container max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-4">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={`font-semibold tracking-tight transition-smooth ${scrolled ? "text-foreground" : "text-primary-foreground"}`}>
          Kingsley J. Norku
        </button>

        <div className="hidden lg:flex items-center gap-1">
          {sections.map((s) => (
            <button key={s.id} onClick={() => go(s.id)} className={`px-3 py-2 text-sm rounded-md transition-smooth hover:bg-foreground/10 ${linkClass}`}>
              {s.label}
            </button>
          ))}
          <Link to="/cv" className={`px-3 py-2 text-sm rounded-md transition-smooth hover:bg-foreground/10 ${linkClass}`}>Recruiter docs</Link>
          <PresentationThemeToggle />
        </div>

        <div className="hidden md:flex lg:hidden items-center gap-2">
          <PresentationThemeToggle />
          <Link to="/cv" className={`px-3 py-2 text-sm rounded-md ${linkClass}`}>CV</Link>
        </div>

        <Button variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} className={`md:hidden ${scrolled ? "text-foreground" : "text-primary-foreground hover:bg-white/20"}`} onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border px-6 py-3 space-y-2">
          {sections.map((s) => (
            <button key={s.id} onClick={() => go(s.id)} className="block w-full text-left px-2 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-smooth">{s.label}</button>
          ))}
          <Link to="/cv" onClick={() => setOpen(false)} className="block w-full text-left px-2 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-smooth">Recruiter documents</Link>
          <div className="border-t border-border pt-3"><PresentationThemeToggle /></div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
