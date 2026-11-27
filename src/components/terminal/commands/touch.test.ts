import { describe, expect, it } from "vitest";

import { createFile, HOME_PATH } from "../filesystem";
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

describe("touch", () => {
  it("creates one or more empty files relative to the current directory", () => {
    const context: CommandContext = {
      ...createDefaultCommandContext(),
      cwd: `${HOME_PATH}/Documents`,
    };
    const result = runCommand("touch hello.txt todo.txt", context);

    expect(result.type).toBe("blank");
    if (result.type === "blank") {
      expect(
        result.filesystem?.get(`${HOME_PATH}/Documents/hello.txt`),
      ).toEqual({ kind: "file", content: "" });
      expect(result.filesystem?.get(`${HOME_PATH}/Documents/todo.txt`)).toEqual(
        { kind: "file", content: "" },
      );
    }
  });

  it("leaves existing files and directories untouched", () => {
    const context = createDefaultCommandContext();
    const result = runCommand("touch .bashrc Documents", context);

    expect(result).toEqual({ type: "blank", filesystem: context.filesystem });
  });

  it("reports GNU-style errors", () => {
    expect(runCommand("touch")).toMatchObject({
      type: "output",
      text: "touch: missing operand",
      isError: true,
    });
    expect(runCommand("touch -f")).toMatchObject({
      type: "output",
      text: "touch: missing operand",
      isError: true,
    });
    expect(runCommand("touch a/b.txt")).toMatchObject({
      type: "output",
      text: "touch: cannot touch 'a/b.txt': No such file or directory",
      isError: true,
    });
    expect(runCommand("touch .bashrc/sub.txt")).toMatchObject({
      type: "output",
      text: "touch: cannot touch '.bashrc/sub.txt': Not a directory",
      isError: true,
    });
  });

  it("denies writes outside home", () => {
    for (const target of ["/", "/home", "~", ".", "/etc/new", HOME_PATH]) {
      expect(runCommand(`touch ${target}`)).toMatchObject({
        type: "output",
        text: `touch: cannot touch '${target}': Permission denied`,
        isError: true,
      });
    }
  });

  it("keeps successful files when a later operand fails", () => {
    const context = createDefaultCommandContext();
    const withEmpty = {
      ...context,
      filesystem: createFile(context.filesystem, `${HOME_PATH}/empty.txt`)
        .filesystem,
    };
    const result = runCommand(
      "touch ok.txt a/b.txt .bashrc/sub.txt",
      withEmpty,
    );

    expect(result).toMatchObject({
      type: "output",
      text: [
        "touch: cannot touch 'a/b.txt': No such file or directory",
        "touch: cannot touch '.bashrc/sub.txt': Not a directory",
      ].join("\n"),
      isError: true,
    });
    if (result.type !== "output" || !result.filesystem) {
      throw new Error("Expected a filesystem mutation");
    }
    expect(result.filesystem.has(`${HOME_PATH}/ok.txt`)).toBe(true);
    expect(result.filesystem.has(`${HOME_PATH}/empty.txt`)).toBe(true);
  });

  it("feeds later commands with its updated filesystem", () => {
    const context = createDefaultCommandContext();
    const touched = runCommand("touch hello.txt", context);
    const next = withResult(context, touched);

    expect(runCommand("cat hello.txt", next)).toEqual({ type: "blank" });
  });
});
