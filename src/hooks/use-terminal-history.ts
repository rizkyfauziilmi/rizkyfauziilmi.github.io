import { useCallback, useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/theme-provider";
import { runCommand, type CommandResult } from "@/components/terminal/commands";
import type { TerminalEntry } from "@/components/terminal/types";

const REBOOT_DELAY_MS = 1_000;
const CLOSE_FALLBACK_MS = 250;

function buildOutputEntry(id: number, result: CommandResult): TerminalEntry {
  switch (result.type) {
    case "component":
      return { id, kind: "output", text: "", view: result.view };
    case "theme":
      return {
        id,
        kind: "output",
        text: result.text,
        view: "theme",
        themeMode: result.mode,
      };
    case "output":
      return { id, kind: "output", text: result.text, isError: result.isError };
    case "reboot":
    case "shutdown":
      return { id, kind: "output", text: result.text };
    case "blank":
    case "clear":
    case "shutdown-cancel":
      return { id, kind: "output", text: "" };
  }
}

export function useTerminalHistory() {
  const { setTheme } = useTheme();
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  // Kept separately from entries: "clear" wipes the screen but history survives.
  const [commands, setCommands] = useState<string[]>([]);
  const [isHalted, setIsHalted] = useState(false);
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (actionTimerRef.current !== null) clearTimeout(actionTimerRef.current);
    if (fallbackTimerRef.current !== null) clearTimeout(fallbackTimerRef.current);
    actionTimerRef.current = null;
    fallbackTimerRef.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const powerOff = useCallback(() => {
    // Browsers ignore close() for tabs they did not open, so keep a fallback.
    window.close();
    fallbackTimerRef.current = setTimeout(() => setIsHalted(true), CLOSE_FALLBACK_MS);
  }, []);

  const submit = (command: string): boolean => {
    if (isHalted) return false;

    const result = runCommand(command);
    let entryResult: CommandResult = result;

    // Record every non-blank submission, including errors and "clear", like a real shell.
    if (command.trim()) {
      setCommands((current) => [...current, command]);
    }

    if (result.type === "clear") {
      setEntries([]);
      return true;
    }

    if (result.type === "theme") {
      setTheme(result.mode);
    }

    // Only lifecycle commands replace an already scheduled action.
    if (result.type === "reboot") {
      clearTimers();
      actionTimerRef.current = setTimeout(
        () => window.location.reload(),
        REBOOT_DELAY_MS,
      );
    }

    if (result.type === "shutdown") {
      clearTimers();
      // A delayed close() is always blocked once user activation is gone.
      actionTimerRef.current = setTimeout(
        () => (result.delayMs === 0 ? powerOff() : setIsHalted(true)),
        result.delayMs,
      );
    }

    if (result.type === "shutdown-cancel") {
      const hadPending = actionTimerRef.current !== null;
      clearTimers();
      entryResult = {
        type: "output",
        text: hadPending ? "Shutdown cancelled." : "No shutdown scheduled.",
        isError: false,
      };
    }

    setEntries((current) => {
      const id = current.length ? current[current.length - 1].id + 1 : 0;
      const inputEntry: TerminalEntry = { id, kind: "input", text: command };

      if (entryResult.type === "blank") return [...current, inputEntry];

      return [...current, inputEntry, buildOutputEntry(id + 1, entryResult)];
    });

    return true;
  };

  const powerOn = useCallback(() => {
    window.location.reload();
  }, []);

  return { entries, commands, submit, isHalted, powerOn };
}
