import { createRef, type ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/theme";
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

  it("interrupts the line, marks it, and restores focus without running it", () => {
    const { result, focusInput } = setup();

    act(() => result.current.changeValue("asdf"));
    act(() => result.current.interruptLine());

    expect(result.current.value).toBe("");
    expect(focusInput).toHaveBeenCalledTimes(1);
    expect(result.current.entries).toEqual([
      { id: 0, kind: "input", text: "asdf^C" },
    ]);
  });

  it("clears active completions when interrupting", () => {
    const { result } = setup();

    act(() => result.current.changeValue("s"));
    act(() => result.current.complete());
    expect(result.current.suggestions).not.toEqual([]);

    act(() => result.current.interruptLine());

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.entries.at(-1)?.text).toBe("s^C");
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

  it("completes a known command and clears suggestions when typing again", () => {
    const { result } = setup();

    act(() => result.current.changeValue("the"));
    act(() => result.current.complete());

    expect(result.current.value).toBe("theme ");

    act(() => result.current.changeValue("them"));
    expect(result.current.suggestions).toEqual([]);
  });

  it("completes an argument value from the registry", () => {
    const { result } = setup();

    act(() => result.current.changeValue("theme d"));
    act(() => result.current.complete());

    expect(result.current.value).toBe("theme dark ");
  });

  it("exposes ambiguous completions and clears them on submit", () => {
    const { result } = setup();

    act(() => result.current.changeValue("s"));
    act(() => result.current.complete());
    expect(result.current.suggestions).toEqual(["shutdown", "sudo"]);

    act(() => result.current.runValue());
    expect(result.current.suggestions).toEqual([]);
  });

  it("cycles ambiguous completions and accepts without submitting", () => {
    const { result } = setup();

    act(() => result.current.changeValue("s"));
    act(() => result.current.complete());
    expect(result.current.activeSuggestion).toBe(0);

    act(() => result.current.complete());
    expect(result.current.value).toBe("s");
    expect(result.current.activeSuggestion).toBe(1);

    const entryCount = result.current.entries.length;
    let accepted = false;
    act(() => {
      accepted = result.current.acceptCompletion();
    });

    expect(accepted).toBe(true);
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.entries).toHaveLength(entryCount);
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
