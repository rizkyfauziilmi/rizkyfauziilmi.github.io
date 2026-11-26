import { act, fireEvent, renderHook } from "@testing-library/react";
import { GitHub } from "@/components/svgs/github";
import { Gmail } from "@/components/svgs/gmail";
import { describe, expect, it, vi } from "vitest";

import type { ContactChannel } from "../data";
import {
  contactTuiReducer,
  createInitialContactTuiState,
  useContactTui,
} from "./use-contact-tui";

const CHANNELS: ContactChannel[] = [
  {
    id: "email",
    label: "Email",
    icon: Gmail,
    value: "dev@example.com",
    href: "mailto:dev@example.com",
    copyText: "dev@example.com",
    description: "Email",
  },
  {
    id: "github",
    label: "GitHub",
    icon: GitHub,
    value: "github.com/dev",
    description: "GitHub",
    copyText: "https://github.com/dev",
  },
];

describe("contactTuiReducer", () => {
  it("wraps navigation in both directions", () => {
    let state = createInitialContactTuiState();
    state = contactTuiReducer(state, { type: "move", delta: -1, length: 2 });
    expect(state.selectedIndex).toBe(1);

    state = contactTuiReducer(state, { type: "move", delta: 1, length: 2 });
    expect(state.selectedIndex).toBe(0);
  });

  it("ignores movement with no channels or while detail is open", () => {
    const empty = createInitialContactTuiState();
    expect(
      contactTuiReducer(empty, { type: "move", delta: 1, length: 0 }),
    ).toBe(empty);

    const open = contactTuiReducer(empty, { type: "toggle", id: "email" });
    expect(contactTuiReducer(open, { type: "move", delta: 1, length: 2 })).toBe(
      open,
    );
  });

  it("opens, closes, and switches detail rows", () => {
    let state = createInitialContactTuiState();
    state = contactTuiReducer(state, { type: "toggle", id: "email" });
    expect(state.expandedId).toBe("email");

    state = contactTuiReducer(state, {
      type: "select",
      index: 1,
      id: "github",
    });
    expect(state).toEqual({ selectedIndex: 1, expandedId: null });

    state = contactTuiReducer(state, { type: "toggle", id: "github" });
    state = contactTuiReducer(state, { type: "close-detail" });
    expect(state.expandedId).toBeNull();
    expect(contactTuiReducer(state, { type: "close-detail" })).toBe(state);
  });
});

describe("useContactTui", () => {
  it("navigates, expands, and exits from the keyboard", () => {
    const onExit = vi.fn();
    const { result } = renderHook(() => useContactTui(CHANNELS, onExit));

    act(() => fireEvent.keyDown(window, { key: "ArrowDown" }));
    expect(result.current.selectedIndex).toBe(1);

    act(() => fireEvent.keyDown(window, { key: "k" }));
    expect(result.current.selectedIndex).toBe(0);

    act(() => fireEvent.keyDown(window, { key: "j" }));
    expect(result.current.selectedIndex).toBe(1);

    act(() => fireEvent.keyDown(window, { key: "Enter" }));
    expect(result.current.expandedId).toBe("github");

    act(() => fireEvent.keyDown(window, { key: "Escape" }));
    expect(result.current.expandedId).toBeNull();

    act(() => fireEvent.keyDown(window, { key: "q" }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("uses q to go back from detail and ctrl+c to quit anywhere", () => {
    const onExit = vi.fn();
    const { result } = renderHook(() => useContactTui(CHANNELS, onExit));

    act(() => fireEvent.keyDown(window, { key: "Enter" }));
    expect(result.current.expandedId).toBe("email");

    act(() => fireEvent.keyDown(window, { key: "q" }));
    expect(result.current.expandedId).toBeNull();
    expect(onExit).not.toHaveBeenCalled();

    act(() => fireEvent.keyDown(window, { key: "a", ctrlKey: true }));
    expect(onExit).not.toHaveBeenCalled();

    act(() => fireEvent.keyDown(window, { key: "c", ctrlKey: true }));
    expect(onExit).toHaveBeenCalledOnce();
  });

  it("ignores composing and typing targets", () => {
    const onExit = vi.fn();
    renderHook(() => useContactTui(CHANNELS, onExit));
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

  it("removes its listener on unmount", () => {
    const onExit = vi.fn();
    const { unmount } = renderHook(() => useContactTui(CHANNELS, onExit));

    unmount();
    act(() => fireEvent.keyDown(window, { key: "q" }));

    expect(onExit).not.toHaveBeenCalled();
  });
});
