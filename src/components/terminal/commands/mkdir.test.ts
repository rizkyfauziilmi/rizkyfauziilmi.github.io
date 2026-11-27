import { describe, expect, it } from "vitest";

import { HOME_PATH } from "../filesystem";
import { createDefaultCommandContext } from "./fetch";
import { runCommand } from "./run";
import type { CommandContext, CommandResult } from "./types";

function withResult(
  context: CommandContext,
  result: CommandResult,
): CommandContext {
  if (
    (result.type === "output" || result.type === "blank") &&
    result.filesystem
  ) {
    return { ...context, filesystem: result.filesystem };
  }
  return context;
}

describe("mkdir", () => {
  it("creates a directory relative to the current directory", () => {
    const context: CommandContext = {
      ...createDefaultCommandContext(),
      cwd: `${HOME_PATH}/Documents`,
    };
    const result = runCommand("mkdir drafts", context);

    expect(result.type).toBe("blank");
    if (result.type === "blank") {
      expect(result.filesystem?.has(`${HOME_PATH}/Documents/drafts`)).toBe(
        true,
      );
    }
  });

  it("builds missing parents and accepts existing directories with -p", () => {
    let context = createDefaultCommandContext();
    const created = runCommand("mkdir -p projects/web/src", context);
    expect(created.type).toBe("blank");
    context = withResult(context, created);

    for (const path of [
      `${HOME_PATH}/projects`,
      `${HOME_PATH}/projects/web`,
      `${HOME_PATH}/projects/web/src`,
    ]) {
      expect(context.filesystem.get(path)).toEqual({ kind: "directory" });
    }
    expect(runCommand("mkdir -p projects", context).type).toBe("blank");
  });

  it("reports GNU-style errors", () => {
    expect(runCommand("mkdir")).toMatchObject({
      type: "output",
      text: "mkdir: missing operand",
      isError: true,
    });
    expect(runCommand("mkdir Desktop")).toMatchObject({
      type: "output",
      text: "mkdir: cannot create directory 'Desktop': File exists",
      isError: true,
    });
    expect(runCommand("mkdir .bashrc")).toMatchObject({
      type: "output",
      text: "mkdir: cannot create directory '.bashrc': File exists",
      isError: true,
    });
    expect(runCommand("mkdir a/b")).toMatchObject({
      type: "output",
      text: "mkdir: cannot create directory 'a/b': No such file or directory",
      isError: true,
    });
    expect(runCommand("mkdir .bashrc/sub")).toMatchObject({
      type: "output",
      text: "mkdir: cannot create directory '.bashrc/sub': Not a directory",
      isError: true,
    });
  });

  it("denies writes outside home", () => {
    for (const target of ["/", "/home", "~", ".", "/etc/new", HOME_PATH]) {
      expect(runCommand(`mkdir ${target}`)).toMatchObject({
        type: "output",
        text: `mkdir: cannot create directory '${target}': Permission denied`,
        isError: true,
      });
    }
  });

  it("keeps successful directories when a later operand fails", () => {
    const result = runCommand("mkdir ok a/b");

    expect(result).toMatchObject({
      type: "output",
      text: "mkdir: cannot create directory 'a/b': No such file or directory",
      isError: true,
    });
    if (result.type !== "output" || !result.filesystem) {
      throw new Error("Expected a filesystem mutation");
    }
    expect(result.filesystem.has(`${HOME_PATH}/ok`)).toBe(true);
  });
});
