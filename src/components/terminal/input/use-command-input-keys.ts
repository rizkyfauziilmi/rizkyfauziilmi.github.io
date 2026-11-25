import {
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import type { HistoryDirection } from "@/hooks";

interface UseCommandInputKeysOptions {
  onComplete: () => void;
  onHelp: () => void;
  onHistoryNavigate: (direction: HistoryDirection) => boolean;
  onSubmit: () => void;
}

/** Keyboard shortcuts for the terminal prompt, kept out of the render layer. */
export function useCommandInputKeys({
  onComplete,
  onHelp,
  onHistoryNavigate,
  onSubmit,
}: UseCommandInputKeysOptions) {
  return useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (event.nativeEvent.isComposing) return;

      // Plain Tab is tab completion. Shift+Tab stays with the root focus trap.
      if (
        event.key === "Tab" &&
        !event.shiftKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        onComplete();
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
      onSubmit();
    },
    [onComplete, onHelp, onHistoryNavigate, onSubmit],
  );
}
