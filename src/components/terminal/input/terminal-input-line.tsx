import { cn } from "@/lib/utils";

import { LINE_CLASSNAME } from "../constants";
import { TerminalPrompt } from "./terminal-prompt";

interface TerminalInputLineProps {
  prompt: string;
  text: string;
  indent: string;
}

export function TerminalInputLine({
  prompt,
  text,
  indent,
}: TerminalInputLineProps) {
  return (
    <div className="relative w-full min-w-0">
      <TerminalPrompt prompt={prompt} />
      <div
        className={cn(LINE_CLASSNAME, "min-w-0")}
        style={{ textIndent: indent }}
      >
        {text}
      </div>
    </div>
  );
}
