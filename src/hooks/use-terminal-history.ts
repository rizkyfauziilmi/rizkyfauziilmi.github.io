import { useState } from "react";

import { useTheme } from "@/components/theme-provider";
import { runCommand } from "@/components/terminal/commands";
import type { TerminalEntry } from "@/components/terminal/types";

export function useTerminalHistory() {
  const { setTheme } = useTheme();
  const [entries, setEntries] = useState<TerminalEntry[]>([]);

  const submit = (command: string) => {
    const result = runCommand(command);

    if (result.type === "clear") {
      setEntries([]);
      return true;
    }

    if (result.type === "theme") {
      setTheme(result.mode);
    }

    setEntries((current) => {
      const id = current.length ? current[current.length - 1].id + 1 : 0;
      const inputEntry: TerminalEntry = { id, kind: "input", text: command };

      if (result.type === "blank") return [...current, inputEntry];

      const outputEntry: TerminalEntry =
        result.type === "component"
          ? { id: id + 1, kind: "output", text: "", view: result.view }
          : result.type === "theme"
            ? {
                id: id + 1,
                kind: "output",
                text: result.text,
                view: "theme",
                themeMode: result.mode,
              }
            : {
                id: id + 1,
                kind: "output",
                text: result.text,
                isError: result.isError,
              };

      return [...current, inputEntry, outputEntry];
    });

    return true;
  };

  return { entries, submit };
}
