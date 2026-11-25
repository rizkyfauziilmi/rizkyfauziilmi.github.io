import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TerminalEntry } from "../types";
import { HelpOutput } from "./help-output";
import { TerminalEntryView } from "./terminal-entry-view";

describe("HelpOutput", () => {
  it("renders command and flag syntax as plain text", () => {
    render(<HelpOutput />);

    expect(screen.getByText(/Portfolio Terminal/)).toBeTruthy();
    expect(screen.getByText("about").tagName).toBe("SPAN");
    expect(screen.getByText("<command> [...flags] [...args]").tagName).toBe(
      "P",
    );
    expect(screen.getByText("<command> -h").tagName).toBe("SPAN");
    expect(screen.getByText("-h, --help").tagName).toBe("SPAN");
    expect(screen.getByText("Show a short introduction")).toBeTruthy();
    expect(
      screen.getByText("Browse projects in an interactive TUI"),
    ).toBeTruthy();
    expect(screen.queryByText("sudo")).toBeNull();
    expect(screen.queryByText("fastfetch")).toBeNull();
  });

  it("uses keyboard badges only in the tips section", () => {
    const { container } = render(<HelpOutput />);

    const keys = [...container.querySelectorAll("kbd")];
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(key.closest("section")?.querySelector("h3")?.textContent).toBe(
        "Tips:",
      );
    }

    const tabs = screen.getAllByText("Tab");
    expect(tabs.length).toBeGreaterThan(0);
    expect(tabs[0].tagName).toBe("KBD");
    expect(screen.getByText("Ctrl").tagName).toBe("KBD");
  });

  it("renders the Tab completion tips", () => {
    render(<HelpOutput />);

    expect(
      screen.getByText(/completes a command or lists matches when ambiguous/),
    ).toBeTruthy();
  });

  it("routes help entries through the view registry", () => {
    const entry: TerminalEntry = {
      id: 1,
      kind: "output",
      text: "",
      view: "help",
    };

    render(<TerminalEntryView entry={entry} />);

    expect(screen.getByText("about")).toBeTruthy();
  });
});
