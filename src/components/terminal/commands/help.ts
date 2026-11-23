import { PORTFOLIO } from "../data/portfolio";
import type { CommandDefinition } from "./types";

// Aligned without padEnd: emoji glyphs are not one monospace cell wide.
const HISTORY_TIPS = [
  "💡 ↑ / ↓ browse commands from your history",
  '💡 type a prefix (e.g. th) then ↑ to filter matches',
].join("\n");

export function getCommandLabel(command: CommandDefinition) {
  return command.usageArgs
    ? `${command.name} ${command.usageArgs}`
    : command.name;
}

export function buildHelpOutput(commands: CommandDefinition[]) {
  // Width comes from the registry, so new commands need no manual realignment.
  const width =
    Math.max(...commands.map(({ name, usageArgs }) =>
      `${name}${usageArgs ? ` ${usageArgs}` : ""}`.length,
    )) + 5;
  const lines = commands.map(
    (command) =>
      `  ${getCommandLabel(command).padEnd(width)}${command.description}`,
  );

  return `Portfolio Terminal (${PORTFOLIO.version}) - interactive command prompt.

Usage: <command> [...flags] [...args]

Commands:
${lines.join("\n")}

  ${"<command> -h".padEnd(width)}Print help text for a command

Flags:
  ${"-h, --help".padEnd(width)}Display this menu and exit

Tips:
${HISTORY_TIPS}`;
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

  return `${command.description}

Usage: ${getCommandLabel(command)}
${argumentsBlock}
Flags:
  -h, --help   Display this help text`;
}
