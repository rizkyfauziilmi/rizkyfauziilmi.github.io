import { useCallback, useEffect, useReducer } from "react";

import type { Project } from "../data";
import { isTypingTarget } from "./keyboard";

export type ProjectsTuiState = {
  selectedIndex: number;
  expandedId: string | null;
};

export type ProjectsTuiAction =
  | { type: "move"; delta: number; length: number }
  | { type: "select"; index: number; id: string }
  | { type: "toggle"; id: string }
  | { type: "close-detail" };

export function createInitialTuiState(): ProjectsTuiState {
  return { selectedIndex: 0, expandedId: null };
}

export function projectsTuiReducer(
  state: ProjectsTuiState,
  action: ProjectsTuiAction,
): ProjectsTuiState {
  switch (action.type) {
    case "move": {
      // The full-screen detail view owns the keyboard; no list navigation there.
      if (state.expandedId !== null || action.length <= 0) return state;
      const offset =
        ((action.delta % action.length) + action.length) % action.length;
      return {
        ...state,
        selectedIndex: (state.selectedIndex + offset) % action.length,
      };
    }
    case "select": {
      if (action.index !== state.selectedIndex) {
        return { selectedIndex: action.index, expandedId: null };
      }
      return {
        ...state,
        expandedId: state.expandedId === action.id ? null : action.id,
      };
    }
    case "toggle":
      return {
        ...state,
        expandedId: state.expandedId === action.id ? null : action.id,
      };
    case "close-detail":
      return state.expandedId === null ? state : { ...state, expandedId: null };
  }
}

export function useProjectsTui(projects: Project[], onExit: () => void) {
  const [state, dispatch] = useReducer(
    projectsTuiReducer,
    undefined,
    createInitialTuiState,
  );

  // The shell input is unmounted while the TUI is active, so the window owns
  // navigation keys. The listener is installed only for the TUI's lifetime.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.isComposing ||
        event.altKey ||
        event.metaKey ||
        isTypingTarget(event.target)
      ) {
        return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const inDetail = state.expandedId !== null;

      // Ctrl+C quits the TUI from any view, like a normal terminal app.
      if (event.ctrlKey) {
        if (key === "c") {
          event.preventDefault();
          onExit();
        }
        return;
      }

      if (inDetail) {
        if (key === "Escape" || key === "q") {
          event.preventDefault();
          dispatch({ type: "close-detail" });
        }
        return;
      }

      if (key === "ArrowDown" || key === "j") {
        event.preventDefault();
        dispatch({ type: "move", delta: 1, length: projects.length });
        return;
      }

      if (key === "ArrowUp" || key === "k") {
        event.preventDefault();
        dispatch({ type: "move", delta: -1, length: projects.length });
        return;
      }

      if (key === "Enter") {
        event.preventDefault();
        const selected = projects[state.selectedIndex];
        if (selected) dispatch({ type: "toggle", id: selected.id });
        return;
      }

      if (key === "q") {
        event.preventDefault();
        onExit();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onExit, projects, state.expandedId, state.selectedIndex]);

  const selectAt = useCallback(
    (index: number, id: string) => dispatch({ type: "select", index, id }),
    [],
  );
  const closeDetail = useCallback(() => dispatch({ type: "close-detail" }), []);

  return { ...state, selectAt, closeDetail };
}
