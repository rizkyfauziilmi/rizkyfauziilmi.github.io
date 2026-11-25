import { createRef, type ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/theme-provider";
import { useTerminalShell } from "./use-terminal-shell";

function Wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function setup() {
  const focusInput = vi.fn();
  const inputRef = createRef<HTMLTextAreaElement>();
  const hook = renderHook(() => useTerminalShell({ inputRef, focusInput }), {
    wrapper: Wrapper,
  });

  return { ...hook, focusInput };
}

describe("useTerminalShell", () => {
  it("submits the current value, clears the input, and restores focus", () => {
    const { result, focusInput } = setup();

    act(() => result.current.changeValue("echo hi"));
    expect(result.current.value).toBe("echo hi");

    act(() => result.current.runValue());

    expect(result.current.value).toBe("");
    expect(focusInput).toHaveBeenCalledTimes(1);
    expect(
      result.current.entries.some(
        (entry) => entry.kind === "input" && entry.text === "echo hi",
      ),
    ).toBe(true);
  });

  it("runs help through the same submit path", () => {
    const { result } = setup();

    act(() => result.current.runHelp());

    expect(result.current.value).toBe("");
    expect(
      result.current.entries.some(
        (entry) => entry.kind === "input" && entry.text === "help",
      ),
    ).toBe(true);
  });

  it("exits an active TUI and restores focus", () => {
    const { result, focusInput } = setup();

    act(() => result.current.changeValue("projects"));
    act(() => result.current.runValue());
    expect(result.current.activeTui).toBe("projects");

    act(() => result.current.leaveTui());

    expect(result.current.activeTui).toBeNull();
    expect(focusInput).toHaveBeenCalledTimes(2);
  });
});
