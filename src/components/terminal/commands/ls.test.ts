import { describe, expect, it } from "vitest";

import { runCommand } from "./run";

function outputFor(input: string) {
  const result = runCommand(input);
  if (result.type !== "output") throw new Error("Expected an output result");
  return result.text;
}

describe("ls", () => {
  it("lists the home directory by default without dotfiles", () => {
    expect(outputFor("ls")).toBe(
      "Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos",
    );
  });

  it("includes dotfiles, '.', and '..' with -a", () => {
    expect(outputFor("ls -a")).toBe(
      ".  ..  .bashrc  .config  .profile  Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos",
    );
  });

  it("lists a named directory and an absolute path", () => {
    expect(outputFor("ls Documents")).toBe("notes.txt");
    expect(outputFor("ls /etc")).toBe("hostname");
  });

  it("prints the name of a file operand", () => {
    expect(outputFor("ls .bashrc")).toBe(".bashrc");
  });

  it("renders nothing for an empty directory", () => {
    expect(runCommand("ls /tmp")).toEqual({ type: "blank" });
  });

  it("reports an unknown path like a real shell", () => {
    expect(outputFor("ls asdf")).toBe(
      "ls: cannot access 'asdf': No such file or directory",
    );
  });

  it("offers help for a visible command", () => {
    expect(outputFor("ls -h")).toContain("Usage: ls [-a] [path...]");
  });
});
