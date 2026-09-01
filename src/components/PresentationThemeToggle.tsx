import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";
import { presentationThemes, type PresentationTheme } from "@/data/siteConfig";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "hr-catalyst:presentation-theme";

const PresentationThemeToggle = () => {
  const [theme, setTheme] = useState<PresentationTheme>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === "professional" ? "professional" : "executive";
  });

  useEffect(() => {
    document.documentElement.dataset.presentationTheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Presentation theme">
      <span className="mr-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Palette className="h-4 w-4" aria-hidden="true" /> Theme
      </span>
      {presentationThemes.map((option) => (
        <Button
          key={option.id}
          type="button"
          size="sm"
          variant={theme === option.id ? "default" : "outline"}
          title={option.description}
          aria-pressed={theme === option.id}
          onClick={() => setTheme(option.id)}
        >
          {theme === option.id && <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />}
          {option.name}
        </Button>
      ))}
    </div>
  );
};

export default PresentationThemeToggle;
