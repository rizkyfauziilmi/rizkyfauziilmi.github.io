import { createDefaultCommandContext } from "./fetch";
import { wantsHelp } from "./flags";
import { buildCommandHelp } from "./help";
import { parseRedirect, tokenize } from "./parse";
import { COMMAND_DEFINITIONS } from "./registry";
import type { CommandContext, CommandDefinition, CommandResult } from "./types";

function rejectArguments(command: CommandDefinition): CommandResult {
  return {
    type: "output",
    text: `${command.name}: command does not accept arguments...`,
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
  const { command: line, redirect } = parseRedirect(raw);
  const [name, ...args] = tokenize(line);
  // Blank Enter still produces a result (an empty input line), never null.
  if (!name) return { type: "blank" };

  const command = COMMAND_DEFINITIONS.find((item) => item.name === name);
  if (!command) {
    return {
      type: "output",
      text: `${name}: command not found...`,
      isError: true,
    };
  }

  if (redirect && command.name !== "echo") {
    return {
      type: "output",
      text: `${command.name}: redirection is not supported...`,
      isError: true,
    };
  }

  // Help flags are checked before argument validation so "theme -h" is not
  // rejected as a bad argument.
  if (wantsHelp(command, args[0])) {
    return { type: "output", text: buildCommandHelp(command), isError: false };
  }

  // Eggs ignore stray arguments so "whoami -h" still runs the egg.
  if (isVisibleCommand(command) && args.length > 0 && !command.acceptsArgs) {
    return rejectArguments(command);
  }

  return command.run(args, redirect ? { ...context, redirect } : context);
}
