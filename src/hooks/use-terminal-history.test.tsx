import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/theme";
import { downloadFile } from "@/components/terminal/download";
import { useTerminalHistory } from "./use-terminal-history";

vi.mock("@/components/terminal/download", () => ({
  downloadFile: vi.fn(() => Promise.resolve()),
}));

const reload = vi.fn();
const close = vi.fn();

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("useTerminalHistory", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("location", { reload });
    vi.spyOn(window, "close").mockImplementation(close);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reloads one second after reboot", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("reboot"));
    expect(result.current.entries.at(-1)?.text).toBe("Rebooting...");
    expect(reload).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1_000));
    expect(reload).toHaveBeenCalledOnce();
  });

  it("closes immediately for shutdown now, then falls back to halted", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("shutdown now"));
    act(() => vi.advanceTimersByTime(0));

    expect(close).toHaveBeenCalledOnce();
    expect(result.current.isHalted).toBe(false);

    act(() => vi.advanceTimersByTime(250));
    expect(result.current.isHalted).toBe(true);
  });

  it("halts a scheduled shutdown without trying to close the tab", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("shutdown +5"));
    expect(result.current.entries.at(-1)?.text).toContain("shutdown -c");
    expect(close).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(5 * 60_000));
    expect(result.current.isHalted).toBe(true);
    expect(close).not.toHaveBeenCalled();
  });

  it("cancels a pending shutdown", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("shutdown +5"));
    act(() => result.current.submit("shutdown -c"));

    expect(result.current.entries.at(-1)?.text).toBe("Shutdown cancelled.");

    act(() => vi.advanceTimersByTime(5 * 60_000));
    expect(result.current.isHalted).toBe(false);
  });

  it("reports when there is nothing to cancel", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("shutdown -c"));
    expect(result.current.entries.at(-1)?.text).toBe("No shutdown scheduled.");
  });

  it("clears the screen without erasing command history", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("help"));
    act(() => result.current.submit("clear"));

    expect(result.current.entries).toHaveLength(0);
    expect(result.current.commands).toEqual(["help", "clear"]);
  });

  it("applies and persists a theme command", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("theme dark"));

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("vite-ui-theme")).toBe("dark");
  });

  it("passes the active theme to the neofetch command", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("theme dark"));
    act(() => result.current.submit("neofetch"));

    expect(result.current.entries.at(-1)?.text).toContain("Theme:      dark");
  });

  it("starts the CV download without opening a tui", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("cv --download"));

    expect(downloadFile).toHaveBeenCalledWith({
      type: "download",
      url: "/cv.pdf",
      filename: "rizky-fauzi-ilmi-cv.pdf",
      text: "Downloading rizky-fauzi-ilmi-cv.pdf — updated 26 Nov 2026. Progress: see toast.",
    });
    expect(result.current.activeTui).toBeNull();
    expect(result.current.entries.at(-1)?.text).toContain(
      "Downloading rizky-fauzi-ilmi-cv.pdf",
    );
  });

  it("keeps entry ids unique after the screen is cleared", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("help"));
    act(() => result.current.submit("clear"));
    act(() => result.current.submit("echo hi"));

    expect(result.current.entries.map((entry) => entry.id)).toEqual([2, 3]);
  });

  it("cancels a shutdown now before its halted fallback", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("shutdown now"));
    act(() => result.current.submit("shutdown -c"));
    act(() => vi.advanceTimersByTime(250));

    expect(result.current.isHalted).toBe(false);
    expect(close).toHaveBeenCalledOnce();
  });

  it("owns submission while the projects tui is active", () => {
    const { result } = renderHook(() => useTerminalHistory(), { wrapper });

    act(() => result.current.submit("projects"));
    expect(result.current.activeTui).toBe("projects");

    let accepted = true;
    act(() => {
      accepted = result.current.submit("help");
    });
    expect(accepted).toBe(false);

    act(() => result.current.exitTui());
    expect(result.current.activeTui).toBeNull();

    act(() => {
      accepted = result.current.submit("help");
    });
    expect(accepted).toBe(true);
  });
});
