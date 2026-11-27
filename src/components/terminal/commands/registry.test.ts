import { describe, expect, it } from "vitest";

import { createInitialFileSystem, HOME_PATH } from "../filesystem";
import { createDefaultCommandContext } from "./fetch";
import { COMMAND_DEFINITIONS } from "./registry";
import type { CommandDefinition, CommandResult } from "./types";

function findCommand(name: string): CommandDefinition {
  const definition = COMMAND_DEFINITIONS.find((item) => item.name === name);
  if (!definition) throw new Error(`Missing command: ${name}`);
  return definition;
}

function run(name: string, args: string[]): CommandResult {
  return findCommand(name).run(args, createDefaultCommandContext());
}

function outputFor(name: string, args: string[]): string {
  const result = run(name, args);
  if (result.type !== "output") throw new Error("Expected an output result");
  return result.text;
}

describe("about suggestions", () => {
  it("flags projects, contact, and cv but never about or its alias", () => {
    expect(findCommand("projects").suggestInAbout).toBe(true);
    expect(findCommand("contact").suggestInAbout).toBe(true);
    expect(findCommand("cv").suggestInAbout).toBe(true);
    expect(findCommand("resume").suggestInAbout).toBeUndefined();
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

describe("easter eggs", () => {
  it("lists fastfetch, sudo, rm and whoami as visible commands", () => {
    for (const name of ["fastfetch", "sudo", "rm", "whoami"]) {
      const command = findCommand(name);
      expect(command.hidden).toBeUndefined();
      expect(command.acceptsArgs).toBe(true);
    }
  });

  it("denies sudo and introduces the guest", () => {
    expect(outputFor("sudo", [])).toContain("not in the sudoers file");
    expect(outputFor("whoami", [])).toContain("guest");
  });
});

describe("rm", () => {
  it("reports a missing operand", () => {
    expect(outputFor("rm", [])).toBe("rm: missing operand");
    expect(outputFor("rm", ["-f"])).toBe("rm: missing operand");
  });

  it("reports a missing file with the path the user typed", () => {
    expect(outputFor("rm", ["asdf"])).toBe(
      "rm: cannot remove 'asdf': No such file or directory",
    );
    expect(outputFor("rm", ["/etc/nope"])).toBe(
      "rm: cannot remove '/etc/nope': No such file or directory",
    );
    expect(run("rm", ["-f", "asdf"])).toEqual({
      type: "blank",
      filesystem: createInitialFileSystem(),
    });
  });

  it("removes a file from the filesystem snapshot", () => {
    const result = run("rm", ["Documents/notes.txt"]);
    expect(result.type).toBe("blank");
    if (result.type !== "blank" || !result.filesystem) {
      throw new Error("Expected a filesystem mutation");
    }
    expect(result.filesystem.has(`${HOME_PATH}/Documents/notes.txt`)).toBe(
      false,
    );
    expect(result.filesystem.has(`${HOME_PATH}/.bashrc`)).toBe(true);
  });

  it("requires -r for directories inside home", () => {
    expect(outputFor("rm", ["Documents"])).toBe(
      "rm: cannot remove 'Documents': Is a directory",
    );
    expect(outputFor("rm", ["-f", "Documents"])).toBe(
      "rm: cannot remove 'Documents': Is a directory",
    );
  });

  it("removes a home directory recursively with -r, -R, or -rf", () => {
    for (const flag of ["-r", "-R", "-rf"]) {
      const result = run("rm", [flag, "Documents"]);
      expect(result.type).toBe("blank");
      if (result.type !== "blank" || !result.filesystem) {
        throw new Error("Expected a filesystem mutation");
      }
      expect(result.filesystem.has(`${HOME_PATH}/Documents`)).toBe(false);
      expect(result.filesystem.has(`${HOME_PATH}/Documents/notes.txt`)).toBe(
        false,
      );
    }
  });

  it("rejects paths that would require sudo", () => {
    for (const target of [
      "/",
      "/home/",
      "/home/rizkyfauziilmi",
      "~",
      ".",
      "/bin/",
      "/etc/hostname",
      "/usr",
      "/var",
      "/tmp",
    ]) {
      expect(outputFor("rm", ["-rf", target])).toBe(
        `rm: cannot remove '${target}': Permission denied`,
      );
    }
  });

  it("does not let -f hide permission errors", () => {
    expect(outputFor("rm", ["-f", "/etc/hostname"])).toBe(
      "rm: cannot remove '/etc/hostname': Permission denied",
    );
  });

  it("collects errors while keeping successful removals", () => {
    const result = run("rm", [".bashrc", "/etc/hostname"]);
    expect(result).toMatchObject({
      type: "output",
      text: "rm: cannot remove '/etc/hostname': Permission denied",
      isError: true,
    });
    if (result.type !== "output" || !result.filesystem) {
      throw new Error("Expected a filesystem mutation");
    }
    expect(result.filesystem.has(`${HOME_PATH}/.bashrc`)).toBe(false);
  });
});
