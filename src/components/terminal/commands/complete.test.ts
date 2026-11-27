import { describe, expect, it } from "vitest";

import {
  applyCandidate,
  completeCommand,
  getCompletionSpan,
  type CompletionCatalog,
} from "./complete";
import { COMMAND_CATALOG, createCompletionCatalog } from "./catalog";
import { createInitialFileSystem } from "../filesystem";
import type { CommandDefinition } from "./types";

const command = (
  overrides: Partial<CommandDefinition> & Pick<CommandDefinition, "name">,
): CommandDefinition => ({
  description: "A command",
  run: () => ({ type: "blank" }),
  ...overrides,
});

function catalog(
  names: string[],
  commands: CommandDefinition[] = [],
): CompletionCatalog {
  return {
    commandNames: new Set(names),
    commands: new Map(commands.map((item) => [item.name, item])),
    flagsFor: (item, isFirstArgument) => [
      ...(item.flags ?? []).map((flag) => flag.name),
      ...(isFirstArgument && !item.hidden ? ["-h", "--help"] : []),
    ],
  };
}

const theme = command({
  name: "theme",
  arguments: [
    { name: "dark", description: "Dark", values: ["dark"] },
    { name: "light", description: "Light", values: ["light"] },
    { name: "system", description: "System", values: ["system"] },
  ],
});

describe("completeCommand", () => {
  it("completes a unique command prefix and leaves one space", () => {
    expect(completeCommand("the", 3, catalog(["theme", "shutdown"]))).toEqual({
      value: "theme ",
      caret: 6,
      suggestions: [],
    });
  });

  it("keeps existing arguments while replacing the command", () => {
    expect(
      completeCommand("the dark", 3, catalog(["theme", "shutdown"])),
    ).toEqual({ value: "theme dark", caret: 6, suggestions: [] });
  });

  it("extends an ambiguous command prefix and keeps every match for cycling", () => {
    expect(
      completeCommand("t", 1, catalog(["theme", "theatre", "theme2"])),
    ).toEqual({
      value: "the",
      caret: 3,
      suggestions: ["theatre", "theme", "theme2"],
    });
  });

  it("lists command candidates when the common prefix cannot grow", () => {
    expect(completeCommand("s", 1, catalog(["sudo", "shutdown"]))).toEqual({
      value: "s",
      caret: 1,
      suggestions: ["shutdown", "sudo"],
    });
  });

  it("lists every runnable command for blank input", () => {
    expect(completeCommand("  ", 2, catalog(["echo", "about"]))).toEqual({
      value: "  ",
      caret: 2,
      suggestions: ["about", "echo"],
    });
  });

  it("does nothing for a quoted command", () => {
    expect(completeCommand('"the"', 5, catalog(["theme"]))).toEqual({
      value: '"the"',
      caret: 5,
      suggestions: [],
    });
  });

  it("does nothing when no command matches", () => {
    expect(completeCommand("xyz", 3, catalog(["theme", "shutdown"]))).toEqual({
      value: "xyz",
      caret: 3,
      suggestions: [],
    });
  });

  it("completes the contact command from the registry", () => {
    expect(completeCommand("con", 3, COMMAND_CATALOG)).toMatchObject({
      value: "contact ",
      suggestions: [],
    });
  });

  it("offers the cv download flag from the registry", () => {
    expect(completeCommand("cv -", 4, COMMAND_CATALOG).suggestions).toEqual([
      "--download",
      "--help",
      "-h",
    ]);
  });

  it("includes easter egg commands from the registry", () => {
    expect(completeCommand("s", 1, COMMAND_CATALOG).suggestions).toContain(
      "sudo",
    );
  });

  it("completes a unique argument value", () => {
    expect(completeCommand("theme d", 7, catalog(["theme"], [theme]))).toEqual({
      value: "theme dark ",
      caret: 11,
      suggestions: [],
    });
  });

  it("uses registry argument values for the real theme command", () => {
    expect(completeCommand("theme d", 7, COMMAND_CATALOG)).toMatchObject({
      value: "theme dark ",
      caret: 11,
    });
  });

  it("lists argument values and help flags after the command", () => {
    expect(completeCommand("theme ", 6, catalog(["theme"], [theme]))).toEqual({
      value: "theme ",
      caret: 6,
      suggestions: ["--help", "-h", "dark", "light", "system"],
    });
  });

  it("offers help flags for a leading dash", () => {
    expect(completeCommand("theme -", 7, catalog(["theme"], [theme]))).toEqual({
      value: "theme -",
      caret: 7,
      suggestions: ["--help", "-h"],
    });
  });

  it("offers shutdown's flag-like argument next to the help flags", () => {
    const shutdown = command({
      name: "shutdown",
      arguments: [
        { name: "now", description: "Now", values: ["now"] },
        { name: "-c", description: "Cancel", values: ["-c"] },
      ],
    });

    expect(
      completeCommand("shutdown -", 10, catalog(["shutdown"], [shutdown])),
    ).toEqual({
      value: "shutdown -",
      caret: 10,
      suggestions: ["--help", "-c", "-h"],
    });
  });

  it("completes echo help flags but not free-form text", () => {
    const echo = command({
      name: "echo",
      arguments: [{ name: "text", description: "Words to print" }],
    });

    expect(completeCommand("echo ", 5, catalog(["echo"], [echo]))).toEqual({
      value: "echo -",
      caret: 6,
      suggestions: ["--help", "-h"],
    });
    expect(completeCommand("echo -", 6, catalog(["echo"], [echo]))).toEqual({
      value: "echo -",
      caret: 6,
      suggestions: ["--help", "-h"],
    });
  });

  it("does not offer help flags after the first argument", () => {
    expect(
      completeCommand("theme dark ", 11, catalog(["theme"], [theme])),
    ).toEqual({ value: "theme dark ", caret: 11, suggestions: [] });
  });

  it("offers declared hidden-command flags at later positions", () => {
    const rm = command({
      name: "rm",
      hidden: true,
      flags: [
        { name: "-r", description: "Recursive" },
        { name: "-R", description: "Recursive alias" },
      ],
    });

    expect(completeCommand("rm / -", 6, catalog(["rm"], [rm]))).toEqual({
      value: "rm / -",
      caret: 6,
      suggestions: ["-R", "-r"],
    });
  });

  it("does nothing for a quoted argument", () => {
    expect(
      completeCommand('theme "da', 9, catalog(["theme"], [theme])),
    ).toEqual({ value: 'theme "da', caret: 9, suggestions: [] });
  });

  it("extends an ambiguous argument prefix and keeps every match for cycling", () => {
    const candidateCommand = command({
      name: "cmd",
      arguments: [
        {
          name: "value",
          description: "Value",
          values: ["dark", "darkest"],
        },
      ],
    });

    expect(
      completeCommand("cmd da", 6, catalog(["cmd"], [candidateCommand])),
    ).toEqual({
      value: "cmd dark",
      caret: 8,
      suggestions: ["dark", "darkest"],
    });
  });

  it("does not complete arguments for an unknown command", () => {
    expect(completeCommand("nope d", 6, catalog(["theme"], [theme]))).toEqual({
      value: "nope d",
      caret: 6,
      suggestions: [],
    });
  });

  it("completes file paths for ls from the filesystem snapshot", () => {
    const withFiles = createCompletionCatalog(createInitialFileSystem());

    expect(completeCommand("ls Doc", 6, withFiles)).toMatchObject({
      value: "ls Documents/ ",
      suggestions: [],
    });
    expect(completeCommand("ls .ba", 6, withFiles)).toMatchObject({
      value: "ls .bashrc ",
      suggestions: [],
    });
    expect(completeCommand("ls ab", 5, withFiles).suggestions).toEqual([]);
  });

  it("completes cd paths relative to the current directory", () => {
    const withFiles = createCompletionCatalog(
      createInitialFileSystem(),
      "/home/rizkyfauziilmi/Documents",
    );

    expect(completeCommand("cd no", 5, withFiles)).toMatchObject({
      value: "cd notes.txt ",
      suggestions: [],
    });
    expect(
      completeCommand(
        "cd Doc",
        6,
        createCompletionCatalog(createInitialFileSystem()),
      ),
    ).toMatchObject({ value: "cd Documents/ ", suggestions: [] });
  });

  it("completes paths for cat, mkdir, and touch from the live tree", () => {
    const withFiles = createCompletionCatalog(
      createInitialFileSystem(),
      "/home/rizkyfauziilmi/Documents",
    );

    expect(completeCommand("cat no", 6, withFiles)).toMatchObject({
      value: "cat notes.txt ",
      suggestions: [],
    });
    expect(completeCommand("mkdir Doc", 9, withFiles)).toEqual({
      value: "mkdir Doc",
      caret: 9,
      suggestions: [],
    });
    expect(completeCommand("mkdir -", 7, withFiles).suggestions).toEqual([
      "--help",
      "--parents",
      "-h",
      "-p",
    ]);
    expect(completeCommand("touch /etc/h", 12, withFiles)).toMatchObject({
      value: "touch /etc/hostname ",
      suggestions: [],
    });
  });

  it("completes nested absolute paths for rm without losing flags", () => {
    const withFiles = createCompletionCatalog(createInitialFileSystem());

    expect(completeCommand("rm /etc/h", 9, withFiles)).toMatchObject({
      value: "rm /etc/hostname ",
      suggestions: [],
    });
    expect(completeCommand("rm -", 4, withFiles).suggestions).toEqual([
      "--help",
      "-R",
      "-f",
      "-h",
      "-r",
    ]);
  });

  it("follows deletions in a newer filesystem snapshot", () => {
    const filesystem = createInitialFileSystem();
    const withoutDocuments = new Map(filesystem);
    withoutDocuments.delete("/home/rizkyfauziilmi/Documents");

    expect(
      completeCommand("ls Doc", 6, createCompletionCatalog(withoutDocuments)),
    ).toEqual({ value: "ls Doc", caret: 6, suggestions: [] });
  });
});

describe("completion token helpers", () => {
  it("locates the token under the caret", () => {
    expect(getCompletionSpan("th dark", 2)).toEqual({ start: 0, end: 2 });
    expect(getCompletionSpan("theme dark", 8)).toEqual({ start: 6, end: 10 });
  });

  it("uses a virtual token when the caret follows the last word", () => {
    expect(getCompletionSpan("theme ", 6)).toEqual({ start: 6, end: 6 });
    expect(getCompletionSpan("  ", 2)).toEqual({ start: 2, end: 2 });
  });

  it("applies a candidate while preserving text after the token", () => {
    expect(applyCandidate("the dark", { start: 0, end: 3 }, "theme")).toEqual({
      value: "theme dark",
      caret: 6,
    });
    expect(applyCandidate("theme ", { start: 6, end: 6 }, "dark")).toEqual({
      value: "theme dark ",
      caret: 11,
    });
  });
});
