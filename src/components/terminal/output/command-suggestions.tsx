import { cn } from "@/lib/utils";

import { LINE_CLASSNAME } from "../constants";

interface CommandSuggestionsProps {
  names: string[];
  activeIndex?: number | null;
}

/** Transient Tab-completion hint. Lives after the prompt, never in history. */
export function CommandSuggestions({
  names,
  activeIndex = null,
}: CommandSuggestionsProps) {
  if (names.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-command-suggestions=""
      className={cn(LINE_CLASSNAME, "text-muted-foreground")}
    >
      <span className="text-foreground/70">Tab:</span>{" "}
      <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
        {names.map((name, index) => (
          <span
            key={name}
            data-active={index === activeIndex ? "" : undefined}
            className={cn(
              index === activeIndex &&
                "rounded-sm bg-muted px-1 text-foreground",
            )}
          >
            {name}
          </span>
        ))}
      </span>
      <span className="sr-only">
        {activeIndex !== null && names[activeIndex]
          ? ` Selected: ${names[activeIndex]}`
          : ""}
      </span>
    </div>
  );
}
