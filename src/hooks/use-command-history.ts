import {
  useCallback,
  useLayoutEffect,
  useReducer,
  type RefObject,
} from "react";

export type HistoryDirection = "previous" | "next";

type CommandHistoryState = {
  value: string;
  // Text from before history browsing: scopes prefix filtering and is restored
  // when navigating past the newest entry.
  draft: string;
  // null means "not browsing history"; otherwise it points into commands[].
  activeIndex: number | null;
  // Incremented on every programmatic caret move so React does not skip the
  // effect when the new text happens to equal the old text.
  caretRequestId: number;
  // null means "end of input"; completion supplies an explicit position.
  caretIndex: number | null;
};

type CommandHistoryAction =
  | { type: "change"; value: string }
  | {
      type: "replace";
      value: string;
      caret: number;
    }
  | { type: "recall"; value: string; index: number | null }
  | { type: "reset" };

function createInitialState(): CommandHistoryState {
  return {
    value: "",
    draft: "",
    activeIndex: null,
    caretRequestId: 0,
    caretIndex: null,
  };
}

function reducer(
  state: CommandHistoryState,
  action: CommandHistoryAction,
): CommandHistoryState {
  switch (action.type) {
    case "change":
      return {
        ...state,
        value: action.value,
        draft: action.value,
        activeIndex: null,
        caretIndex: null,
      };
    case "replace":
      return {
        ...state,
        value: action.value,
        draft: action.value,
        activeIndex: null,
        caretRequestId: state.caretRequestId + 1,
        caretIndex: action.caret,
      };
    case "recall":
      return {
        value: action.value,
        draft: state.draft,
        activeIndex: action.index,
        caretRequestId: state.caretRequestId + 1,
        caretIndex: null,
      };
    case "reset":
      return {
        ...createInitialState(),
        caretRequestId: state.caretRequestId,
      };
  }
}

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
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const changeValue = useCallback((next: string) => {
    dispatch({ type: "change", value: next });
  }, []);

  // Completion changes the value but also owns where the caret should land.
  const replaceValue = useCallback((next: string, caret: number) => {
    dispatch({ type: "replace", value: next, caret });
  }, []);

  const navigate = useCallback(
    (direction: HistoryDirection) => {
      const nextIndex = findCommandIndex(
        commands,
        direction,
        state.activeIndex,
        state.draft,
      );

      if (nextIndex === null) {
        if (direction === "next" && state.activeIndex !== null) {
          dispatch({ type: "recall", value: state.draft, index: null });
          return true;
        }
        // Returning false lets the caller skip preventDefault, so the textarea
        // moves the caret normally when history has nothing to offer.
        return false;
      }

      dispatch({
        type: "recall",
        value: commands[nextIndex],
        index: nextIndex,
      });
      return true;
    },
    [commands, state.activeIndex, state.draft],
  );

  const reset = useCallback(() => {
    dispatch({ type: "reset" });
  }, []);

  useLayoutEffect(() => {
    if (state.caretRequestId === 0) return;

    const input = inputRef.current;
    if (!input) return;

    const target = state.caretIndex ?? input.value.length;
    input.setSelectionRange(target, target);
  }, [state.caretRequestId, state.caretIndex, inputRef]);

  return { value: state.value, changeValue, replaceValue, navigate, reset };
}
