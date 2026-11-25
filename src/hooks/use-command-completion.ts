import { useCallback, useState, type RefObject } from "react";

import {
  completeCommand,
  type CompletionCatalog,
} from "@/components/terminal/commands";

interface UseCommandCompletionOptions {
  value: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  catalog: CompletionCatalog;
  replaceValue: (value: string, caret: number) => void;
}

/** Applies pure command completion and owns the transient suggestion hint. */
export function useCommandCompletion({
  value,
  inputRef,
  catalog,
  replaceValue,
}: UseCommandCompletionOptions) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  const complete = useCallback(() => {
    const caret = inputRef.current?.selectionStart ?? value.length;
    const result = completeCommand(value, caret, catalog);

    replaceValue(result.value, result.caret);
    setSuggestions(result.suggestions);
  }, [value, inputRef, catalog, replaceValue]);

  return { complete, suggestions, clearSuggestions };
}
