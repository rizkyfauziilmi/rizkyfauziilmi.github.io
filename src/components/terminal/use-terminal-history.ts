import { useState } from "react";

import { runCommand } from "./commands";

export type TerminalView = "about";

export type TerminalEntry = {
  id: number;
  kind: "input" | "output";
  text: string;
  view?: TerminalView;
  isError?: boolean;
};

export function useTerminalHistory() {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);

  const submit = (command: string) => {
    const result = runCommand(command);

    if (result.type === "clear") {
      setEntries([]);
      return true;
    }

    setEntries((current) => {
      const id = current.length ? current[current.length - 1].id + 1 : 0;
      const inputEntry: TerminalEntry = { id, kind: "input", text: command };

      if (result.type === "blank") return [...current, inputEntry];

      const outputEntry: TerminalEntry =
        result.type === "component"
          ? { id: id + 1, kind: "output", text: "", view: result.view }
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
