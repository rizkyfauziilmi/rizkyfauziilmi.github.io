import type { CommandDefinition, CommandFlag } from "./types";

/** Flags shown in help and offered by completion for eligible commands. */
export const HELP_FLAGS: readonly CommandFlag[] = [
  { name: "-h", description: "Display this help text" },
  { name: "--help", description: "Display this help text" },
];

// "help" is accepted as a help request by runCommand, but it is not a flag and
// is kept out of completion so the hint only shows real switches.
const HELP_WORD = "help";

export function supportsHelpFlags(command: CommandDefinition) {
  return !command.hidden;
}

export function getDeclaredFlags(command: CommandDefinition) {
  return command.flags ?? [];
}

export function getHelpFlags(command: CommandDefinition) {
  return supportsHelpFlags(command) ? HELP_FLAGS : [];
}

export function getCommandFlags(command: CommandDefinition): CommandFlag[] {
  const flags = new Map<string, CommandFlag>();
  for (const flag of [...getDeclaredFlags(command), ...getHelpFlags(command)]) {
    flags.set(flag.name, flag);
  }
  return [...flags.values()];
}

export function getHelpTokens(command: CommandDefinition) {
  return supportsHelpFlags(command) ? HELP_FLAGS.map((flag) => flag.name) : [];
}

export function isHelpToken(value: string | undefined) {
  return value === HELP_WORD || HELP_FLAGS.some((flag) => flag.name === value);
}

/** Echo prints the word "help" literally instead of opening its own help. */
export function wantsHelp(
  command: CommandDefinition,
  value: string | undefined,
) {
  if (!supportsHelpFlags(command) || !isHelpToken(value)) return false;
  return !(command.name === "echo" && value === HELP_WORD);
}
