import { createRef, type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/components/theme";
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

function getActiveHint(container: HTMLElement) {
  return (
    container.querySelector("[data-command-suggestions] [data-active]")
      ?.textContent ?? ""
  );
}

function type(textarea: HTMLTextAreaElement, value: string) {
  fireEvent.change(textarea, { target: { value } });
  textarea.setSelectionRange(value.length, value.length);
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

  it("cycles matches with Tab and inserts the selection with Enter", () => {
    const { container } = setup();
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    type(textarea, "s");
    fireEvent.keyDown(textarea, { key: "Tab" });
    expect(getActiveHint(container)).toBe("shutdown");
    expect(textarea.value).toBe("s");

    fireEvent.keyDown(textarea, { key: "Tab" });
    expect(getActiveHint(container)).toBe("sudo");
    expect(textarea.value).toBe("s");

    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(getHint(container)).toBeNull();
    expect(textarea.value).toBe("sudo ");

    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(container.textContent).toContain("sudo");
  });

  it("cycles backward with Shift+Tab and dismisses the hint with Escape", () => {
    const { container } = setup();
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    type(textarea, "s");
    fireEvent.keyDown(textarea, { key: "Tab" });
    expect(getActiveHint(container)).toBe("shutdown");

    fireEvent.keyDown(textarea, { key: "Tab" });
    fireEvent.keyDown(textarea, { key: "Tab", shiftKey: true });

    expect(getActiveHint(container)).toBe("shutdown");
    expect(textarea.value).toBe("s");

    fireEvent.keyDown(textarea, { key: "Escape" });
    expect(getHint(container)).toBeNull();
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

  it("opens the cv TUI and returns to the prompt on q", () => {
    const { container } = setup();
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    type(textarea, "cv");
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(container.querySelector('[data-slot="cv-tui"]')).not.toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();

    fireEvent.keyDown(window, { key: "q" });

    expect(container.querySelector('[data-slot="cv-tui"]')).toBeNull();
    expect(screen.getByRole("textbox")).toBeTruthy();
  });

  it("opens the contact TUI and returns to the prompt on q", () => {
    const { container } = setup();
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    type(textarea, "contact");
    fireEvent.keyDown(textarea, { key: "Enter" });

    expect(container.querySelector('[data-slot="contact-tui"]')).not.toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();

    fireEvent.keyDown(window, { key: "q" });

    expect(container.querySelector('[data-slot="contact-tui"]')).toBeNull();
    expect(screen.getByRole("textbox")).toBeTruthy();
  });
});
