import { PORTFOLIO } from "./portfolio";

export const THEME_MODES = ["dark", "light", "system"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export type CommandResult =
  | { type: "output"; text: string; isError: boolean }
  | { type: "component"; view: "about" }
  | { type: "theme"; mode: ThemeMode; text: string }
  | { type: "clear" }
  | { type: "blank" };

type CommandArgument = {
  name: string;
  description: string;
};

type CommandDefinition = {
  name: string;
  description: string;
  usageArgs?: string;
  arguments?: CommandArgument[];
  acceptsArgs?: boolean;
  run: (args: string[]) => CommandResult;
};

const COMMAND_DEFINITIONS: CommandDefinition[] = [
  {
    name: "about",
    description: "Show a short introduction",
    run: () => ({ type: "component", view: "about" }),
  },
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
  {
    name: "theme",
    description: "Set the color theme",
    usageArgs: "<dark|light|system>",
    arguments: [
      { name: "dark", description: "Use the dark theme" },
      { name: "light", description: "Use the light theme" },
      { name: "system", description: "Follow the system preference" },
    ],
    acceptsArgs: true,
    run: (args) => {
      const [mode] = args;
      if (args.length === 1 && isThemeMode(mode)) {
        return { type: "theme", mode, text: `Theme set to ${mode}` };
      }

      return {
        type: "output",
        text: "(error) theme: expected 'dark', 'light', or 'system'...",
        isError: true,
      };
    },
  },
];

export const COMMANDS = COMMAND_DEFINITIONS.map(({ name }) => name);

function isThemeMode(value: string | undefined): value is ThemeMode {
  return THEME_MODES.includes(value as ThemeMode);
}

function getCommandLabel(command: CommandDefinition) {
  return command.usageArgs
    ? `${command.name} ${command.usageArgs}`
    : command.name;
}

function buildHelpOutput() {
  const width =
    Math.max(...COMMAND_DEFINITIONS.map(({ name, usageArgs }) =>
      `${name}${usageArgs ? ` ${usageArgs}` : ""}`.length,
    )) + 5;
  const commands = COMMAND_DEFINITIONS.map((command) =>
    `  ${getCommandLabel(command).padEnd(width)}${command.description}`,
  ).join("\n");

  return `Portfolio Terminal (${PORTFOLIO.version}) - interactive command prompt.

Usage: <command> [...flags] [...args]

Commands:
${commands}

  ${"<command> -h".padEnd(width)}Print help text for a command

Flags:
  ${"-h, --help".padEnd(width)}Display this menu and exit`;
}

function buildCommandHelp(command: CommandDefinition) {
  const argumentsBlock = command.arguments?.length
    ? `
Arguments:
${command.arguments
  .map(({ name, description }) => `  ${name.padEnd(9)}${description}`)
  .join("\n")}
`
    : "";

  return `${command.description}

Usage: ${getCommandLabel(command)}
${argumentsBlock}
Flags:
  -h, --help   Display this help text`;
}

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

  if (isHelpRequest(args)) {
    return { type: "output", text: buildCommandHelp(command), isError: false };
  }

  if (args.length > 0 && !command.acceptsArgs) {
    return rejectArguments(command);
  }

  return command.run(args);
}
