import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BlockCaretInput } from "./block-caret-input";
import { CommandHighlight } from "./command-highlight";
import { TerminalInputLine } from "./terminal-input-line";

function renderInput() {
  return render(
    <BlockCaretInput
      inputRef={createRef<HTMLTextAreaElement>()}
      value="help"
      onChange={() => {}}
      onHistoryNavigate={() => false}
      onSubmit={() => {}}
      onHelp={() => {}}
      onComplete={() => {}}
    />,
  );
}

describe("CommandHighlight", () => {
  it("uses the command colour when the name is in the registry", () => {
    const { container } = render(<CommandHighlight value="theme dark" />);
    const tokens = container.querySelectorAll("[data-highlight-kind]");

    expect(tokens[0].getAttribute("data-highlight-kind")).toBe("command");
    expect(tokens[0].textContent).toBe("theme");
    expect(tokens[0].className).toContain("text-orange-300");
  });

  it("leaves flags and arguments uncoloured", () => {
    const { container } = render(<CommandHighlight value="shutdown -c" />);
    const tokens = container.querySelectorAll("[data-highlight-kind]");

    expect(tokens).toHaveLength(2);
    expect(tokens[1].getAttribute("data-highlight-kind")).toBe("text");
    expect(tokens[1].textContent).toBe(" -c");
    expect(tokens[1].className).toBe("");
  });

  it("renders unknown commands as a single plain segment", () => {
    const { container } = render(<CommandHighlight value="nope -x" />);
    const tokens = container.querySelectorAll("[data-highlight-kind]");

    expect(tokens).toHaveLength(1);
    expect(tokens[0].getAttribute("data-highlight-kind")).toBe("text");
    expect(tokens[0].textContent).toBe("nope -x");
  });
});

describe("TerminalInputLine", () => {
  it("keeps the submitted text and highlights known commands", () => {
    render(<TerminalInputLine text="help" />);

    const token = screen.getByText("help");
    expect(token.getAttribute("data-highlight-kind")).toBe("command");
    expect(token.textContent).toBe("help");
  });
});

describe("BlockCaretInput", () => {
  it("renders a visible overlay while the textarea keeps the real value", () => {
    const { container } = renderInput();

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("help");
    expect(textarea.className).toContain("text-transparent");

    const overlay = container.querySelector(
      "[data-command-highlight-overlay]",
    );
    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute("aria-hidden")).toBe("true");
    expect(
      overlay?.querySelector("[data-highlight-kind='command']")?.textContent,
    ).toBe("help");
    expect(container.querySelector("[data-command-suggestions]")).toBeNull();
  });
});
