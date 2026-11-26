import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { isThemeMode, type ThemeMode } from "@/lib/theme";
import { ThemeProviderContext } from "./theme-context";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
};

function readStoredTheme(storageKey: string, fallback: ThemeMode): ThemeMode {
  try {
    const stored = localStorage.getItem(storageKey);
    return isThemeMode(stored) ? stored : fallback;
  } catch {
    // Storage can be unavailable (private mode); fall back to the in-memory theme.
    return fallback;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    readStoredTheme(storageKey, defaultTheme),
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    // "system" resolves through matchMedia and applies a concrete class;
    // only explicit choices are stored.
    if (theme !== "system") {
      root.classList.add(theme);
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      root.classList.remove("light", "dark");
      root.classList.add(media.matches ? "dark" : "light");
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = useCallback(
    (next: ThemeMode) => {
      // Persist here so a reload keeps the terminal's theme command effective.
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        // The in-memory theme still works when storage is blocked.
      }
      setThemeState(next);
    },
    [storageKey],
  );

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
