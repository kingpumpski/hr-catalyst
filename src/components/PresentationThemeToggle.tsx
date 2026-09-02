import { Check, Palette } from "lucide-react";
import { presentationThemes } from "@/data/siteConfig";
import { Button } from "@/components/ui/button";
import { usePresentationTheme } from "@/components/PresentationThemeProvider";

const PresentationThemeToggle = () => {
  const { theme, setTheme } = usePresentationTheme();

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
