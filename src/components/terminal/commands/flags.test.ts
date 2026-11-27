import { describe, expect, it } from "vitest";

import {
  getCommandFlags,
  getDeclaredFlags,
  getHelpFlags,
  getHelpTokens,
  isHelpToken,
  supportsHelpFlags,
  wantsHelp,
} from "./flags";
import { COMMAND_DEFINITIONS } from "./registry";
import type { CommandDefinition } from "./types";

const command = (
  overrides: Partial<CommandDefinition> & Pick<CommandDefinition, "name">,
): CommandDefinition => ({
  description: "A command",
  run: () => ({ type: "blank" }),
  ...overrides,
});

function registryCommand(name: string) {
  const found = COMMAND_DEFINITIONS.find((item) => item.name === name);
  if (!found) throw new Error(`missing registry command: ${name}`);
  return found;
}

describe("command flags", () => {
  it("supports help flags for every visible command", () => {
    expect(supportsHelpFlags(command({ name: "theme" }))).toBe(true);
    expect(supportsHelpFlags(command({ name: "echo" }))).toBe(true);
    expect(supportsHelpFlags(command({ name: "sudo", hidden: true }))).toBe(
      false,
    );
  });

  it("accepts the help word at runtime but keeps it out of completion", () => {
    const theme = command({ name: "theme" });

    expect(getHelpTokens(theme)).toEqual(["-h", "--help"]);
    expect(isHelpToken("-h")).toBe(true);
    expect(isHelpToken("--help")).toBe(true);
    expect(isHelpToken("help")).toBe(true);
    expect(isHelpToken("dark")).toBe(false);
    expect(isHelpToken(undefined)).toBe(false);
  });

  it("shows echo help for flags but prints a literal help word", () => {
    const echo = command({ name: "echo" });

    expect(wantsHelp(echo, "-h")).toBe(true);
    expect(wantsHelp(echo, "--help")).toBe(true);
    expect(wantsHelp(echo, "help")).toBe(false);
    expect(wantsHelp(command({ name: "about" }), "help")).toBe(true);
    expect(wantsHelp(command({ name: "sudo", hidden: true }), "-h")).toBe(
      false,
    );
  });

  it("returns help flags for echo but not for hidden commands", () => {
    expect(getHelpFlags(command({ name: "echo" }))).toEqual([
      { name: "-h", description: "Display this help text" },
      { name: "--help", description: "Display this help text" },
    ]);
    expect(getHelpFlags(command({ name: "sudo", hidden: true }))).toEqual([]);
  });

  it("merges declared flags with help flags for help text", () => {
    const output = getCommandFlags(
      command({
        name: "theme",
        flags: [{ name: "-x", description: "Example" }],
      }),
    );

    expect(output.map((flag) => flag.name)).toEqual(["-x", "-h", "--help"]);
  });

  it("adds help flags to rm's declared flags", () => {
    const rm = registryCommand("rm");

    expect(getDeclaredFlags(rm).map((flag) => flag.name)).toEqual([
      "-r",
      "-R",
      "-f",
    ]);
    expect(getCommandFlags(rm).map((flag) => flag.name)).toEqual([
      "-r",
      "-R",
      "-f",
      "-h",
      "--help",
    ]);
  });

  it("advertises help flags for every easter egg", () => {
    for (const name of ["fastfetch", "rm", "sudo", "whoami"]) {
      expect(
        getHelpFlags(registryCommand(name)).map((flag) => flag.name),
      ).toEqual(["-h", "--help"]);
    }
  });
});
