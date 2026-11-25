import { useCallback, useState, type RefObject } from "react";

import {
  applyCandidate,
  completeCommand,
  getCompletionSpan,
  type CompletionCatalog,
  type CompletionSpan,
} from "@/components/terminal/commands";

interface UseCommandCompletionOptions {
  value: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  catalog: CompletionCatalog;
  replaceValue: (value: string, caret: number) => void;
}

type CompletionSelection = {
  // Cycling always rebuilds from the text typed before the first Tab.
  baseValue: string;
  span: CompletionSpan;
  candidates: string[];
  index: number;
  // A manual caret move invalidates the cycling session.
  expectedCaret: number;
};

/** Applies pure completion and owns the transient, cyclable suggestion hint. */
export function useCommandCompletion({
  value,
  inputRef,
  catalog,
  replaceValue,
}: UseCommandCompletionOptions) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selection, setSelection] = useState<CompletionSelection | null>(null);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSelection(null);
  }, []);

  const complete = useCallback(
    (backward = false) => {
      const caret = inputRef.current?.selectionStart ?? value.length;

      if (
        selection &&
        caret === selection.expectedCaret &&
        selection.candidates.length > 1
      ) {
        // Highlight-only cycling: the input stays untouched until Enter.
        const offset = backward ? -1 : 1;
        const index =
          (selection.index + offset + selection.candidates.length) %
          selection.candidates.length;
        setSelection({ ...selection, index });
        return;
      }

      const result = completeCommand(value, caret, catalog);
      replaceValue(result.value, result.caret);
      setSuggestions(result.suggestions);
      setSelection(
        result.suggestions.length > 1
          ? {
              baseValue: value,
              span: getCompletionSpan(value, caret),
              candidates: result.suggestions,
              index: 0,
              expectedCaret: result.caret,
            }
          : null,
      );
    },
    [value, inputRef, catalog, replaceValue, selection],
  );

  const acceptCompletion = useCallback(() => {
    if (!selection) return false;

    const next = applyCandidate(
      selection.baseValue,
      selection.span,
      selection.candidates[selection.index],
    );
    replaceValue(next.value, next.caret);
    setSuggestions([]);
    setSelection(null);
    return true;
  }, [selection, replaceValue]);

  return {
    complete,
    suggestions,
    activeSuggestion: selection?.index ?? null,
    hasSelection: selection !== null,
    acceptCompletion,
    clearSuggestions,
  };
}
