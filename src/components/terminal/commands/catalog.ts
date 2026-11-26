import type { CompletionCatalog } from "./complete";
import { getDeclaredFlags, getHelpTokens } from "./flags";
import { COMMAND_DEFINITIONS } from "./registry";

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
