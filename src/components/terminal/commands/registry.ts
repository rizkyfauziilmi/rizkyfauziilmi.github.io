import { isThemeMode } from "@/lib/theme";

import { CV, formatCvUpdatedAt } from "../data";
import {
  HOME_PATH,
  isUserWritable,
  listDirectory,
  lookupNode,
  removeNode,
  type VirtualFileSystem,
} from "../filesystem";
import { buildFetchOutput } from "./fetch";
import { buildCommandHelp } from "./help";
import { parseShutdown, SHUTDOWN_ERROR } from "./shutdown";
import type { CommandDefinition, CommandResult } from "./types";

const SHUTDOWN_COMMAND: CommandDefinition = {
  name: "shutdown",
  description: "Power off or schedule shutdown",
  usageArgs: "<now|+N|HH:MM|-c>",
  arguments: [
    {
      name: "now",
      description: "Power off immediately (only format that can close the tab)",
      values: ["now"],
    },
    { name: "+N", description: "Minutes from now, e.g. +5 (+0 = now)" },
    {
      name: "HH:MM",
      description: "24-hour local time, e.g. 23:30 (tomorrow if past)",
    },
    {
      name: "-c",
      description: "Cancel a scheduled shutdown",
      values: ["-c"],
    },
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

const DOWNLOAD_FLAG = "--download";

function runCvCommand(name: string, args: string[]): CommandResult {
  if (args.length === 0) return { type: "tui", view: "cv" };

  if (args.length === 1 && args[0] === DOWNLOAD_FLAG) {
    return {
      type: "download",
      url: CV.pdfUrl,
      filename: CV.filename,
      text: `Downloading ${CV.filename} — updated ${formatCvUpdatedAt(CV.updatedAt)}. Progress: see toast.`,
    };
  }

  return {
    type: "output",
    text: `${name}: expected '${DOWNLOAD_FLAG}'...`,
    isError: true,
  };
}

function createCvCommand(
  name: string,
  description: string,
  suggestInAbout = false,
): CommandDefinition {
  return {
    name,
    description,
    usageArgs: "[--download]",
    flags: [
      { name: DOWNLOAD_FLAG, description: "Download the PDF immediately" },
    ],
    examples: [name, `${name} ${DOWNLOAD_FLAG}`],
    acceptsArgs: true,
    ...(suggestInAbout ? { suggestInAbout: true } : {}),
    run: (args) => runCvCommand(name, args),
  };
}

const CV_COMMAND = createCvCommand("cv", "View and download my CV", true);
const RESUME_COMMAND = createCvCommand("resume", "Alias for cv");

const CONTACT_COMMAND: CommandDefinition = {
  name: "contact",
  description: "Find me and get in touch",
  suggestInAbout: true,
  run: () => ({ type: "tui", view: "contact" }),
};

function runLsCommand(args: string[], filesystem: VirtualFileSystem) {
  const showAll = args.some((arg) => arg === "-a" || arg === "--all");
  const targets = args.filter((arg) => !arg.startsWith("-"));
  const errors: string[] = [];
  const lines: string[] = [];

  for (const target of targets.length > 0 ? targets : ["."]) {
    const found = lookupNode(filesystem, target, HOME_PATH);
    if (!found) {
      errors.push(`ls: cannot access '${target}': No such file or directory`);
      continue;
    }

    if (found.node.kind === "file") {
      lines.push(found.path.split("/").at(-1) ?? target);
    } else {
      if (showAll) lines.push(".", "..");
      lines.push(...listDirectory(filesystem, found.path, showAll));
    }
  }

  if (errors.length > 0) {
    return { type: "output" as const, text: errors.join("\n"), isError: true };
  }
  if (lines.length === 0) return { type: "blank" as const };
  return { type: "output" as const, text: lines.join("  "), isError: false };
}

const LS_COMMAND: CommandDefinition = {
  name: "ls",
  description: "List files and directories",
  usageArgs: "[-a] [path...]",
  arguments: [{ name: "path", description: "Defaults to the home directory" }],
  flags: [
    { name: "-a", description: "Include hidden entries" },
    { name: "--all", description: "Include hidden entries" },
  ],
  examples: ["ls", "ls -a", "ls Documents", "ls /etc"],
  acceptsArgs: true,
  run: (args, context) => runLsCommand(args, context.filesystem),
};

function runRmCommand(args: string[], filesystem: VirtualFileSystem) {
  // Flags never name files; combined forms such as -rf stay supported.
  const flags = args.filter((arg) => arg.startsWith("-"));
  const recursive = flags.some((flag) => /[rR]/.test(flag.slice(1)));
  const force = flags.some((flag) => flag.includes("f"));
  const paths = args.filter((arg) => !arg.startsWith("-"));

  if (paths.length === 0) {
    return {
      type: "output" as const,
      text: "rm: missing operand",
      isError: true,
    };
  }

  const errors: string[] = [];
  for (const target of paths) {
    const found = lookupNode(filesystem, target, HOME_PATH);
    if (!found) {
      if (!force) {
        errors.push(`rm: cannot remove '${target}': No such file or directory`);
      }
      continue;
    }

    // Only entries inside home belong to the user; sudo is unavailable here.
    if (!isUserWritable(found.path)) {
      errors.push(`rm: cannot remove '${target}': Permission denied`);
      continue;
    }

    const removal = removeNode(filesystem, found.path, recursive);
    filesystem = removal.filesystem;
    if (removal.error === "is-directory") {
      errors.push(`rm: cannot remove '${target}': Is a directory`);
    }
  }

  if (errors.length === 0) return { type: "blank" as const, filesystem };
  return {
    type: "output" as const,
    text: errors.join("\n"),
    isError: true,
    filesystem,
  };
}

const RM_COMMAND: CommandDefinition = {
  name: "rm",
  description: "Remove files or directories",
  hidden: true,
  flags: [
    { name: "-r", description: "Remove directories recursively" },
    { name: "-R", description: "Alias for -r" },
    { name: "-f", description: "Ignore missing files" },
  ],
  acceptsArgs: true,
  run: (args, context) => runRmCommand(args, context.filesystem),
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
  LS_COMMAND,
  FETCH_COMMAND,
  {
    name: "projects",
    description: "Browse projects in an interactive TUI",
    suggestInAbout: true,
    run: () => ({ type: "tui", view: "projects" }),
  },
  CONTACT_COMMAND,
  CV_COMMAND,
  RESUME_COMMAND,
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
      { name: "dark", description: "Use the dark theme", values: ["dark"] },
      { name: "light", description: "Use the light theme", values: ["light"] },
      {
        name: "system",
        description: "Follow the system preference",
        values: ["system"],
      },
    ],
    acceptsArgs: true,
    run: (args): CommandResult => {
      const [mode] = args;
      if (args.length === 1 && isThemeMode(mode)) {
        return { type: "theme", mode, text: `Theme set to ${mode}` };
      }

      return {
        type: "output",
        text: "theme: expected 'dark', 'light', or 'system'...",
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
      text: "sudo: rizkyfauziilmi is not in the sudoers file. This incident has been reported. 🐾",
      isError: true,
    }),
  },
  RM_COMMAND,
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
