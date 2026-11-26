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

  it("activates and exits a tui without adding an output line", () => {
    let state = sessionReducer(createInitialSession(), {
      type: "submit",
      command: "projects",
      result: { type: "tui", view: "projects" },
    });

    expect(state.activeTui).toBe("projects");
    expect(state.entries).toEqual([{ id: 0, kind: "input", text: "projects" }]);
    expect(state.nextEntryId).toBe(1);

    const ignored = sessionReducer(state, {
      type: "submit",
      command: "help",
      result: output("help text"),
    });
    expect(ignored).toBe(state);

    state = sessionReducer(state, { type: "exit-tui" });
    expect(state.activeTui).toBeNull();
  });

  it("activates the contact tui without adding an output line", () => {
    let state = sessionReducer(createInitialSession(), {
      type: "submit",
      command: "contact",
      result: { type: "tui", view: "contact" },
    });

    expect(state.activeTui).toBe("contact");
    expect(state.entries).toEqual([{ id: 0, kind: "input", text: "contact" }]);

    state = sessionReducer(state, { type: "exit-tui" });
    expect(state.activeTui).toBeNull();
  });

  it("records the download status without opening a tui", () => {
    const state = sessionReducer(createInitialSession(), {
      type: "submit",
      command: "cv --download",
      result: {
        type: "download",
        url: "/cv.pdf",
        filename: "cv.pdf",
        text: "Downloading rizky-fauzi-ilmi-cv.pdf — updated 26 Nov 2026. Progress: see toast.",
      },
    });

    expect(state.activeTui).toBeNull();
    expect(state.entries).toEqual([
      { id: 0, kind: "input", text: "cv --download" },
      {
        id: 1,
        kind: "output",
        text: "Downloading rizky-fauzi-ilmi-cv.pdf — updated 26 Nov 2026. Progress: see toast.",
      },
    ]);
  });

  it("clears the active tui when halted", () => {
    const active = sessionReducer(createInitialSession(), {
      type: "submit",
      command: "projects",
      result: { type: "tui", view: "projects" },
    });

    expect(sessionReducer(active, { type: "halt" }).activeTui).toBeNull();
  });
});
