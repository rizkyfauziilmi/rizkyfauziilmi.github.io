import { useCallback, type RefObject } from "react";

import { COMMAND_CATALOG } from "@/components/terminal/commands";
import { useCommandCompletion } from "./use-command-completion";
import { useCommandHistory, type HistoryDirection } from "./use-command-history";
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
    isHalted,
    activeTui,
    exitTui,
    powerOn,
  } = useTerminalHistory();
  const {
    value,
    changeValue: setHistoryValue,
    replaceValue,
    navigate: navigateHistory,
    reset,
  } = useCommandHistory(commands, inputRef);
  const { complete, suggestions, clearSuggestions } = useCommandCompletion({
    value,
    inputRef,
    catalog: COMMAND_CATALOG,
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
    isHalted,
    activeTui,
    changeValue,
    navigate,
    complete,
    suggestions,
    runValue,
    runHelp,
    leaveTui,
    powerOn,
  };
}
