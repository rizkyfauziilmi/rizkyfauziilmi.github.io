import { describe, expect, it } from "vitest";

import {
  createInitialFileSystem,
  HOME_PATH,
  isUserWritable,
  listDirectory,
  lookupNode,
  normalizePath,
  removeNode,
  ROOT_PATH,
} from "./filesystem";

describe("virtual filesystem", () => {
  it("seeds a Linux-like tree with a standard home directory", () => {
    const filesystem = createInitialFileSystem();

    expect(filesystem.get(ROOT_PATH)).toEqual({ kind: "directory" });
    expect(filesystem.get("/etc/hostname")).toEqual({ kind: "file" });
    expect(listDirectory(filesystem, HOME_PATH)).toEqual([
      "Desktop",
      "Documents",
      "Downloads",
      "Music",
      "Pictures",
      "Public",
      "Templates",
      "Videos",
    ]);
  });

  it("resolves relative, absolute, home, dot, and parent paths", () => {
    expect(normalizePath("Documents/notes.txt")).toBe(
      `${HOME_PATH}/Documents/notes.txt`,
    );
    expect(normalizePath("/etc/hostname")).toBe("/etc/hostname");
    expect(normalizePath("~")).toBe(HOME_PATH);
    expect(normalizePath("~/Documents")).toBe(`${HOME_PATH}/Documents`);
    expect(normalizePath("./Documents/../.bashrc")).toBe(
      `${HOME_PATH}/.bashrc`,
    );
    expect(normalizePath("../../..")).toBe(ROOT_PATH);
  });

  it("looks up nodes from the fixed home directory", () => {
    const filesystem = createInitialFileSystem();

    expect(lookupNode(filesystem, ".bashrc")).toEqual({
      path: `${HOME_PATH}/.bashrc`,
      node: { kind: "file" },
    });
    expect(lookupNode(filesystem, "asdf")).toBeNull();
  });

  it("hides dotfiles unless asked to include them", () => {
    const filesystem = createInitialFileSystem();

    expect(listDirectory(filesystem, HOME_PATH)).not.toContain(".bashrc");
    expect(listDirectory(filesystem, HOME_PATH, true)).toEqual([
      ".bashrc",
      ".config",
      ".profile",
      "Desktop",
      "Documents",
      "Downloads",
      "Music",
      "Pictures",
      "Public",
      "Templates",
      "Videos",
    ]);
  });

  it("limits writes to entries strictly inside home", () => {
    expect(isUserWritable(`${HOME_PATH}/Documents/notes.txt`)).toBe(true);
    expect(isUserWritable(`${HOME_PATH}/Documents`)).toBe(true);
    expect(isUserWritable(HOME_PATH)).toBe(false);
    expect(isUserWritable("/home")).toBe(false);
    expect(isUserWritable(ROOT_PATH)).toBe(false);
    expect(isUserWritable("/etc/hostname")).toBe(false);
  });

  it("lists only immediate children in sorted order", () => {
    const filesystem = createInitialFileSystem();

    expect(listDirectory(filesystem, `${HOME_PATH}/Documents`)).toEqual([
      "notes.txt",
    ]);
    expect(listDirectory(filesystem, "/")).toEqual([
      "bin",
      "etc",
      "home",
      "tmp",
      "usr",
      "var",
    ]);
  });

  it("removes a file without mutating the original tree", () => {
    const filesystem = createInitialFileSystem();
    const path = `${HOME_PATH}/Documents/notes.txt`;
    const result = removeNode(filesystem, path, false);

    expect(result.error).toBeUndefined();
    expect(result.filesystem.has(path)).toBe(false);
    expect(filesystem.has(path)).toBe(true);
  });

  it("requires recursion for directories and reports missing nodes", () => {
    const filesystem = createInitialFileSystem();

    expect(removeNode(filesystem, `${HOME_PATH}/Documents`, false)).toEqual({
      filesystem,
      error: "is-directory",
    });
    expect(removeNode(filesystem, "asdf", true)).toEqual({
      filesystem,
      error: "not-found",
    });
  });

  it("removes a directory with all of its descendants", () => {
    const filesystem = createInitialFileSystem();
    const result = removeNode(filesystem, `${HOME_PATH}/Documents`, true);

    expect(result.error).toBeUndefined();
    expect(result.filesystem.has(`${HOME_PATH}/Documents`)).toBe(false);
    expect(result.filesystem.has(`${HOME_PATH}/Documents/notes.txt`)).toBe(
      false,
    );
    expect(result.filesystem.has(`${HOME_PATH}/Desktop`)).toBe(true);
  });
});
