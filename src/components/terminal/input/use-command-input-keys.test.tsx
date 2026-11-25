import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCommandInputKeys } from "./use-command-input-keys";

type Options = Parameters<typeof useCommandInputKeys>[0];

function setup(overrides: Partial<Options> = {}) {
  const onHelp = overrides.onHelp ?? vi.fn();
  const onHistoryNavigate = overrides.onHistoryNavigate ?? vi.fn(() => true);
  const onSubmit = overrides.onSubmit ?? vi.fn();
  const hook = renderHook(() =>
    useCommandInputKeys({ onHelp, onHistoryNavigate, onSubmit }),
  );

  return { ...hook, onHelp, onHistoryNavigate, onSubmit };
}

function makeEvent(
  key: string,
  modifiers: Partial<ReactKeyboardEvent<HTMLTextAreaElement>> = {},
) {
  const preventDefault = vi.fn();
  const event = {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault,
    ...modifiers,
  } as unknown as ReactKeyboardEvent<HTMLTextAreaElement>;

  return { event, preventDefault };
}

describe("useCommandInputKeys", () => {
  it("runs help on Ctrl+/", () => {
    const { result, onHelp } = setup();
    const { event, preventDefault } = makeEvent("/", { ctrlKey: true });

    act(() => result.current(event));

    expect(onHelp).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("navigates history when the handler consumes the arrow key", () => {
    const { result, onHistoryNavigate } = setup();
    const { event, preventDefault } = makeEvent("ArrowUp");

    act(() => result.current(event));

    expect(onHistoryNavigate).toHaveBeenCalledWith("previous");
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("keeps native caret movement when history does not consume the key", () => {
    const { result, onHistoryNavigate } = setup({
      onHistoryNavigate: vi.fn(() => false),
    });
    const { event, preventDefault } = makeEvent("ArrowDown");

    act(() => result.current(event));

    expect(onHistoryNavigate).toHaveBeenCalledWith("next");
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("ignores modified arrow keys", () => {
    const { result, onHistoryNavigate } = setup();
    const { event, preventDefault } = makeEvent("ArrowDown", {
      shiftKey: true,
    });

    act(() => result.current(event));

    expect(onHistoryNavigate).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("submits on Enter", () => {
    const { result, onSubmit } = setup();
    const { event, preventDefault } = makeEvent("Enter");

    act(() => result.current(event));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
