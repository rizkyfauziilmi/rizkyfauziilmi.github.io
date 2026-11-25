import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCommandInputKeys } from "./use-command-input-keys";

type Options = Parameters<typeof useCommandInputKeys>[0];

function setup(overrides: Partial<Options> = {}) {
  const onComplete = overrides.onComplete ?? vi.fn();
  const onHelp = overrides.onHelp ?? vi.fn();
  const onHistoryNavigate = overrides.onHistoryNavigate ?? vi.fn(() => true);
  const onSubmit = overrides.onSubmit ?? vi.fn();
  const onAcceptCompletion = overrides.onAcceptCompletion ?? vi.fn(() => false);
  const onCancelCompletion = overrides.onCancelCompletion ?? vi.fn();
  const hasCompletionSelection = overrides.hasCompletionSelection ?? false;
  const hook = renderHook(() =>
    useCommandInputKeys({
      onComplete,
      onHelp,
      onHistoryNavigate,
      onSubmit,
      onAcceptCompletion,
      onCancelCompletion,
      hasCompletionSelection,
    }),
  );

  return {
    ...hook,
    onComplete,
    onHelp,
    onHistoryNavigate,
    onSubmit,
    onAcceptCompletion,
    onCancelCompletion,
  };
}

function makeEvent(
  key: string,
  modifiers: Partial<ReactKeyboardEvent<HTMLTextAreaElement>> = {},
  isComposing = false,
) {
  const preventDefault = vi.fn();
  const event = {
    key,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    nativeEvent: { isComposing },
    preventDefault,
    ...modifiers,
  } as unknown as ReactKeyboardEvent<HTMLTextAreaElement>;

  return { event, preventDefault };
}

describe("useCommandInputKeys", () => {
  it("completes on plain Tab", () => {
    const { result, onComplete } = setup();
    const { event, preventDefault } = makeEvent("Tab");

    act(() => result.current(event));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("leaves Shift+Tab to the focus trap without a selection", () => {
    const { result, onComplete } = setup();
    const { event, preventDefault } = makeEvent("Tab", { shiftKey: true });

    act(() => result.current(event));

    expect(onComplete).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("cycles backward with Shift+Tab while a selection is active", () => {
    const { result, onComplete } = setup({ hasCompletionSelection: true });
    const { event, preventDefault } = makeEvent("Tab", { shiftKey: true });

    act(() => result.current(event));

    expect(onComplete).toHaveBeenCalledWith(true);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("ignores Tab during IME composition", () => {
    const { result, onComplete } = setup();
    const { event, preventDefault } = makeEvent("Tab", {}, true);

    act(() => result.current(event));

    expect(onComplete).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

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

  it("accepts a highlighted completion instead of submitting", () => {
    const { result, onSubmit, onAcceptCompletion } = setup({
      onAcceptCompletion: vi.fn(() => true),
    });
    const { event } = makeEvent("Enter");

    act(() => result.current(event));

    expect(onAcceptCompletion).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("cancels an active completion with Escape", () => {
    const { result, onCancelCompletion } = setup({
      hasCompletionSelection: true,
    });
    const { event, preventDefault } = makeEvent("Escape");

    act(() => result.current(event));

    expect(onCancelCompletion).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("ignores Escape without an active completion", () => {
    const { result, onCancelCompletion } = setup();
    const { event, preventDefault } = makeEvent("Escape");

    act(() => result.current(event));

    expect(onCancelCompletion).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
