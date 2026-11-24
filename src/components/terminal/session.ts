import type { CommandResult } from "./commands";
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
  // Never reset on clear: React keys must stay unique across a screen wipe.
  nextEntryId: number;
};

export type SessionAction =
  | { type: "submit"; command: string; result: CommandResult }
  | { type: "halt" };

export function createInitialSession(): SessionState {
  return {
    entries: [],
    commands: [],
    phase: "running",
    pendingAction: null,
    nextEntryId: 0,
  };
}

export function buildOutputEntry(id: number, result: CommandResult): TerminalEntry {
  switch (result.type) {
    case "component":
      return { id, kind: "output", text: "", view: result.view };
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
  if (action.type === "halt") {
    return { ...state, phase: "halted", pendingAction: null };
  }

  if (state.phase === "halted") return state;

  const { command, result } = action;
  // Record every non-blank submission, including errors and "clear", like a real shell.
  const commands = command.trim() ? [...state.commands, command] : state.commands;
  // Clear renders no entry, so it does not consume an id.
  const consumedIds = result.type === "blank" ? 1 : result.type === "clear" ? 0 : 2;
  const nextEntryId = state.nextEntryId + consumedIds;
  let entries = state.entries;
  let pendingAction = state.pendingAction;
  let entryResult: CommandResult = result;

  switch (result.type) {
    case "clear":
      entries = [];
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
      break;
    default:
      break;
  }

  if (result.type !== "clear") {
    const inputEntry: TerminalEntry = {
      id: state.nextEntryId,
      kind: "input",
      text: command,
    };
    entries =
      entryResult.type === "blank"
        ? [...entries, inputEntry]
        : [...entries, inputEntry, buildOutputEntry(state.nextEntryId + 1, entryResult)];
  }

  return { ...state, entries, commands, pendingAction, nextEntryId };
}
