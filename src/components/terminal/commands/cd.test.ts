import { describe, expect, it } from "vitest";

import { createInitialFileSystem, HOME_PATH } from "../filesystem";
import { runCommand } from "./run";
import { createDefaultCommandContext } from "./fetch";

function run(input: string, cwd: string = HOME_PATH) {
  return runCommand(input, { ...createDefaultCommandContext(), cwd });
}

describe("cd", () => {
  it("returns home with no argument", () => {
    expect(run("cd", `${HOME_PATH}/Documents`)).toEqual({
      type: "blank",
      cwd: HOME_PATH,
    });
  });

  it("resolves relative paths against the current directory", () => {
    expect(run("cd Documents")).toEqual({
      type: "blank",
      cwd: `${HOME_PATH}/Documents`,
    });
    expect(run("cd ..", `${HOME_PATH}/Documents`)).toEqual({
      type: "blank",
      cwd: HOME_PATH,
    });
  });

  it("supports home, absolute, dot, and parent paths", () => {
    expect(run("cd ~/Documents", "/etc")).toEqual({
      type: "blank",
      cwd: `${HOME_PATH}/Documents`,
    });
    expect(run("cd /etc")).toEqual({ type: "blank", cwd: "/etc" });
    expect(run("cd .")).toEqual({ type: "blank", cwd: HOME_PATH });
    expect(run("cd ../../..", HOME_PATH)).toEqual({ type: "blank", cwd: "/" });
  });

  it("errors on missing paths, files, and extra arguments", () => {
    expect(run("cd asdf")).toMatchObject({
      type: "output",
      isError: true,
      text: "cd: asdf: No such file or directory",
    });
    expect(run("cd .bashrc")).toMatchObject({
      type: "output",
      isError: true,
      text: "cd: .bashrc: Not a directory",
    });
    expect(run("cd Documents Downloads")).toMatchObject({
      type: "output",
      isError: true,
      text: "cd: too many arguments",
    });
  });

  it("lists and removes relative to the new directory", () => {
    const context = {
      ...createDefaultCommandContext(),
      cwd: `${HOME_PATH}/Documents`,
      filesystem: createInitialFileSystem(),
    };

    expect(runCommand("ls", context)).toMatchObject({
      type: "output",
      text: "notes.txt",
    });
    expect(runCommand("rm notes.txt", context)).toEqual({
      type: "blank",
      filesystem: expect.any(Map),
    });
  });

  it("offers help for a visible command", () => {
    expect(run("cd -h").type).toBe("output");
  });
});
