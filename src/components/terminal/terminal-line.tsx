import { cn } from "cn";

import { TerminalPrompt } from "./terminal-prompt";

const LINE_CLASSNAME =
  "min-h-[1lh] break-words whitespace-pre-wrap text-sm leading-5";

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

interface TerminalOutputLineProps {
  text: string;
  isError?: boolean;
}

export function TerminalOutputLine({
  text,
  isError,
}: TerminalOutputLineProps) {
  return (
    <div
      className={cn(
        LINE_CLASSNAME,
        isError ? "text-destructive" : "text-foreground",
      )}
    >
      {text}
    </div>
  );
}
