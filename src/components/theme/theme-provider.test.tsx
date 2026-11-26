import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useTheme } from "./theme-context";
import { ThemeProvider } from "./theme-provider";

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

afterEach(() => {
  document.documentElement.classList.remove("light", "dark");
  vi.unstubAllGlobals();
});

describe("ThemeProvider", () => {
  it("throws when useTheme is used outside a provider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => renderHook(() => useTheme())).toThrow(
      "useTheme must be used within a ThemeProvider",
    );

    consoleError.mockRestore();
  });

  it("ignores an invalid stored theme", () => {
    localStorage.setItem("vite-ui-theme", "neon");

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe("system");
  });

  it("follows OS preference changes while in system mode", () => {
    let matches = false;
    const listeners = new Set<() => void>();

    vi.stubGlobal("matchMedia", (query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: (_type: string, listener: () => void) =>
        listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) =>
        listeners.delete(listener),
      dispatchEvent: () => false,
    }));

    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(document.documentElement.classList.contains("light")).toBe(true);

    act(() => {
      matches = true;
      listeners.forEach((listener) => listener());
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    // System resolution is never persisted as an explicit choice.
    expect(localStorage.getItem("vite-ui-theme")).toBeNull();
    expect(result.current.theme).toBe("system");
  });
});
