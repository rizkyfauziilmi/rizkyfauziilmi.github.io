import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TuiActions } from "./tui-actions";

const isActive = (name: RegExp) =>
  screen.getByRole("button", { name }).hasAttribute("data-tui-active");

describe("TuiActions", () => {
  it("wraps left/right navigation and activates with Enter", () => {
    const first = vi.fn();
    const second = vi.fn();
    render(
      <TuiActions
        actions={[
          { id: "first", label: "first", onSelect: first },
          { id: "second", label: "second", onSelect: second },
        ]}
      />,
    );

    expect(isActive(/first/)).toBe(true);
    expect(isActive(/second/)).toBe(false);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(isActive(/second/)).toBe(true);

    fireEvent.keyDown(window, { key: "Enter" });
    expect(second).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(isActive(/first/)).toBe(true);

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(isActive(/second/)).toBe(true);
  });

  it("supports h/l aliases with wrap-around", () => {
    render(
      <TuiActions
        actions={[
          { id: "first", label: "first", onSelect: vi.fn() },
          { id: "second", label: "second", onSelect: vi.fn() },
        ]}
      />,
    );

    fireEvent.keyDown(window, { key: "l" });
    expect(isActive(/second/)).toBe(true);

    fireEvent.keyDown(window, { key: "l" });
    expect(isActive(/first/)).toBe(true);

    fireEvent.keyDown(window, { key: "h" });
    expect(isActive(/second/)).toBe(true);
  });

  it("renders link actions and ignores typing targets and modifiers", () => {
    const onSelect = vi.fn();
    render(
      <TuiActions
        actions={[
          { id: "copy", label: "copy", onSelect },
          { id: "open", label: "open", href: "https://example.com" },
        ]}
      />,
    );

    expect(
      screen.getByRole("button", { name: "open" }).getAttribute("href"),
    ).toBe("https://example.com");

    const input = document.createElement("input");
    document.body.append(input);
    try {
      fireEvent.keyDown(input, { key: "ArrowRight" });
      fireEvent.keyDown(window, { key: "ArrowRight", ctrlKey: true });
      expect(isActive(/copy/)).toBe(true);
    } finally {
      input.remove();
    }
  });

  it("skips disabled actions while navigating and never activates them", () => {
    const first = vi.fn();
    const disabled = vi.fn();
    render(
      <TuiActions
        actions={[
          { id: "first", label: "first", onSelect: first },
          {
            id: "disabled",
            label: "disabled",
            onSelect: disabled,
            disabled: true,
          },
        ]}
      />,
    );

    expect(isActive(/first/)).toBe(true);
    const disabledButton = screen.getByRole("button", { name: "disabled" });
    expect(disabledButton.hasAttribute("disabled")).toBe(true);
    expect(disabledButton.hasAttribute("data-tui-interactive")).toBe(true);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(isActive(/disabled/)).toBe(false);
    expect(isActive(/first/)).toBe(true);

    fireEvent.keyDown(window, { key: "Enter" });
    expect(first).toHaveBeenCalledOnce();
    expect(disabled).not.toHaveBeenCalled();
  });

  it("moves selection when the active action becomes disabled", () => {
    const first = vi.fn();
    const second = vi.fn();
    const actions = [
      { id: "first", label: "first", onSelect: first },
      { id: "second", label: "second", onSelect: second },
    ];
    const { rerender } = render(<TuiActions actions={actions} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(isActive(/second/)).toBe(true);

    rerender(
      <TuiActions actions={[actions[0], { ...actions[1], disabled: true }]} />,
    );
    expect(isActive(/first/)).toBe(true);

    fireEvent.keyDown(window, { key: "Enter" });
    expect(second).not.toHaveBeenCalled();
    expect(first).toHaveBeenCalledOnce();
  });

  it("tracks focus and clicks from the pointer", () => {
    const onSelect = vi.fn();
    render(
      <TuiActions
        actions={[
          { id: "copy", label: "copy", onSelect },
          { id: "open", label: "open", href: "https://example.com" },
        ]}
      />,
    );

    fireEvent.focus(screen.getByRole("button", { name: "open" }));
    expect(isActive(/open/)).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "copy" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(isActive(/copy/)).toBe(true);
  });
});
