import { isThemeMode } from "@/lib/theme";

import { CV, formatCvUpdatedAt } from "../data";
import {
  createDirectory,
  createFile,
  isUserWritable,
  listDirectory,
  lookupNode,
  normalizePath,
  readFile,
  removeNode,
  writeFile,
  type VirtualFileSystem,
  type WriteError,
} from "../filesystem";
import { buildFetchOutput } from "./fetch";
import { buildCommandHelp } from "./help";
import { parseShutdown, SHUTDOWN_ERROR } from "./shutdown";
import type { CommandContext, CommandDefinition, CommandResult } from "./types";

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
  examples: ["neofetch"],
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
  examples: ["contact"],
  suggestInAbout: true,
  run: () => ({ type: "tui", view: "contact" }),
};

const WRITE_ERROR_TEXT: Record<WriteError | "exists", string> = {
  "parent-not-found": "No such file or directory",
  "not-a-directory": "Not a directory",
  "is-directory": "Is a directory",
  exists: "File exists",
};

function writeErrorText(error: WriteError | "exists") {
  return WRITE_ERROR_TEXT[error];
}

function runEchoCommand(args: string[], context: CommandContext) {
  const text = args.join(" ");
  const redirect = context.redirect;
  if (!redirect) {
    return { type: "output" as const, text, isError: false };
  }
  if (!redirect.target) {
    return {
      type: "output" as const,
      text: "echo: missing redirect target",
      isError: true,
    };
  }
  if (redirect.ambiguous) {
    return {
      type: "output" as const,
      text: "echo: ambiguous redirect",
      isError: true,
    };
  }

  const path = normalizePath(redirect.target, context.cwd);
  if (!isUserWritable(path)) {
    return {
      type: "output" as const,
      text: `echo: cannot redirect to '${redirect.target}': Permission denied`,
      isError: true,
    };
  }

  const found = lookupNode(context.filesystem, redirect.target, context.cwd);
  if (found?.node.kind === "directory") {
    return {
      type: "output" as const,
      text: `echo: cannot redirect to '${redirect.target}': Is a directory`,
      isError: true,
    };
  }

  const written = writeFile(
    context.filesystem,
    path,
    text,
    redirect.operator === ">>",
  );
  if (written.error) {
    return {
      type: "output" as const,
      text: `echo: cannot redirect to '${redirect.target}': ${writeErrorText(written.error)}`,
      isError: true,
    };
  }

  return { type: "blank" as const, filesystem: written.filesystem };
}

const ECHO_COMMAND: CommandDefinition = {
  name: "echo",
  description: "Print text to the terminal",
  usageArgs: "[text...]",
  arguments: [
    {
      name: "text",
      description: "Words to print; quotes group spaces",
    },
  ],
  examples: [
    'echo "hello world"',
    'echo "Halo" > notes/hello.txt',
    'echo "Baris 2" >> notes/hello.txt',
    "cat notes/hello.txt",
  ],
  acceptsArgs: true,
  run: (args, context) => runEchoCommand(args, context),
};

function runMkdirCommand(args: string[], context: CommandContext) {
  const parents = args.some((arg) => arg === "-p" || arg === "--parents");
  const paths = args.filter((arg) => !arg.startsWith("-"));

  if (paths.length === 0) {
    return {
      type: "output" as const,
      text: "mkdir: missing operand",
      isError: true,
    };
  }

  let filesystem = context.filesystem;
  const errors: string[] = [];
  for (const target of paths) {
    const path = normalizePath(target, context.cwd);
    if (!isUserWritable(path)) {
      errors.push(
        `mkdir: cannot create directory '${target}': Permission denied`,
      );
      continue;
    }

    const found = lookupNode(filesystem, target, context.cwd);
    if (found) {
      if (!(parents && found.node.kind === "directory")) {
        errors.push(`mkdir: cannot create directory '${target}': File exists`);
      }
      continue;
    }

    const created = createDirectory(filesystem, path, parents);
    if (created.error) {
      errors.push(
        `mkdir: cannot create directory '${target}': ${writeErrorText(created.error)}`,
      );
      continue;
    }
    filesystem = created.filesystem;
  }

  if (errors.length === 0) return { type: "blank" as const, filesystem };
  return {
    type: "output" as const,
    text: errors.join("\n"),
    isError: true,
    filesystem,
  };
}

const MKDIR_COMMAND: CommandDefinition = {
  name: "mkdir",
  description: "Create directories",
  usageArgs: "[-p] DIRECTORY...",
  arguments: [{ name: "DIRECTORY", description: "One or more directories" }],
  flags: [
    {
      name: "-p",
      description: "Create missing parents and accept existing directories",
    },
    { name: "--parents", description: "Alias for -p" },
  ],
  examples: ["mkdir notes", "mkdir -p projects/web/src"],
  acceptsArgs: true,
  run: (args, context) => runMkdirCommand(args, context),
};

function runTouchCommand(args: string[], context: CommandContext) {
  const paths = args.filter((arg) => !arg.startsWith("-"));

  if (paths.length === 0) {
    return {
      type: "output" as const,
      text: "touch: missing operand",
      isError: true,
    };
  }

  let filesystem = context.filesystem;
  const errors: string[] = [];
  for (const target of paths) {
    const path = normalizePath(target, context.cwd);
    if (!isUserWritable(path)) {
      errors.push(`touch: cannot touch '${target}': Permission denied`);
      continue;
    }

    const created = createFile(filesystem, path);
    if (created.error) {
      errors.push(
        `touch: cannot touch '${target}': ${writeErrorText(created.error)}`,
      );
      continue;
    }
    filesystem = created.filesystem;
  }

  if (errors.length === 0) return { type: "blank" as const, filesystem };
  return {
    type: "output" as const,
    text: errors.join("\n"),
    isError: true,
    filesystem,
  };
}

const TOUCH_COMMAND: CommandDefinition = {
  name: "touch",
  description: "Create empty files",
  usageArgs: "FILE...",
  arguments: [{ name: "FILE", description: "One or more files" }],
  examples: ["touch notes.txt", "touch todo.txt done.txt"],
  acceptsArgs: true,
  run: (args, context) => runTouchCommand(args, context),
};

function runCatCommand(args: string[], context: CommandContext) {
  const numbered = args.some((arg) => arg === "-n" || arg === "--number");
  const paths = args.filter((arg) => !arg.startsWith("-"));

  if (paths.length === 0) {
    return {
      type: "output" as const,
      text: "cat: missing operand",
      isError: true,
    };
  }

  const lines: string[] = [];
  const errors: string[] = [];
  let lineNumber = 1;
  for (const target of paths) {
    const found = lookupNode(context.filesystem, target, context.cwd);
    if (!found) {
      errors.push(`cat: ${target}: No such file or directory`);
      continue;
    }

    const read = readFile(context.filesystem, found.path);
    if (read.error === "is-directory") {
      errors.push(`cat: ${target}: Is a directory`);
      continue;
    }
    if (!read.content) continue;

    lines.push(
      numbered
        ? read.content
            .split("\n")
            .map((line) => `${String(lineNumber++).padStart(6, " ")}\t${line}`)
            .join("\n")
        : read.content,
    );
  }

  if (errors.length > 0) {
    return {
      type: "output" as const,
      text: [...lines, ...errors].join("\n"),
      isError: true,
    };
  }
  if (lines.length === 0) return { type: "blank" as const };
  return {
    type: "output" as const,
    text: lines.join("\n"),
    isError: false,
  };
}

const CAT_COMMAND: CommandDefinition = {
  name: "cat",
  description: "Print file contents",
  usageArgs: "[-n] FILE...",
  arguments: [{ name: "FILE", description: "One or more files" }],
  flags: [
    { name: "-n", description: "Number all output lines" },
    { name: "--number", description: "Alias for -n" },
  ],
  examples: ["cat Documents/notes.txt", "cat -n Documents/notes.txt"],
  acceptsArgs: true,
  run: (args, context) => runCatCommand(args, context),
};

const CD_COMMAND: CommandDefinition = {
  name: "cd",
  description: "Change the current directory",
  usageArgs: "[path]",
  arguments: [{ name: "path", description: "Defaults to the home directory" }],
  examples: ["cd", "cd Documents", "cd ..", "cd /etc"],
  acceptsArgs: true,
  run: (args, context) => {
    if (args.length > 1) {
      return {
        type: "output" as const,
        text: "cd: too many arguments",
        isError: true,
      };
    }

    const target = args[0] ?? "~";
    const found = lookupNode(context.filesystem, target, context.cwd);
    if (!found) {
      return {
        type: "output" as const,
        text: `cd: ${target}: No such file or directory`,
        isError: true,
      };
    }
    if (found.node.kind !== "directory") {
      return {
        type: "output" as const,
        text: `cd: ${target}: Not a directory`,
        isError: true,
      };
    }

    return { type: "blank" as const, cwd: found.path };
  },
};

function runLsCommand(
  args: string[],
  filesystem: VirtualFileSystem,
  cwd: string,
) {
  const showAll = args.some((arg) => arg === "-a" || arg === "--all");
  const targets = args.filter((arg) => !arg.startsWith("-"));
  const errors: string[] = [];
  const lines: string[] = [];

  for (const target of targets.length > 0 ? targets : ["."]) {
    const found = lookupNode(filesystem, target, cwd);
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
  arguments: [
    { name: "path", description: "Defaults to the current directory" },
  ],
  flags: [
    { name: "-a", description: "Include hidden entries" },
    { name: "--all", description: "Include hidden entries" },
  ],
  examples: ["ls", "ls -a", "ls Documents", "ls /etc"],
  acceptsArgs: true,
  run: (args, context) => runLsCommand(args, context.filesystem, context.cwd),
};

function runRmCommand(
  args: string[],
  filesystem: VirtualFileSystem,
  cwd: string,
) {
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
    const found = lookupNode(filesystem, target, cwd);
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
  examples: ["rm notes.txt", "rm -r notes", "rm -f missing.txt"],
  flags: [
    { name: "-r", description: "Remove directories recursively" },
    { name: "-R", description: "Alias for -r" },
    { name: "-f", description: "Ignore missing files" },
  ],
  acceptsArgs: true,
  run: (args, context) => runRmCommand(args, context.filesystem, context.cwd),
};

// Commands reject extra arguments unless they explicitly opt in with acceptsArgs.
export const COMMAND_DEFINITIONS: CommandDefinition[] = [
  {
    name: "about",
    description: "Show a short introduction",
    examples: ["about"],
    run: () => ({ type: "component", view: "about" }),
  },
  {
    name: "clear",
    description: "Clear the terminal screen",
    examples: ["clear"],
    run: () => ({ type: "clear" }),
  },
  CAT_COMMAND,
  CD_COMMAND,
  ECHO_COMMAND,
  {
    name: "help",
    description: "Display this help message",
    examples: ["help"],
    // HelpOutput reads the registry directly; the result stays plain data.
    run: () => ({ type: "component", view: "help" }),
  },
  LS_COMMAND,
  MKDIR_COMMAND,
  TOUCH_COMMAND,
  FETCH_COMMAND,
  {
    name: "projects",
    description: "Browse projects in an interactive TUI",
    examples: ["projects"],
    suggestInAbout: true,
    run: () => ({ type: "tui", view: "projects" }),
  },
  CONTACT_COMMAND,
  CV_COMMAND,
  RESUME_COMMAND,
  {
    name: "reboot",
    description: "Reboot the terminal (reload the page)",
    examples: ["reboot"],
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
    examples: ["theme dark", "theme light", "theme system"],
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
    examples: ["fastfetch"],
    acceptsArgs: true,
  },
  {
    name: "sudo",
    description: "Run a command as superuser",
    examples: ["sudo"],
    acceptsArgs: true,
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
    examples: ["whoami"],
    acceptsArgs: true,
    run: () => ({
      type: "output",
      text: "guest — but you can be my next teammate. Try 'about' to meet me.",
      isError: false,
    }),
  },
];
