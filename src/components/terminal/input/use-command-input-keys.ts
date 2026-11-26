import { useCallback, type KeyboardEvent as ReactKeyboardEvent } from "react";

import type { HistoryDirection } from "@/hooks";

interface UseCommandInputKeysOptions {
  onComplete: (backward?: boolean) => void;
  onHelp: () => void;
  onInterrupt: () => void;
  onHistoryNavigate: (direction: HistoryDirection) => boolean;
  onSubmit: () => void;
  onAcceptCompletion: () => boolean;
  onCancelCompletion: () => void;
  hasCompletionSelection: boolean;
}

/** Keyboard shortcuts for the terminal prompt, kept out of the render layer. */
export function useCommandInputKeys({
  onComplete,
  onHelp,
  onInterrupt,
  onHistoryNavigate,
  onSubmit,
  onAcceptCompletion,
  onCancelCompletion,
  hasCompletionSelection,
}: UseCommandInputKeysOptions) {
  return useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (event.nativeEvent.isComposing) return;

      // Plain Tab cycles forward. Shift+Tab only joins the cycle while a
      // completion list is active; otherwise it stays with the focus trap.
      if (
        event.key === "Tab" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        (!event.shiftKey || hasCompletionSelection)
      ) {
        event.preventDefault();
        onComplete(event.shiftKey);
        return;
      }

      // Ctrl+? (or Ctrl+/) is the global help shortcut, handled before arrow/Enter logic.
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "?" || event.key === "/")
      ) {
        event.preventDefault();
        onHelp();
        return;
      }

      // Ctrl+C interrupts the line like a real shell: keep what was typed on
      // screen and move to a fresh prompt without running the command.
      if (
        event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        event.key.toLowerCase() === "c"
      ) {
        event.preventDefault();
        onInterrupt();
        return;
      }

      if (event.key === "Escape" && hasCompletionSelection) {
        event.preventDefault();
        onCancelCompletion();
        return;
      }

      // Only swallow the key when history actually handled it; otherwise native
      // caret navigation stays intact. Modified arrows are left alone too.
      if (
        (event.key === "ArrowUp" || event.key === "ArrowDown") &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey
      ) {
        const direction: HistoryDirection =
          event.key === "ArrowUp" ? "previous" : "next";
        if (onHistoryNavigate(direction)) event.preventDefault();
        return;
      }

      if (event.key !== "Enter") return;
      event.preventDefault();
      // First Enter accepts a highlighted completion; the next one submits.
      if (onAcceptCompletion()) return;
      onSubmit();
    },
    [
      onComplete,
      onHelp,
      onInterrupt,
      onHistoryNavigate,
      onSubmit,
      onAcceptCompletion,
      onCancelCompletion,
      hasCompletionSelection,
    ],
  );
}
