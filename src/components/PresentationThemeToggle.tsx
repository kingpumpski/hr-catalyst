import { Check, Palette } from "lucide-react";
import { presentationThemes } from "@/data/siteConfig";
import { Button } from "@/components/ui/button";
import { usePresentationTheme } from "@/components/PresentationThemeProvider";

type PresentationThemeToggleProps = {
  compact?: boolean;
};

const PresentationThemeToggle = ({ compact = false }: PresentationThemeToggleProps) => {
  const { theme, setTheme } = usePresentationTheme();
  const activeTheme = presentationThemes.find((option) => option.id === theme);

  return (
    <div
      className={compact
        ? "inline-flex max-w-full items-center gap-1 rounded-lg border border-border/80 bg-background/95 p-1 text-foreground shadow-soft backdrop-blur-md"
        : "flex flex-wrap items-center gap-2"
      }
      aria-label="Presentation mode"
    >
      <span className={compact
        ? "inline-flex items-center gap-1.5 px-2 text-xs font-semibold text-foreground"
        : "mr-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      }>
        <Palette className="h-4 w-4" aria-hidden="true" />
        <span>{compact ? activeTheme?.name ?? "Presentation" : "Presentation"}</span>
      </span>
      {presentationThemes.map((option) => (
        <Button
          key={option.id}
          type="button"
          size="sm"
          variant={theme === option.id ? "default" : "outline"}
          title={option.description}
          aria-label={`${option.name} presentation`}
          aria-pressed={theme === option.id}
          onClick={() => setTheme(option.id)}
          className={compact ? "text-xs" : undefined}
        >
          {theme === option.id && <Check className="mr-1 h-3.5 w-3.5" aria-hidden="true" />}
          {option.name}
        </Button>
      ))}
    </div>
  );
};

export default PresentationThemeToggle;
