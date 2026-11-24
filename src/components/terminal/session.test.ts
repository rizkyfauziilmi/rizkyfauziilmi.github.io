import { describe, expect, it } from "vitest";

import { createInitialSession, sessionReducer } from "./session";

const output = (text: string) =>
  ({ type: "output" as const, text, isError: false }) as const;

describe("sessionReducer", () => {
  it("keeps entry ids unique after clear", () => {
    let state = createInitialSession();
    state = sessionReducer(state, {
      type: "submit",
      command: "help",
      result: output("help text"),
    });
    state = sessionReducer(state, {
      type: "submit",
      command: "clear",
      result: { type: "clear" },
    });
    state = sessionReducer(state, {
      type: "submit",
      command: "echo hi",
      result: output("hi"),
    });

    expect(state.entries.map((entry) => entry.id)).toEqual([2, 3]);
    expect(state.commands).toEqual(["help", "clear", "echo hi"]);
  });

  it("tracks and cancels a pending shutdown", () => {
    let state = createInitialSession();
    state = sessionReducer(state, {
      type: "submit",
      command: "shutdown +5",
      result: { type: "shutdown", delayMs: 300_000, text: "scheduled" },
    });
    expect(state.pendingAction).toEqual({
      kind: "scheduled-shutdown",
      delayMs: 300_000,
    });

    state = sessionReducer(state, {
      type: "submit",
      command: "shutdown -c",
      result: { type: "shutdown-cancel" },
    });

    expect(state.pendingAction).toBeNull();
    expect(state.entries.at(-1)?.text).toBe("Shutdown cancelled.");
  });

  it("ignores submissions once halted", () => {
    const halted = sessionReducer(createInitialSession(), { type: "halt" });
    const next = sessionReducer(halted, {
      type: "submit",
      command: "help",
      result: output("help text"),
    });

    expect(next).toBe(halted);
  });
});
