import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useViewTransition } from "@/hooks/use-view-transition";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  toggleDarkModeWithTransition: (triggerElement?: HTMLElement) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "cc_theme";

function getSystemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function computeIsDark(theme: Theme): boolean {
  if (theme === "system") return getSystemPrefersDark();
  return theme === "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      return stored || "system";
    } catch {
      return "system";
    }
  });
  const { startTransition } = useViewTransition();

  const isDarkMode = useMemo(() => computeIsDark(theme), [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [isDarkMode]);

  useEffect(() => {
    if (theme !== "system") {
      try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
    } else {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        const root = document.documentElement;
        if (mql.matches) root.classList.add("dark");
        else root.classList.remove("dark");
      }
    };
    mql.addEventListener?.("change", handler);
    return () => mql.removeEventListener?.("change", handler);
  }, [theme]);

  function setTheme(next: Theme) {
    setThemeState(next);
  }

  function toggleDarkMode() {
    const nextIsDark = !isDarkMode;
    setThemeState(nextIsDark ? "dark" : "light");
  }

  async function toggleDarkModeWithTransition(triggerElement?: HTMLElement) {
    const nextIsDark = !isDarkMode;
    await startTransition(() => {
      setThemeState(nextIsDark ? "dark" : "light");
    }, triggerElement);
  }

  const value = useMemo<ThemeContextValue>(() => ({ 
    theme, 
    setTheme, 
    isDarkMode, 
    toggleDarkMode, 
    toggleDarkModeWithTransition 
  }), [theme, isDarkMode, startTransition]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}


