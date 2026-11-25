import { createDefaultCommandContext } from "./fetch";
import { buildCommandHelp } from "./help";
import { tokenize } from "./parse";
import { COMMAND_DEFINITIONS } from "./registry";
import type { CommandContext, CommandDefinition, CommandResult } from "./types";

export { completeCommand, type CommandCompletion } from "./complete";
export { THEME_MODES } from "./types";

// Every runnable command, including hidden eggs and aliases: highlighting must
// agree with runCommand about what the shell recognises.
export const KNOWN_COMMAND_NAMES: ReadonlySet<string> = new Set(
  COMMAND_DEFINITIONS.map((command) => command.name),
);

export type {
  ComponentView,
  CommandContext,
  CommandResult,
  ThemeMode,
  TuiView,
} from "./types";

function rejectArguments(command: CommandDefinition): CommandResult {
  return {
    type: "output",
    text: `(error) ${command.name}: command does not accept arguments...`,
    isError: true,
  };
}

function isHelpRequest(args: string[]) {
  const [first] = args;
  return first === "-h" || first === "--help" || first === "help";
}

function isVisibleCommand(command: CommandDefinition) {
  return !command.hidden;
}

// Eggs stay secret; echo treats help flags as ordinary text to print.
function showsCommandHelp(command: CommandDefinition) {
  return isVisibleCommand(command) && command.name !== "echo";
}

export function runCommand(
  raw: string,
  context: CommandContext = createDefaultCommandContext(),
): CommandResult {
  const [name, ...args] = tokenize(raw);
  // Blank Enter still produces a result (an empty input line), never null.
  if (!name) return { type: "blank" };

  const command = COMMAND_DEFINITIONS.find((item) => item.name === name);
  if (!command) {
    return {
      type: "output",
      text: `(error) ${name}: command not found...`,
      isError: true,
    };
  }

  // Help flags are checked before argument validation so "theme -h" is not
  // rejected as a bad argument.
  if (showsCommandHelp(command) && isHelpRequest(args)) {
    return { type: "output", text: buildCommandHelp(command), isError: false };
  }

  // Eggs ignore stray arguments so "whoami -h" still runs the egg.
  if (isVisibleCommand(command) && args.length > 0 && !command.acceptsArgs) {
    return rejectArguments(command);
  }

  return command.run(args, context);
}
