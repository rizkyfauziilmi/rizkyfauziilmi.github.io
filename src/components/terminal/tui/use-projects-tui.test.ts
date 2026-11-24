import { act, renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createInitialTuiState, projectsTuiReducer, useProjectsTui } from "./use-projects-tui";

const PROJECTS = Array.from({ length: 4 }, (_, index) => ({
  id: `project-${index}`,
  title: `Project ${index}`,
  description: `Description ${index}`,
  tech: [],
  year: 2026,
  image: "",
}));

describe("projectsTuiReducer", () => {
  it("wraps navigation in both directions", () => {
    let state = createInitialTuiState();
    state = projectsTuiReducer(state, { type: "move", delta: -1, length: 4 });
    expect(state.selectedIndex).toBe(3);

    state = projectsTuiReducer(state, { type: "move", delta: 1, length: 4 });
    expect(state.selectedIndex).toBe(0);
  });

  it("ignores movement when there are no projects", () => {
    const state = createInitialTuiState();
    expect(projectsTuiReducer(state, { type: "move", delta: 1, length: 0 })).toBe(
      state,
    );
  });

  it("opens and closes the full-screen detail view", () => {
    let state = createInitialTuiState();
    const id = PROJECTS[0].id;

    state = projectsTuiReducer(state, { type: "toggle", id });
    expect(state.expandedId).toBe(id);

    state = projectsTuiReducer(state, { type: "close-detail" });
    expect(state.expandedId).toBeNull();
    expect(projectsTuiReducer(state, { type: "close-detail" })).toBe(state);
  });

  it("does not navigate while the detail view is open", () => {
    const state = projectsTuiReducer(createInitialTuiState(), {
      type: "toggle",
      id: PROJECTS[0].id,
    });

    expect(
      projectsTuiReducer(state, { type: "move", delta: 1, length: 4 }),
    ).toBe(state);
  });

  it("selecting another row moves the cursor and closes detail", () => {
    let state = projectsTuiReducer(createInitialTuiState(), {
      type: "toggle",
      id: PROJECTS[0].id,
    });

    state = projectsTuiReducer(state, {
      type: "select",
      index: 2,
      id: PROJECTS[2].id,
    });

    expect(state).toEqual({ selectedIndex: 2, expandedId: null });
  });

  it("clicking the already selected row toggles its detail", () => {
    const state = createInitialTuiState();

    const opened = projectsTuiReducer(state, {
      type: "select",
      index: 0,
      id: PROJECTS[0].id,
    });
    const closed = projectsTuiReducer(opened, {
      type: "select",
      index: 0,
      id: PROJECTS[0].id,
    });

    expect(opened.expandedId).toBe(PROJECTS[0].id);
    expect(closed.expandedId).toBeNull();
  });
});

describe("useProjectsTui", () => {
  it("navigates, expands, and exits from the keyboard", () => {
    const onExit = vi.fn();
    const { result } = renderHook(() => useProjectsTui(PROJECTS, onExit));

    act(() => fireEvent.keyDown(window, { key: "ArrowDown" }));
    expect(result.current.selectedIndex).toBe(1);

    act(() => fireEvent.keyDown(window, { key: "j" }));
    expect(result.current.selectedIndex).toBe(2);

    act(() => fireEvent.keyDown(window, { key: "k" }));
    expect(result.current.selectedIndex).toBe(1);

    act(() => fireEvent.keyDown(window, { key: "Enter" }));
    expect(result.current.expandedId).toBe(PROJECTS[1].id);

    act(() => fireEvent.keyDown(window, { key: "Escape" }));
    expect(result.current.expandedId).toBeNull();

    act(() => fireEvent.keyDown(window, { key: "q" }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("exits with ctrl+c but not with other ctrl combinations", () => {
    const onExit = vi.fn();
    renderHook(() => useProjectsTui(PROJECTS, onExit));

    act(() => fireEvent.keyDown(window, { key: "a", ctrlKey: true }));
    expect(onExit).not.toHaveBeenCalled();

    act(() => fireEvent.keyDown(window, { key: "c", ctrlKey: true }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("steps back with Esc/q and quits with ctrl+c from detail", () => {
    const onExit = vi.fn();
    const { result } = renderHook(() => useProjectsTui(PROJECTS, onExit));

    act(() => fireEvent.keyDown(window, { key: "Enter" }));
    expect(result.current.expandedId).toBe(PROJECTS[0].id);

    act(() => fireEvent.keyDown(window, { key: "q" }));
    expect(result.current.expandedId).toBeNull();
    expect(onExit).not.toHaveBeenCalled();

    act(() => fireEvent.keyDown(window, { key: "Enter" }));
    act(() => fireEvent.keyDown(window, { key: "Escape" }));
    expect(result.current.expandedId).toBeNull();

    act(() => fireEvent.keyDown(window, { key: "Enter" }));
    act(() => fireEvent.keyDown(window, { key: "c", ctrlKey: true }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("ignores keys while composing or typing in a field", () => {
    const onExit = vi.fn();
    renderHook(() => useProjectsTui(PROJECTS, onExit));
    const input = document.createElement("input");
    document.body.append(input);

    try {
      act(() => fireEvent.keyDown(window, { key: "q", isComposing: true }));
      act(() => fireEvent.keyDown(input, { key: "q" }));
      expect(onExit).not.toHaveBeenCalled();
    } finally {
      input.remove();
    }
  });

  it("removes its window listener on unmount", () => {
    const onExit = vi.fn();
    const { unmount } = renderHook(() => useProjectsTui(PROJECTS, onExit));

    unmount();
    act(() => fireEvent.keyDown(window, { key: "q" }));

    expect(onExit).not.toHaveBeenCalled();
  });
});
