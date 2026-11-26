import { useCallback, useEffect, useReducer } from "react";

import { useTheme } from "@/components/theme";
import { downloadFile } from "@/components/terminal/download";
import {
  runCommand,
  type CommandContext,
} from "@/components/terminal/commands";
import {
  createInitialSession,
  sessionReducer,
} from "@/components/terminal/session";

const REBOOT_DELAY_MS = 1_000;
const CLOSE_FALLBACK_MS = 250;

function getPlatform() {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };
  return nav.userAgentData?.platform || navigator.platform || "Unknown";
}

export function useTerminalHistory() {
  const { theme, setTheme } = useTheme();
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
      const timer = setTimeout(() => window.location.reload(), REBOOT_DELAY_MS);
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
    const timer = setTimeout(
      () => dispatch({ type: "halt" }),
      CLOSE_FALLBACK_MS,
    );
    return () => clearTimeout(timer);
  }, [session.pendingAction]);

  const submit = useCallback(
    (command: string): boolean => {
      if (session.phase === "halted" || session.activeTui !== null)
        return false;

      const context: CommandContext = {
        theme,
        now: new Date(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        platform: getPlatform(),
        userAgent: navigator.userAgent,
        uptimeMs: performance.now(),
      };
      const result = runCommand(command, context);
      if (result.type === "theme") setTheme(result.mode);
      if (result.type === "download") void downloadFile(result);
      dispatch({ type: "submit", command, result });
      return true;
    },
    [session.phase, session.activeTui, theme, setTheme],
  );

  const interrupt = useCallback(
    (text: string) => dispatch({ type: "interrupt", text }),
    [],
  );
  const exitTui = useCallback(() => dispatch({ type: "exit-tui" }), []);
  const powerOn = useCallback(() => window.location.reload(), []);

  return {
    entries: session.entries,
    commands: session.commands,
    isHalted: session.phase === "halted",
    activeTui: session.activeTui,
    submit,
    interrupt,
    exitTui,
    powerOn,
  };
}
