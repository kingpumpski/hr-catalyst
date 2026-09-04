import { useEffect, useState } from "react";
import { Menu, Settings2, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

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
  const isOwnerMode = new URLSearchParams(location.search).get("mode") === "owner";
  const visibleActiveSection = location.pathname === "/" ? activeSection : "";

  useEffect(() => {
    let frame = 0;

    const updateScrolled = () => {
      frame = 0;
      setScrolled(window.scrollY > 24);
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(updateScrolled);
    };

    updateScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;

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
      visibleActiveSection === id ? "bg-foreground/10 font-semibold text-foreground" : linkClass
    }`;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-smooth ${scrolled ? "bg-background/90 backdrop-blur-md shadow-soft" : "bg-transparent"}`}>
      <nav className="container max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-4" aria-label="Primary navigation">
        <button type="button" onClick={goHome} className={`font-semibold tracking-tight transition-smooth ${scrolled ? "text-foreground" : "text-primary-foreground"}`}>
          Kingsley J. Norku
        </button>

        <div className="hidden xl:flex items-center gap-1">
          {sections.map((s) => (
            <button type="button" key={s.id} onClick={() => go(s.id)} className={sectionButtonClass(s.id)} aria-current={visibleActiveSection === s.id ? "location" : undefined}>
              {s.label}
            </button>
          ))}
          <Link to="/cv" className={`px-3 py-2 text-sm rounded-md transition-smooth hover:bg-foreground/10 ${linkClass}`}>Recruiter docs</Link>
          {isOwnerMode && (
            <Link
              to="/settings?mode=owner"
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-smooth hover:bg-foreground/10 ${linkClass}`}
            >
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          )}
        </div>

        <div className="hidden lg:flex xl:hidden items-center gap-2">
          {isOwnerMode && (
            <Link
              to="/settings?mode=owner"
              aria-label="Open settings"
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-2 text-sm ${linkClass}`}
            >
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          )}
          <Link to="/cv" className={`px-3 py-2 text-sm rounded-md ${linkClass}`}>CV</Link>
          <Button variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} className={scrolled ? "text-foreground" : "text-primary-foreground hover:bg-white/20"} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex lg:hidden items-center gap-2">
          <Button variant="ghost" size="icon" aria-label={open ? "Close menu" : "Open menu"} className={scrolled ? "text-foreground" : "text-primary-foreground hover:bg-white/20"} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden bg-background/95 backdrop-blur-md border-t border-border px-6 py-3 space-y-2">
          {isOwnerMode && (
            <Link
              to="/settings?mode=owner"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-smooth"
            >
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          )}
          {sections.map((s) => (
            <button type="button" key={s.id} onClick={() => go(s.id)} className={`block w-full text-left px-2 py-2 rounded-md text-sm hover:bg-muted transition-smooth ${visibleActiveSection === s.id ? "bg-muted font-semibold text-foreground" : "text-foreground"}`} aria-current={visibleActiveSection === s.id ? "location" : undefined}>{s.label}</button>
          ))}
          <Link to="/cv" onClick={() => setOpen(false)} className="block w-full text-left px-2 py-2 rounded-md text-sm text-foreground hover:bg-muted transition-smooth">Recruiter documents</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
