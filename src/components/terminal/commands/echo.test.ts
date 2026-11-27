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

describe("echo", () => {
  it("prints text without a redirect", () => {
    expect(runCommand('echo "hello world"')).toMatchObject({
      type: "output",
      text: "hello world",
      isError: false,
    });
    expect(runCommand('echo "a > b"')).toMatchObject({
      type: "output",
      text: "a > b",
    });
  });

  it("writes to a new file with > and prints nothing", () => {
    const result = runCommand('echo "Halo" > hello.txt');

    expect(result.type).toBe("blank");
    if (result.type === "blank") {
      expect(result.filesystem?.get(`${HOME_PATH}/hello.txt`)).toEqual({
        kind: "file",
        content: "Halo",
      });
    }
  });

  it("appends a line with >> without a leading blank line", () => {
    let context = createDefaultCommandContext();
    context = withResult(context, runCommand('echo "Halo" > hello.txt'));

    const appended = runCommand('echo "Baris 2" >> hello.txt', context);
    expect(appended.type).toBe("blank");
    if (appended.type === "blank") {
      expect(appended.filesystem?.get(`${HOME_PATH}/hello.txt`)).toEqual({
        kind: "file",
        content: "Halo\nBaris 2",
      });
    }

    const emptyContext = createDefaultCommandContext();
    const filesystem = createFile(
      emptyContext.filesystem,
      `${HOME_PATH}/empty.txt`,
    ).filesystem;
    const firstLine = runCommand('echo "Halo" >> empty.txt', {
      ...emptyContext,
      filesystem,
    });
    expect(firstLine.type).toBe("blank");
    if (firstLine.type === "blank") {
      expect(firstLine.filesystem?.get(`${HOME_PATH}/empty.txt`)).toEqual({
        kind: "file",
        content: "Halo",
      });
    }
  });

  it("accepts quoted redirect targets and relative paths", () => {
    const context: CommandContext = {
      ...createDefaultCommandContext(),
      cwd: `${HOME_PATH}/Documents`,
    };
    const result = runCommand('echo "Halo" > "my notes.txt"', context);

    expect(result.type).toBe("blank");
    if (result.type === "blank") {
      expect(
        result.filesystem?.get(`${HOME_PATH}/Documents/my notes.txt`),
      ).toEqual({ kind: "file", content: "Halo" });
    }
  });

  it("reports redirect errors", () => {
    expect(runCommand("echo hi >")).toMatchObject({
      type: "output",
      text: "echo: missing redirect target",
      isError: true,
    });
    expect(runCommand("echo hi > a b")).toMatchObject({
      type: "output",
      text: "echo: ambiguous redirect",
      isError: true,
    });
    expect(runCommand("echo hi > Documents")).toMatchObject({
      type: "output",
      text: "echo: cannot redirect to 'Documents': Is a directory",
      isError: true,
    });
    expect(runCommand("echo hi > a/b.txt")).toMatchObject({
      type: "output",
      text: "echo: cannot redirect to 'a/b.txt': No such file or directory",
      isError: true,
    });
    expect(runCommand("echo hi > .bashrc/sub.txt")).toMatchObject({
      type: "output",
      text: "echo: cannot redirect to '.bashrc/sub.txt': Not a directory",
      isError: true,
    });
  });

  it("denies redirects outside home", () => {
    for (const target of ["/", "/home", "~", ".", "/etc/new", HOME_PATH]) {
      expect(runCommand(`echo hi > ${target}`)).toMatchObject({
        type: "output",
        text: `echo: cannot redirect to '${target}': Permission denied`,
        isError: true,
      });
    }
  });

  it("feeds later commands with its updated filesystem", () => {
    let context = createDefaultCommandContext();
    context = withResult(
      context,
      runCommand('echo "Halo" > hello.txt', context),
    );

    expect(runCommand("cat hello.txt", context)).toMatchObject({
      type: "output",
      text: "Halo",
    });
  });
});
