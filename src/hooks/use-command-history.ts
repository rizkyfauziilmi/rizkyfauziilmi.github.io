import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type HistoryDirection = "previous" | "next";

// Always filter by the original draft, not the recalled text, so repeated
// ArrowUp keeps the same search scope.
function findCommandIndex(
  commands: string[],
  direction: HistoryDirection,
  currentIndex: number | null,
  prefix: string,
) {
  if (direction === "previous") {
    const start = currentIndex ?? commands.length;
    for (let index = start - 1; index >= 0; index -= 1) {
      if (commands[index].startsWith(prefix)) return index;
    }
    return null;
  }

  if (currentIndex === null) return null;

  for (let index = currentIndex + 1; index < commands.length; index += 1) {
    if (commands[index].startsWith(prefix)) return index;
  }
  return null;
}

export function useCommandHistory(
  commands: string[],
  inputRef: RefObject<HTMLTextAreaElement | null>,
) {
  const [value, setValue] = useState("");
  // null means "not browsing history"; otherwise it points into commands[].
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const draftRef = useRef("");
  const pendingCaretRef = useRef(false);

  const changeValue = useCallback((next: string) => {
    draftRef.current = next;
    setActiveIndex(null);
    setValue(next);
  }, []);

  const moveCaretToEnd = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const end = input.value.length;
    input.setSelectionRange(end, end);
  }, [inputRef]);

  const selectCommand = useCallback(
    (nextValue: string, nextIndex: number | null) => {
      pendingCaretRef.current = true;
      setActiveIndex(nextIndex);
      setValue(nextValue);
      // rAF covers the case where React bails out because the recalled text
      // equals the current value, so the layout effect would not run.
      requestAnimationFrame(moveCaretToEnd);
    },
    [moveCaretToEnd],
  );

  const navigate = useCallback(
    (direction: HistoryDirection) => {
      const prefix = draftRef.current;
      const nextIndex = findCommandIndex(
        commands,
        direction,
        activeIndex,
        prefix,
      );

      if (nextIndex === null) {
        if (direction === "next" && activeIndex !== null) {
          selectCommand(prefix, null);
          return true;
        }
        // Returning false lets the caller skip preventDefault, so the textarea
        // moves the caret normally when history has nothing to offer.
        return false;
      }

      selectCommand(commands[nextIndex], nextIndex);
      return true;
    },
    [activeIndex, commands, selectCommand],
  );

  const reset = useCallback(() => {
    draftRef.current = "";
    setActiveIndex(null);
    setValue("");
  }, []);

  useLayoutEffect(() => {
    if (!pendingCaretRef.current) return;
    pendingCaretRef.current = false;
    moveCaretToEnd();
  }, [moveCaretToEnd, value]);

  return { value, changeValue, navigate, reset };
}
