import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TuiHints } from "./tui-hints";

const hintText = (container: HTMLElement, hint: string) =>
  container.querySelector(`[data-hint="${hint}"]`)?.textContent ?? "";

describe("TuiHints", () => {
  it("shows a single navigate hint in list view", () => {
    const { container } = render(<TuiHints />);

    expect(container.querySelectorAll('[data-hint="navigate"]')).toHaveLength(
      1,
    );
    expect(hintText(container, "navigate")).toContain("navigate");
    expect(hintText(container, "detail")).toContain("detail");
    expect(hintText(container, "exit")).toContain("exit");
    expect(container.textContent).toContain("click to select");
  });

  it("shows detail action keys plus ctrl+c in detail view", () => {
    const { container } = render(<TuiHints variant="detail" />);

    expect(container.querySelector('[data-hint="navigate"]')).toBeNull();
    expect(hintText(container, "actions")).toContain("select action");
    expect(hintText(container, "actions")).toContain("←");
    expect(hintText(container, "actions")).toContain("→");
    expect(hintText(container, "actions")).toContain("h");
    expect(hintText(container, "actions")).toContain("l");
    expect(hintText(container, "activate")).toContain("activate");
    expect(hintText(container, "back")).toContain("back");
    expect(hintText(container, "exit")).toContain("exit");
    expect(hintText(container, "exit")).toContain("CtrlC");
  });

  it("shows viewer-specific keys in cv view", () => {
    const { container } = render(<TuiHints variant="cv" />);

    expect(container.querySelector('[data-hint="navigate"]')).toBeNull();
    expect(hintText(container, "actions")).toContain("select action");
    expect(hintText(container, "actions")).toContain("←");
    expect(hintText(container, "actions")).toContain("→");
    expect(hintText(container, "activate")).toContain("Enter");
    expect(hintText(container, "fullscreen")).toContain("F");
    expect(hintText(container, "fullscreen")).toContain("see in fullscreen");
    expect(hintText(container, "download")).toContain("D");
    expect(hintText(container, "download")).toContain("download PDF");
    expect(hintText(container, "back")).toContain("back to terminal");
    expect(hintText(container, "exit")).toContain("CtrlC");
    expect(container.textContent).not.toContain("click to select");
  });
});
