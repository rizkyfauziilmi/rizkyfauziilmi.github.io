import { cn } from "@/lib/utils";

import { LINE_CLASSNAME, TERMINAL_INDENT } from "../constants";

interface CommandSuggestionsProps {
  names: string[];
}

/** Transient Tab-completion hint. Lives after the prompt, never in history. */
export function CommandSuggestions({ names }: CommandSuggestionsProps) {
  if (names.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-command-suggestions=""
      className={cn(LINE_CLASSNAME, "text-muted-foreground")}
      style={{ paddingLeft: TERMINAL_INDENT }}
    >
      <span className="text-foreground/70">Tab:</span> {names.join("  ")}
    </div>
  );
}
