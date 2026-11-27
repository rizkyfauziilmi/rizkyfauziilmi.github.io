import { describe, expect, it } from "vitest";

import { createFile, HOME_PATH } from "../filesystem";
import { createDefaultCommandContext } from "./fetch";
import { runCommand } from "./run";

const NOTES = [
  "Catatan kecil dari portofolio ini.",
  "",
  "Coba jalankan:",
  "  cd Documents",
  "  ls -a",
  "  cat -n notes.txt",
  "",
  "File baru bisa dibuat dengan touch dan mkdir.",
];

const NUMBERED_NOTES = [
  "     1\tCatatan kecil dari portofolio ini.",
  "     2\t",
  "     3\tCoba jalankan:",
  "     4\t  cd Documents",
  "     5\t  ls -a",
  "     6\t  cat -n notes.txt",
  "     7\t",
  "     8\tFile baru bisa dibuat dengan touch dan mkdir.",
];

describe("cat", () => {
  it("reads seeded files inside and outside home", () => {
    expect(runCommand("cat Documents/notes.txt")).toMatchObject({
      type: "output",
      text: NOTES.join("\n"),
      isError: false,
    });
    expect(runCommand("cat /etc/hostname")).toMatchObject({
      type: "output",
      text: "portofolio",
      isError: false,
    });
    expect(runCommand("cat ~/.bashrc")).toMatchObject({
      type: "output",
      text: expect.stringContaining("alias h='help'"),
    });
  });

  it("numbers lines with right-aligned GNU spacing", () => {
    expect(runCommand("cat -n Documents/notes.txt")).toMatchObject({
      type: "output",
      text: NUMBERED_NOTES.join("\n"),
    });
    expect(runCommand("cat --number Documents/notes.txt")).toMatchObject({
      type: "output",
      text: NUMBERED_NOTES.join("\n"),
    });
  });

  it("continues line numbers across multiple files", () => {
    const result = runCommand("cat -n /etc/hostname Documents/notes.txt");

    expect(result).toMatchObject({
      type: "output",
      text: [
        "     1\tportofolio",
        ...NUMBERED_NOTES.map((line, index) =>
          line.replace(/^ {5}\d/, String(index + 2).padStart(6, " ")),
        ),
      ].join("\n"),
    });
  });

  it("concatenates unnumbered files in order", () => {
    expect(runCommand("cat .profile /etc/hostname")).toMatchObject({
      type: "output",
      text: expect.stringContaining("portofolio"),
    });
  });

  it("reports missing operands, paths, and directories", () => {
    expect(runCommand("cat")).toMatchObject({
      type: "output",
      text: "cat: missing operand",
      isError: true,
    });
    expect(runCommand("cat asdf")).toMatchObject({
      type: "output",
      text: "cat: asdf: No such file or directory",
      isError: true,
    });
    expect(runCommand("cat Documents")).toMatchObject({
      type: "output",
      text: "cat: Documents: Is a directory",
      isError: true,
    });
  });

  it("keeps successful content when a later file fails", () => {
    expect(runCommand("cat /etc/hostname asdf")).toMatchObject({
      type: "output",
      text: "portofolio\ncat: asdf: No such file or directory",
      isError: true,
    });
  });

  it("renders an empty file as a blank line", () => {
    const context = createDefaultCommandContext();
    const filesystem = createFile(
      context.filesystem,
      `${HOME_PATH}/empty.txt`,
    ).filesystem;

    expect(runCommand("cat empty.txt", { ...context, filesystem })).toEqual({
      type: "blank",
    });
  });
});
