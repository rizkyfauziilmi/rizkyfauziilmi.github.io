import { cn } from "@/lib/utils";

import { LINE_CLASSNAME, PROMPT, TERMINAL_INDENT } from "../constants";
import { CommandHighlight } from "./command-highlight";
import { TerminalPrompt } from "./terminal-prompt";

export function TerminalInputLine({ text }: { text: string }) {
  return (
    <div className="relative w-full min-w-0">
      <TerminalPrompt prompt={PROMPT} />
      <div
        className={cn(LINE_CLASSNAME, "min-w-0")}
        style={{ textIndent: TERMINAL_INDENT }}
      >
        <CommandHighlight value={text} />
      </div>
    </div>
  );
}
