import { cn } from "@/lib/utils";

import { getPromptWidth, LINE_CLASSNAME } from "../constants";
import { CommandHighlight } from "./command-highlight";
import { TerminalPrompt } from "./terminal-prompt";

interface TerminalInputLineProps {
  text: string;
  prompt: string;
}

export function TerminalInputLine({ text, prompt }: TerminalInputLineProps) {
  return (
    <div className="relative w-full min-w-0">
      <TerminalPrompt prompt={prompt} />
      <div
        className={cn(LINE_CLASSNAME, "min-w-0")}
        style={{ textIndent: getPromptWidth(prompt) }}
      >
        <CommandHighlight value={text} />
      </div>
    </div>
  );
}
