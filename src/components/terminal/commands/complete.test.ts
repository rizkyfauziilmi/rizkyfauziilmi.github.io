import { describe, expect, it } from "vitest";

import { completeCommand, type CompletionCatalog } from "./complete";
import { COMMAND_CATALOG } from "./index";
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
      ...(isFirstArgument && !item.hidden && item.name !== "echo"
        ? ["-h", "--help"]
        : []),
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
    expect(
      completeCommand("the", 3, catalog(["theme", "shutdown"])),
    ).toEqual({ value: "theme ", caret: 6, suggestions: [] });
  });

  it("keeps existing arguments while replacing the command", () => {
    expect(
      completeCommand("the dark", 3, catalog(["theme", "shutdown"])),
    ).toEqual({ value: "theme dark", caret: 6, suggestions: [] });
  });

  it("extends an ambiguous command prefix to the common prefix", () => {
    expect(
      completeCommand("t", 1, catalog(["theme", "theatre", "theme2"])),
    ).toEqual({ value: "the", caret: 3, suggestions: [] });
  });

  it("lists command candidates when the common prefix cannot grow", () => {
    expect(
      completeCommand("s", 1, catalog(["sudo", "shutdown"])),
    ).toEqual({
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
    expect(
      completeCommand('"the"', 5, catalog(["theme"])),
    ).toEqual({ value: '"the"', caret: 5, suggestions: [] });
  });

  it("does nothing when no command matches", () => {
    expect(
      completeCommand("xyz", 3, catalog(["theme", "shutdown"])),
    ).toEqual({ value: "xyz", caret: 3, suggestions: [] });
  });

  it("includes hidden runnable commands from the registry", () => {
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

  it("does not complete free-form echo text or its help flags", () => {
    const echo = command({
      name: "echo",
      arguments: [{ name: "text", description: "Words to print" }],
    });

    expect(completeCommand("echo ", 5, catalog(["echo"], [echo]))).toEqual({
      value: "echo ",
      caret: 5,
      suggestions: [],
    });
    expect(completeCommand("echo -", 6, catalog(["echo"], [echo]))).toEqual({
      value: "echo -",
      caret: 6,
      suggestions: [],
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

  it("extends an ambiguous argument prefix to the common prefix", () => {
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
    ).toEqual({ value: "cmd dark", caret: 8, suggestions: [] });
  });

  it("does not complete arguments for an unknown command", () => {
    expect(completeCommand("nope d", 6, catalog(["theme"], [theme]))).toEqual({
      value: "nope d",
      caret: 6,
      suggestions: [],
    });
  });
});
