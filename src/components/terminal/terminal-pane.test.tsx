import { createRef, type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/theme-provider";
import { TerminalPane } from "./terminal-pane";

function Wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

function setup() {
  const inputRef = createRef<HTMLTextAreaElement>();
  const focusInput = vi.fn();
  const view = render(
    <TerminalPane inputRef={inputRef} focusInput={focusInput} />,
    { wrapper: Wrapper },
  );

  return { ...view, inputRef };
}

function getHint(container: HTMLElement) {
  return container.querySelector("[data-command-suggestions]");
}

describe("TerminalPane", () => {
  it("shows completion after the input on an empty line", () => {
    const { container } = setup();
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    expect(getHint(container)).toBeNull();

    fireEvent.keyDown(textarea, { key: "Tab" });

    const hint = getHint(container);
    if (!hint) throw new Error("completion hint was not rendered");

    expect(hint.getAttribute("aria-live")).toBe("polite");
    expect(hint.textContent).toContain("shutdown");
    expect(textarea.value).toBe("");
    expect(
      textarea.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("clears the hint when the user types again", () => {
    const { container } = setup();
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    fireEvent.keyDown(textarea, { key: "Tab" });
    expect(getHint(container)).not.toBeNull();

    fireEvent.change(textarea, { target: { value: "the" } });

    expect(textarea.value).toBe("the");
    expect(getHint(container)).toBeNull();
  });
});
