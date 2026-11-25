import { describe, expect, it } from "vitest";

import {
  getCommandFlags,
  getDeclaredFlags,
  getHelpFlags,
  getHelpTokens,
  isHelpToken,
  supportsHelpFlags,
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
  it("supports help flags only for visible non-echo commands", () => {
    expect(supportsHelpFlags(command({ name: "theme" }))).toBe(true);
    expect(supportsHelpFlags(command({ name: "echo" }))).toBe(false);
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

  it("returns no help flags for hidden or echo commands", () => {
    expect(getHelpFlags(command({ name: "echo" }))).toEqual([]);
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

  it("keeps rm's declared flags without advertising help", () => {
    const rm = registryCommand("rm");

    expect(getDeclaredFlags(rm).map((flag) => flag.name)).toEqual(["-r", "-R"]);
    expect(getCommandFlags(rm).map((flag) => flag.name)).toEqual(["-r", "-R"]);
  });
});
