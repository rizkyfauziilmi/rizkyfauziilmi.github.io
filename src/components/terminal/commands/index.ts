import type { CompletionCatalog } from "./complete";
import { createDefaultCommandContext } from "./fetch";
import {
  getDeclaredFlags,
  getHelpTokens,
  isHelpToken,
  supportsHelpFlags,
} from "./flags";
import { buildCommandHelp } from "./help";
import { tokenize } from "./parse";
import { COMMAND_DEFINITIONS } from "./registry";
import type { CommandContext, CommandDefinition, CommandResult } from "./types";

export {
  completeCommand,
  type CommandCompletion,
  type CompletionCatalog,
} from "./complete";
export { THEME_MODES } from "./types";

// Every runnable command, including hidden eggs and aliases: highlighting must
// agree with runCommand about what the shell recognises.
export const KNOWN_COMMAND_NAMES: ReadonlySet<string> = new Set(
  COMMAND_DEFINITIONS.map((command) => command.name),
);

/** Registry snapshot consumed by pure completion and the input hook. */
export const COMMAND_CATALOG: CompletionCatalog = {
  commandNames: KNOWN_COMMAND_NAMES,
  commands: new Map(
    COMMAND_DEFINITIONS.map((command) => [command.name, command]),
  ),
  flagsFor: (command, isFirstArgument) => [
    ...getDeclaredFlags(command).map((flag) => flag.name),
    ...(isFirstArgument ? getHelpTokens(command) : []),
  ],
};

export type {
  CommandDefinition,
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

function isVisibleCommand(command: CommandDefinition) {
  return !command.hidden;
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
  if (supportsHelpFlags(command) && isHelpToken(args[0])) {
    return { type: "output", text: buildCommandHelp(command), isError: false };
  }

  // Eggs ignore stray arguments so "whoami -h" still runs the egg.
  if (isVisibleCommand(command) && args.length > 0 && !command.acceptsArgs) {
    return rejectArguments(command);
  }

  return command.run(args, context);
}
