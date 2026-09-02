import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const [activeSection, setActiveSection] = useState<string>("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return;
    }

    const observed = sections
      .map(({ id }) => document.getElementById(id) ?? document.querySelector<HTMLElement>(`[data-nav-section="${id}"]`))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!observed.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target instanceof HTMLElement) {
          setActiveSection(visible[0].target.id || visible[0].target.dataset.navSection || "");
        }
      },
      { rootMargin: "-92px 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    observed.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;

    const id = decodeURIComponent(location.hash.slice(1));
    const timer = window.setTimeout(() => {
      const target = document.getElementById(id) ??
        document.querySelector<HTMLElement>(`[data-nav-section="${id}"]`);
      if (!target) return;

      const headerOffset = 84;
      const elementPosition = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, elementPosition - headerOffset), behavior: "smooth" });
      setActiveSection(id);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  const go = (id: string) => {
    setOpen(false);
    setActiveSection(id);

    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }

    const target = document.getElementById(id) ??
      document.querySelector<HTMLElement>(`[data-nav-section="${id}"]`);
    if (!target) return;

    const headerOffset = 84;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, elementPosition - headerOffset), behavior: "smooth" });

    if (window.history.replaceState) {
      window.history.replaceState(null, "", `/#${id}`);
    }
  };

  const goHome = () => {
    setOpen(false);
    setActiveSection("");
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate("/");
  };

  const linkClass = scrolled
    ? "text-muted-foreground hover:text-foreground"
    : "text-primary-foreground/90";

  const sectionButtonClass = (id: string) =>
    `px-3 py-2 text-sm rounded-md transition-smooth hover:bg-foreground/10 ${
      activeSection === id ? "bg-foreground/10 font-semibold text-foreground" : linkClass
    }`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${scrolled ? "bg-background/90 backdrop-blur-md shadow-soft" : "bg-transparent"}`}>
      <nav className="container max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-4" aria-label="Primary navigation">
        <button type="button" onClick={goHome} className={`font-semibold tracking-tight transition-smooth ${scrolled ? "text-foreground" : "text-primary-foreground"}`}>
          Kingsley J. Norku
        </button>

        <div className="hidden lg:flex items-center gap-1">
          {sections.map((s) => (
            <button type="button" key={s.id} onClick={() => go(s.id)} className={sectionButtonClass(s.id)} aria-current={activeSection === s.id ? "location" : undefined}>
              {s.label}
            </button>
          ))}
          <Link to="/cv" className={`px-3 py-2 text-sm rounded-md transition-smooth hover:bg-foreground/10 ${linkClass}`}>Recruiter docs</Link>
          <PresentationThemeToggle />
        </div>

        <div className="hidden md:flex lg:hidden items-center gap-2">
          <Link to="/cv" className={`px-3 py-2 text-sm rounded-md ${linkClass}`}>CV</Link>
          <PresentationThemeToggle />
          <Button variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} className={scrolled ? "text-foreground" : "text-primary-foreground hover:bg-white/20"} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <Button variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} className={`md:hidden lg:hidden ${scrolled ? "text-foreground" : "text-primary-foreground hover:bg-white/20"}`} onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {open && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-t border-border px-6 py-3 space-y-2">
          {sections.map((s) => (
            <button type="button" key={s.id} onClick={() => go(s.id)} className={`block w-full text-left px-2 py-2 rounded-md text-sm hover:bg-muted transition-smooth ${activeSection === s.id ? "bg-muted font-semibold text-foreground" : "text-foreground"}`} aria-current={activeSection === s.id ? "location" : undefined}>{s.label}</button>
          ))}
          <Link to="/cv" onClick={() => setOpen(false)} className="block w-full text-left px-2 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-smooth">Recruiter documents</Link>
          <div className="border-t border-border pt-3"><PresentationThemeToggle /></div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
