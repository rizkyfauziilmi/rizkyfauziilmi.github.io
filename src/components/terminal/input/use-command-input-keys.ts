import {
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import type { HistoryDirection } from "@/hooks";

interface UseCommandInputKeysOptions {
  onHelp: () => void;
  onHistoryNavigate: (direction: HistoryDirection) => boolean;
  onSubmit: () => void;
}

/** Keyboard shortcuts for the terminal prompt, kept out of the render layer. */
export function useCommandInputKeys({
  onHelp,
  onHistoryNavigate,
  onSubmit,
}: UseCommandInputKeysOptions) {
  return useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
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
    [onHelp, onHistoryNavigate, onSubmit],
  );
}
