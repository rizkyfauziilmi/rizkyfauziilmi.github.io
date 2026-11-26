import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getCommandLabel } from "../commands/help";
import { COMMAND_DEFINITIONS } from "../commands/registry";
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

  it("sizes the command column from the registry labels", () => {
    const { container } = render(<HelpOutput />);
    const visibleLabels = COMMAND_DEFINITIONS.filter(
      (command) => !command.hidden,
    )
      .map(getCommandLabel)
      .map((label) => label.length);
    const expectedWidth = Math.max(10, ...visibleLabels) + 2;
    const rows = container.querySelectorAll('[style*="grid-template-columns"]');

    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const columns = (row as HTMLElement).style.gridTemplateColumns;
      expect(columns).not.toContain("18ch");
      expect(columns).toContain(`${expectedWidth}ch`);
      expect(columns).toContain("1fr");
    }
    expect(screen.getByText("shutdown <now|+N|HH:MM|-c>").className).toContain(
      "break-words",
    );
  });

  it("indents every section body under its heading", () => {
    const { container } = render(<HelpOutput />);
    const sections = [...container.querySelectorAll("section")];

    expect(
      sections.map((section) => section.querySelector("h3")?.textContent),
    ).toEqual(["Usage:", "Commands:", "Flags:", "Tips:"]);
    for (const section of sections) {
      expect(section.lastElementChild?.className).toContain("pl-4");
    }
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
    for (const ctrl of screen.getAllByText("Ctrl")) {
      expect(ctrl.tagName).toBe("KBD");
    }
    expect(screen.getByText("Enter").tagName).toBe("KBD");
  });

  it("renders the Ctrl+C interrupt tip", () => {
    render(<HelpOutput />);

    expect(
      screen.getByText(/aborts the line and opens a new prompt/),
    ).toBeTruthy();
  });

  it("renders the Tab completion tips", () => {
    render(<HelpOutput />);

    expect(
      screen.getByText(/completes commands, flags, or argument values/),
    ).toBeTruthy();
    expect(screen.getByText(/lists matches when ambiguous/)).toBeTruthy();
    expect(screen.getByText(/cycles matches/)).toBeTruthy();
    expect(screen.getByText(/inserts the selected match/)).toBeTruthy();
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
