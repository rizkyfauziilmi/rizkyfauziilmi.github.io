import type { CommandDefinition } from "./types";

export type HelpCommand = {
  name: string;
  usageArgs?: string;
  label: string;
  description: string;
};

export type HelpTipPart =
  | { type: "key"; value: string }
  | { type: "text"; value: string };

export type HelpModel = {
  version: string;
  commands: HelpCommand[];
  tips: HelpTipPart[][];
};

const key = (value: string): HelpTipPart => ({ type: "key", value });
const text = (value: string): HelpTipPart => ({ type: "text", value });

export const HELP_TIPS: HelpTipPart[][] = [
  [key("Tab"), text(" completes a command or lists matches when ambiguous")],
  [key("Ctrl"), key("?"), text(" shows this menu")],
  [key("↑"), key("↓"), text(" browse commands from your history")],
  [
    text("type a prefix (e.g. th), then "),
    key("↑"),
    text(" to filter matches"),
  ],
  [text("classic Unix troublemakers still hang around here")],
];

export function getCommandLabel(command: CommandDefinition) {
  return command.usageArgs
    ? `${command.name} ${command.usageArgs}`
    : command.name;
}

/** Plain, serializable data for the HelpOutput component. */
export function buildHelpModel(commands: CommandDefinition[]): HelpModel {
  return {
    version: __APP_VERSION__,
    // Hidden commands are still runnable, but never advertised in help.
    commands: commands
      .filter((command) => !command.hidden)
      .map((command) => ({
        name: command.name,
        usageArgs: command.usageArgs,
        label: getCommandLabel(command),
        description: command.description,
      })),
    tips: HELP_TIPS,
  };
}

export function buildCommandHelp(command: CommandDefinition) {
  const argumentsBlock = command.arguments?.length
    ? `
Arguments:
${command.arguments
  .map(({ name, description }) => `  ${name.padEnd(9)}${description}`)
  .join("\n")}
`
    : "";

  const examplesBlock = command.examples?.length
    ? `
Examples:
${command.examples.map((example) => `  ${example}`).join("\n")}
`
    : "";

  return `${command.description}

Usage: ${getCommandLabel(command)}
${argumentsBlock}${examplesBlock}
Flags:
  -h, --help   Display this help text`;
}
