import { useCallback, useState, type RefObject } from "react";

import { completeCommand } from "@/components/terminal/commands";

interface UseCommandCompletionOptions {
  value: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  candidates: ReadonlySet<string>;
  replaceValue: (value: string, caret: number) => void;
}

/** Applies pure command completion and owns the transient suggestion hint. */
export function useCommandCompletion({
  value,
  inputRef,
  candidates,
  replaceValue,
}: UseCommandCompletionOptions) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  const complete = useCallback(() => {
    const caret = inputRef.current?.selectionStart ?? value.length;
    const result = completeCommand(value, caret, candidates);

    replaceValue(result.value, result.caret);
    setSuggestions(result.suggestions);
  }, [value, inputRef, candidates, replaceValue]);

  return { complete, suggestions, clearSuggestions };
}
