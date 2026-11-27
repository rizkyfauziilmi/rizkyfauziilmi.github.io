import { useCallback, useMemo, type RefObject } from "react";

import { createCompletionCatalog } from "@/components/terminal/commands";
import { INTERRUPT_MARKER } from "@/components/terminal/shared";
import { useCommandCompletion } from "./use-command-completion";
import {
  useCommandHistory,
  type HistoryDirection,
} from "./use-command-history";
import { useTerminalHistory } from "./use-terminal-history";

interface UseTerminalShellOptions {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  focusInput: () => void;
}

/**
 * Composes terminal session state with command-line input state. Keeping the
 * submit/reset/focus sequence here lets TerminalPane stay presentational.
 */
export function useTerminalShell({
  inputRef,
  focusInput,
}: UseTerminalShellOptions) {
  const {
    entries,
    commands,
    submit,
    interrupt,
    isHalted,
    activeTui,
    exitTui,
    powerOn,
    filesystem,
    cwd,
  } = useTerminalHistory();

  const catalog = useMemo(
    () => createCompletionCatalog(filesystem, cwd),
    [filesystem, cwd],
  );
  const {
    value,
    changeValue: setHistoryValue,
    replaceValue,
    navigate: navigateHistory,
    reset,
  } = useCommandHistory(commands, inputRef);
  const {
    complete,
    suggestions,
    activeSuggestion,
    hasSelection,
    acceptCompletion,
    clearSuggestions,
  } = useCommandCompletion({
    value,
    inputRef,
    catalog,
    replaceValue,
  });

  const changeValue = useCallback(
    (next: string) => {
      setHistoryValue(next);
      clearSuggestions();
    },
    [setHistoryValue, clearSuggestions],
  );

  const navigate = useCallback(
    (direction: HistoryDirection) => {
      const handled = navigateHistory(direction);
      if (handled) clearSuggestions();
      return handled;
    },
    [navigateHistory, clearSuggestions],
  );

  const execute = useCallback(
    (command: string) => {
      if (!submit(command)) return;
      reset();
      clearSuggestions();
      focusInput();
    },
    [submit, reset, clearSuggestions, focusInput],
  );

  const interruptLine = useCallback(() => {
    interrupt(`${value}${INTERRUPT_MARKER}`);
    reset();
    clearSuggestions();
    focusInput();
  }, [interrupt, value, reset, clearSuggestions, focusInput]);

  const runValue = useCallback(() => execute(value), [execute, value]);
  const runHelp = useCallback(() => execute("help"), [execute]);
  const leaveTui = useCallback(() => {
    exitTui();
    clearSuggestions();
    focusInput();
  }, [exitTui, clearSuggestions, focusInput]);

  return {
    entries,
    value,
    cwd,
    isHalted,
    activeTui,
    changeValue,
    navigate,
    complete,
    suggestions,
    activeSuggestion,
    hasSelection,
    acceptCompletion,
    clearSuggestions,
    interruptLine,
    runValue,
    runHelp,
    leaveTui,
    powerOn,
  };
}
