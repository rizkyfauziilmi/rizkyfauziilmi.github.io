export {
  COMMAND_CATALOG,
  createCompletionCatalog,
  KNOWN_COMMAND_NAMES,
} from "./catalog";
export {
  applyCandidate,
  completeCommand,
  getCompletionSpan,
  type CommandCompletion,
  type CompletionCatalog,
  type CompletionSpan,
} from "./complete";
export { runCommand } from "./run";

export type {
  CommandDefinition,
  ComponentView,
  CommandContext,
  CommandResult,
  ThemeMode,
  TuiView,
} from "./types";
