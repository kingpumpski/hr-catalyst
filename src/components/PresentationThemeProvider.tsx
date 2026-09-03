import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { PresentationTheme } from "@/data/siteConfig";

const STORAGE_KEY = "hr-catalyst:presentation-theme";

type PresentationThemeContextValue = {
  theme: PresentationTheme;
  setTheme: (theme: PresentationTheme) => void;
};

const PresentationThemeContext = createContext<PresentationThemeContextValue | null>(null);

const readTheme = (): PresentationTheme => {
  if (typeof window === "undefined") return "executive";
  return window.localStorage.getItem(STORAGE_KEY) === "professional" ? "professional" : "executive";
};

export const PresentationThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<PresentationTheme>(readTheme);

  useEffect(() => {
    document.documentElement.dataset.presentationTheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <PresentationThemeContext.Provider value={value}>{children}</PresentationThemeContext.Provider>;
};

export function usePresentationTheme() {
  const context = useContext(PresentationThemeContext);
  if (!context) throw new Error("usePresentationTheme must be used within PresentationThemeProvider");
  return context;
}
