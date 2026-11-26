import { createDefaultCommandContext } from "./fetch";
import { isHelpToken, supportsHelpFlags } from "./flags";
import { buildCommandHelp } from "./help";
import { tokenize } from "./parse";
import { COMMAND_DEFINITIONS } from "./registry";
import type { CommandContext, CommandDefinition, CommandResult } from "./types";

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
