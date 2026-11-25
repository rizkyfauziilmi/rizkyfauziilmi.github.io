import { useCallback, type RefObject } from "react";

import { useCommandHistory } from "./use-command-history";
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
  const { value, changeValue, navigate, reset } = useCommandHistory(
    commands,
    inputRef,
  );

  const execute = useCallback(
    (command: string) => {
      if (!submit(command)) return;
      reset();
      focusInput();
    },
    [submit, reset, focusInput],
  );

  const runValue = useCallback(() => execute(value), [execute, value]);
  const runHelp = useCallback(() => execute("help"), [execute]);
  const leaveTui = useCallback(() => {
    exitTui();
    focusInput();
  }, [exitTui, focusInput]);

  return {
    entries,
    value,
    isHalted,
    activeTui,
    changeValue,
    navigate,
    runValue,
    runHelp,
    leaveTui,
    powerOn,
  };
}
