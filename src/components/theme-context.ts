import { createContext, useContext } from "react";

import type { ThemeMode } from "@/lib/theme";

export type ThemeProviderState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

// No default value: useTheme must fail loudly when used outside the provider.
export const ThemeProviderContext = createContext<
  ThemeProviderState | undefined
>(undefined);

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
