export type CommandResult =
  | { type: "output"; text: string; isError: boolean }
  | { type: "clear" }
  | { type: "blank" };

type CommandDefinition = {
  name: string;
  description: string;
  acceptsArgs?: boolean;
  run: (args: string[]) => CommandResult;
};

const COMMAND_DEFINITIONS: CommandDefinition[] = [
  {
    name: "clear",
    description: "Clear the terminal screen",
    run: () => ({ type: "clear" }),
  },
  {
    name: "help",
    description: "Display this help message",
    run: () => ({ type: "output", text: buildHelpOutput(), isError: false }),
  },
];

export const COMMANDS = COMMAND_DEFINITIONS.map(({ name }) => name);

function buildHelpOutput() {
  const width =
    Math.max(...COMMAND_DEFINITIONS.map(({ name }) => name.length)) + 6;
  const commands = COMMAND_DEFINITIONS.map(
    ({ name, description }) => `  ${name.padEnd(width)}${description}`,
  ).join("\n");

  return `Portfolio Terminal (1.0.0) - interactive command prompt.

Usage: <command>

Commands:
${commands}`;
}

function rejectArguments(command: CommandDefinition): CommandResult {
  return {
    type: "output",
    text: `(error) ${command.name}: command does not accept arguments...`,
    isError: true,
  };
}

export function runCommand(raw: string): CommandResult {
  const trimmed = raw.trim();
  if (!trimmed) return { type: "blank" };

  const [name, ...args] = trimmed.split(/\s+/);
  const command = COMMAND_DEFINITIONS.find((item) => item.name === name);

  if (!command) {
    return {
      type: "output",
      text: `(error) ${name}: command not found...`,
      isError: true,
    };
  }

  if (args.length > 0 && !command.acceptsArgs) {
    return rejectArguments(command);
  }

  return command.run(args);
}
