import { buildFetchOutput } from "./fetch";
import { buildCommandHelp } from "./help";
import { parseShutdown, SHUTDOWN_ERROR } from "./shutdown";
import {
  isThemeMode,
  type CommandDefinition,
  type CommandResult,
} from "./types";

const SHUTDOWN_COMMAND: CommandDefinition = {
  name: "shutdown",
  description: "Power off or schedule shutdown",
  usageArgs: "<now|+N|HH:MM|-c>",
  arguments: [
    {
      name: "now",
      description: "Power off immediately (only format that can close the tab)",
    },
    { name: "+N", description: "Minutes from now, e.g. +5 (+0 = now)" },
    {
      name: "HH:MM",
      description: "24-hour local time, e.g. 23:30 (tomorrow if past)",
    },
    { name: "-c", description: "Cancel a scheduled shutdown" },
  ],
  examples: ["shutdown now", "shutdown +5", "shutdown 23:30", "shutdown -c"],
  acceptsArgs: true,
  run: (args): CommandResult => {
    // Bare "shutdown" doubles as a format hint instead of an error.
    if (args.length === 0) {
      return {
        type: "output",
        text: buildCommandHelp(SHUTDOWN_COMMAND),
        isError: false,
      };
    }

    const plan = parseShutdown(args);
    switch (plan.kind) {
      case "now":
        return {
          type: "shutdown",
          delayMs: 0,
          text: "Closing tab now...",
        };
      case "scheduled":
        return {
          type: "shutdown",
          delayMs: plan.delayMs,
          text: plan.text,
        };
      case "cancel":
        return { type: "shutdown-cancel" };
      default:
        return { type: "output", text: SHUTDOWN_ERROR, isError: true };
    }
  },
};

const FETCH_COMMAND: CommandDefinition = {
  name: "neofetch",
  description: "Show system and portfolio info",
  run: (_args, context) => ({
    type: "output",
    text: buildFetchOutput(context),
    isError: false,
  }),
};

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
    name: "echo",
    description: "Print text to the terminal",
    usageArgs: "[text...]",
    arguments: [
      { name: "text", description: "Words to print; quotes group spaces" },
    ],
    examples: ['echo "hello world"'],
    acceptsArgs: true,
    run: (args) => ({ type: "output", text: args.join(" "), isError: false }),
  },
  {
    name: "help",
    description: "Display this help message",
    // HelpOutput reads the registry directly; the result stays plain data.
    run: () => ({ type: "component", view: "help" }),
  },
  FETCH_COMMAND,
  {
    name: "projects",
    description: "Browse projects in an interactive TUI",
    run: () => ({ type: "tui", view: "projects" }),
  },
  {
    name: "reboot",
    description: "Reboot the terminal (reload the page)",
    run: () => ({ type: "reboot", text: "Rebooting..." }),
  },
  SHUTDOWN_COMMAND,
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
  {
    ...FETCH_COMMAND,
    name: "fastfetch",
    description: "Alias for neofetch",
    hidden: true,
  },
  {
    name: "sudo",
    description: "Run a command as superuser",
    hidden: true,
    run: () => ({
      type: "output",
      text: "(error) sudo: rizkyfauziilmi is not in the sudoers file. This incident has been reported. 🐾",
      isError: true,
    }),
  },
  {
    name: "rm",
    description: "Remove files or directories",
    hidden: true,
    run: (args) => {
      // Ignore flags when finding the path, but keep them to tell `rm /` from `rm -r /`.
      const flags = args.filter((arg) => arg.startsWith("-"));
      const recursive = flags.some(
        (flag) => flag.includes("r") || flag.includes("R"),
      );
      const paths = args.filter((arg) => !arg.startsWith("-"));
      const target = paths[paths.length - 1];

      if (!target) {
        return {
          type: "output",
          text: "(error) rm: missing operand",
          isError: true,
        };
      }

      // Without -r, removing a directory fails like a real shell.
      if (target === "/" && !recursive) {
        return {
          type: "output",
          text: "(error) rm: cannot remove '/': Is a directory",
          isError: true,
        };
      }

      return {
        type: "output",
        text: `(error) rm: refusing to remove '${target}'. This terminal is read-only. 🛡️`,
        isError: true,
      };
    },
  },
  {
    name: "whoami",
    description: "Print the current user",
    hidden: true,
    run: () => ({
      type: "output",
      text: "guest — but you can be my next teammate. Try 'about' to meet me.",
      isError: false,
    }),
  },
];
