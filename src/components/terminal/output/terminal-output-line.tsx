import { cn } from "@/lib/utils";

import { LINE_CLASSNAME } from "../shared";

interface TerminalOutputLineProps {
  text: string;
  isError?: boolean;
}

export function TerminalOutputLine({ text, isError }: TerminalOutputLineProps) {
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
