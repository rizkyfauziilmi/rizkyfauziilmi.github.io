import type { CommandResult, TuiView } from "./commands";
import type { TerminalEntry } from "./types";

export type PendingAction =
  | { kind: "reboot" }
  | { kind: "shutdown-now" }
  | { kind: "scheduled-shutdown"; delayMs: number }
  | null;

export type SessionState = {
  entries: TerminalEntry[];
  commands: string[];
  phase: "running" | "halted";
  pendingAction: PendingAction;
  activeTui: TuiView | null;
  // Never reset on clear: React keys must stay unique across a screen wipe.
  nextEntryId: number;
};

export type SessionAction =
  | { type: "submit"; command: string; result: CommandResult }
  | { type: "exit-tui" }
  | { type: "halt" };

export function createInitialSession(): SessionState {
  return {
    entries: [],
    commands: [],
    phase: "running",
    pendingAction: null,
    activeTui: null,
    nextEntryId: 0,
  };
}

export function buildOutputEntry(id: number, result: CommandResult): TerminalEntry {
  switch (result.type) {
    case "component":
      return { id, kind: "output", text: "", view: result.view };
    case "tui":
      // The TUI replaces the screen; only its input line is kept in history.
      return { id, kind: "output", text: "" };
    case "theme":
      return {
        id,
        kind: "output",
        text: result.text,
        view: "theme",
        themeMode: result.mode,
      };
    case "output":
      return { id, kind: "output", text: result.text, isError: result.isError };
    case "reboot":
    case "shutdown":
      return { id, kind: "output", text: result.text };
    case "blank":
    case "clear":
    case "shutdown-cancel":
      return { id, kind: "output", text: "" };
  }
}

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  if (action.type === "exit-tui") {
    return state.activeTui === null ? state : { ...state, activeTui: null };
  }

  if (action.type === "halt") {
    return { ...state, phase: "halted", pendingAction: null, activeTui: null };
  }

  // A TUI owns the keyboard until it exits, so shell submissions are ignored.
  if (state.phase === "halted" || state.activeTui !== null) return state;

  const { command, result } = action;
  // Record every non-blank submission, including errors and "clear", like a real shell.
  const commands = command.trim() ? [...state.commands, command] : state.commands;
  // `clear` renders no entry; `blank` and `tui` render only the input line.
  const consumedIds =
    result.type === "clear" ? 0 : result.type === "blank" || result.type === "tui" ? 1 : 2;
  const nextEntryId = state.nextEntryId + consumedIds;
  let entries = state.entries;
  let pendingAction = state.pendingAction;
  let activeTui: TuiView | null = state.activeTui;
  let entryResult: CommandResult = result;

  switch (result.type) {
    case "clear":
      entries = [];
      break;
    case "tui":
      activeTui = result.view;
      break;
    case "reboot":
      // Only lifecycle commands replace an already scheduled action.
      pendingAction = { kind: "reboot" };
      break;
    case "shutdown":
      pendingAction =
        result.delayMs === 0
          ? { kind: "shutdown-now" }
          : { kind: "scheduled-shutdown", delayMs: result.delayMs };
      break;
    case "shutdown-cancel": {
      const hadPending = pendingAction !== null;
      pendingAction = null;
      entryResult = {
        type: "output",
        text: hadPending ? "Shutdown cancelled." : "No shutdown scheduled.",
        isError: false,
      };
      break;
    }
    case "blank":
    default:
      break;
  }

  if (result.type !== "clear") {
    const inputEntry: TerminalEntry = {
      id: state.nextEntryId,
      kind: "input",
      text: command,
    };
    const hidesOutput =
      entryResult.type === "blank" || entryResult.type === "tui";
    entries = hidesOutput
      ? [...entries, inputEntry]
      : [...entries, inputEntry, buildOutputEntry(state.nextEntryId + 1, entryResult)];
  }

  return { ...state, entries, commands, pendingAction, activeTui, nextEntryId };
}
