import { buildHelpOutput } from "./help";
import {
  isThemeMode,
  type CommandDefinition,
  type CommandResult,
} from "./types";

// Commands reject extra arguments unless they explicitly opt in with acceptsArgs.
export const COMMAND_DEFINITIONS: CommandDefinition[] = [
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
    // Pass the registry explicitly: help.ts must not import registry.ts or the
    // two modules would form a cycle.
    run: () => ({
      type: "output",
      text: buildHelpOutput(COMMAND_DEFINITIONS),
      isError: false,
    }),
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
    run: (args): CommandResult => {
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
