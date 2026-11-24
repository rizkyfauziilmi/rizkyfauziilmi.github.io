import { useCallback, useEffect, useReducer } from "react";

import { useTheme } from "@/components/theme-context";
import { runCommand } from "@/components/terminal/commands";
import { createInitialSession, sessionReducer } from "@/components/terminal/session";

const REBOOT_DELAY_MS = 1_000;
const CLOSE_FALLBACK_MS = 250;

export function useTerminalHistory() {
  const { setTheme } = useTheme();
  const [session, dispatch] = useReducer(
    sessionReducer,
    undefined,
    createInitialSession,
  );

  // Lifecycle timers are derived from pendingAction: replacing or cancelling an
  // action cleans up the previous timer without juggling refs in the handler.
  useEffect(() => {
    const action = session.pendingAction;
    if (!action) return;

    if (action.kind === "reboot") {
      const timer = setTimeout(
        () => window.location.reload(),
        REBOOT_DELAY_MS,
      );
      return () => clearTimeout(timer);
    }

    if (action.kind === "scheduled-shutdown") {
      const timer = setTimeout(
        () => dispatch({ type: "halt" }),
        action.delayMs,
      );
      return () => clearTimeout(timer);
    }

    // Browsers ignore close() for tabs they did not open, so keep a fallback.
    window.close();
    const timer = setTimeout(() => dispatch({ type: "halt" }), CLOSE_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [session.pendingAction]);

  const submit = useCallback(
    (command: string): boolean => {
      if (session.phase === "halted") return false;

      const result = runCommand(command);
      if (result.type === "theme") setTheme(result.mode);
      dispatch({ type: "submit", command, result });
      return true;
    },
    [session.phase, setTheme],
  );

  const powerOn = useCallback(() => window.location.reload(), []);

  return {
    entries: session.entries,
    commands: session.commands,
    isHalted: session.phase === "halted",
    submit,
    powerOn,
  };
}
