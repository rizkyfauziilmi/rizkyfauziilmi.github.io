import { describe, expect, it } from "vitest";

import { createDefaultCommandContext } from "./fetch";
import { COMMAND_DEFINITIONS } from "./registry";
import type { CommandDefinition } from "./types";

function findCommand(name: string): CommandDefinition {
  const definition = COMMAND_DEFINITIONS.find((item) => item.name === name);
  if (!definition) throw new Error(`Missing command: ${name}`);
  return definition;
}

function outputFor(name: string, args: string[]): string {
  const result = findCommand(name).run(args, createDefaultCommandContext());
  if (result.type !== "output") throw new Error("Expected an output result");
  return result.text;
}

describe("about suggestions", () => {
  it("flags projects and contact but never about", () => {
    expect(findCommand("projects").suggestInAbout).toBe(true);
    expect(findCommand("contact").suggestInAbout).toBe(true);
    expect(findCommand("about").suggestInAbout).toBeUndefined();
  });

  it("does not suggest hidden commands", () => {
    for (const command of COMMAND_DEFINITIONS) {
      if (command.hidden) {
        expect(command.suggestInAbout).toBeUndefined();
      }
    }
  });
});

describe("hidden easter eggs", () => {
  it("marks fastfetch, sudo, rm and whoami as hidden", () => {
    for (const name of ["fastfetch", "sudo", "rm", "whoami"]) {
      expect(findCommand(name).hidden).toBe(true);
    }
  });

  it("denies sudo and introduces the guest", () => {
    expect(outputFor("sudo", [])).toContain("not in the sudoers file");
    expect(outputFor("whoami", [])).toContain("guest");
  });

  it("reports / as a directory without -r", () => {
    expect(outputFor("rm", ["/"])).toBe(
      "(error) rm: cannot remove '/': Is a directory",
    );
  });

  it("keeps the read-only joke for recursive root removal", () => {
    expect(outputFor("rm", ["-rf", "/"])).toContain("read-only");
    expect(outputFor("rm", ["-r", "/"])).toContain("read-only");
  });

  it("reports the path the user typed", () => {
    expect(outputFor("rm", ["asdf"])).toContain("'asdf'");
    expect(outputFor("rm", ["-f", "asdf"])).toContain("'asdf'");
  });

  it("reports a missing operand", () => {
    expect(outputFor("rm", [])).toBe("(error) rm: missing operand");
  });
});
