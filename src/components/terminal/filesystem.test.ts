import { describe, expect, it } from "vitest";

import {
  createDirectory,
  createFile,
  createInitialFileSystem,
  HOME_PATH,
  isUserWritable,
  listDirectory,
  lookupNode,
  normalizePath,
  readFile,
  removeNode,
  ROOT_PATH,
  writeFile,
} from "./filesystem";

const NOTES = [
  "Catatan kecil dari portofolio ini.",
  "",
  "Coba jalankan:",
  "  cd Documents",
  "  ls -a",
  "  cat -n notes.txt",
  "",
  "File baru bisa dibuat dengan touch dan mkdir.",
].join("\n");

describe("virtual filesystem", () => {
  it("seeds a Linux-like tree with readable file contents", () => {
    const filesystem = createInitialFileSystem();

    expect(filesystem.get(ROOT_PATH)).toEqual({ kind: "directory" });
    expect(filesystem.get("/etc/hostname")).toEqual({
      kind: "file",
      content: "portofolio",
    });
    expect(filesystem.get(`${HOME_PATH}/Documents/notes.txt`)).toEqual({
      kind: "file",
      content: NOTES,
    });
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

    expect(lookupNode(filesystem, ".bashrc")).toMatchObject({
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

  it("creates directories and reports conflicts", () => {
    const filesystem = createInitialFileSystem();
    const created = createDirectory(filesystem, `${HOME_PATH}/notes`);

    expect(created.error).toBeUndefined();
    expect(created.filesystem.get(`${HOME_PATH}/notes`)).toEqual({
      kind: "directory",
    });
    expect(filesystem.has(`${HOME_PATH}/notes`)).toBe(false);
    expect(createDirectory(filesystem, `${HOME_PATH}/a/b`).error).toBe(
      "parent-not-found",
    );
    expect(createDirectory(filesystem, `${HOME_PATH}/.bashrc/sub`).error).toBe(
      "not-a-directory",
    );
    expect(createDirectory(filesystem, `${HOME_PATH}/Desktop`).error).toBe(
      "exists",
    );
  });

  it("builds missing parents with the recursive flag", () => {
    const filesystem = createInitialFileSystem();
    const result = createDirectory(
      filesystem,
      `${HOME_PATH}/projects/web/src`,
      true,
    );

    expect(result.error).toBeUndefined();
    expect(result.filesystem.get(`${HOME_PATH}/projects`)).toEqual({
      kind: "directory",
    });
    expect(result.filesystem.get(`${HOME_PATH}/projects/web/src`)).toEqual({
      kind: "directory",
    });
  });

  it("creates empty files and leaves existing nodes untouched", () => {
    const filesystem = createInitialFileSystem();
    const created = createFile(filesystem, `${HOME_PATH}/todo.txt`);

    expect(created.error).toBeUndefined();
    expect(created.filesystem.get(`${HOME_PATH}/todo.txt`)).toEqual({
      kind: "file",
      content: "",
    });
    expect(
      createFile(filesystem, `${HOME_PATH}/Documents/notes.txt`).filesystem,
    ).toBe(filesystem);
    expect(createFile(filesystem, `${HOME_PATH}/Desktop`).filesystem).toBe(
      filesystem,
    );
    expect(createFile(filesystem, `${HOME_PATH}/a/b.txt`).error).toBe(
      "parent-not-found",
    );
  });

  it("replaces and appends file contents", () => {
    const filesystem = createInitialFileSystem();
    const path = `${HOME_PATH}/hello.txt`;
    const created = writeFile(filesystem, path, "Halo");

    expect(created.filesystem.get(path)).toEqual({
      kind: "file",
      content: "Halo",
    });

    const appended = writeFile(created.filesystem, path, "Baris 2", true);
    expect(appended.filesystem.get(path)).toEqual({
      kind: "file",
      content: "Halo\nBaris 2",
    });
    expect(writeFile(filesystem, `${HOME_PATH}/Desktop`, "x").error).toBe(
      "is-directory",
    );
  });

  it("reads stored file contents", () => {
    const filesystem = createInitialFileSystem();
    const path = `${HOME_PATH}/Documents/notes.txt`;

    expect(readFile(filesystem, path)).toEqual({ content: NOTES });
    expect(readFile(filesystem, `${HOME_PATH}/Documents`)).toEqual({
      error: "is-directory",
    });
    expect(readFile(filesystem, "asdf")).toEqual({ error: "not-found" });
  });
});
