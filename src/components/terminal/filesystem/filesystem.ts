export type FsNodeKind = "file" | "directory";
export type FsNode = { kind: "directory" } | { kind: "file"; content: string };
export type VirtualFileSystem = ReadonlyMap<string, FsNode>;

export const ROOT_PATH = "/";
export const HOME_PATH = "/home/rizkyfauziilmi";

const SEED_NODES: Record<string, FsNode> = {
  [ROOT_PATH]: { kind: "directory" },
  "/bin": { kind: "directory" },
  "/etc": { kind: "directory" },
  "/etc/hostname": { kind: "file", content: "portofolio" },
  "/home": { kind: "directory" },
  [HOME_PATH]: { kind: "directory" },
  [`${HOME_PATH}/.bashrc`]: {
    kind: "file",
    content: [
      "# ~/.bashrc: executed for interactive shells.",
      "alias h='help'",
      "alias ..='cd ..'",
      "export EDITOR=vim",
    ].join("\n"),
  },
  [`${HOME_PATH}/.profile`]: {
    kind: "file",
    content: [
      "# ~/.profile: executed by the login shell.",
      'if [ -n "$BASH_VERSION" ]; then',
      '    . "$HOME/.bashrc"',
      "fi",
      'export PATH="$HOME/bin:$PATH"',
    ].join("\n"),
  },
  [`${HOME_PATH}/.config`]: { kind: "directory" },
  [`${HOME_PATH}/.config/git`]: { kind: "directory" },
  [`${HOME_PATH}/Desktop`]: { kind: "directory" },
  [`${HOME_PATH}/Documents`]: { kind: "directory" },
  [`${HOME_PATH}/Documents/notes.txt`]: {
    kind: "file",
    content: [
      "Catatan kecil dari portofolio ini.",
      "",
      "Coba jalankan:",
      "  cd Documents",
      "  ls -a",
      "  cat -n notes.txt",
      "",
      "File baru bisa dibuat dengan touch dan mkdir.",
    ].join("\n"),
  },
  [`${HOME_PATH}/Downloads`]: { kind: "directory" },
  [`${HOME_PATH}/Music`]: { kind: "directory" },
  [`${HOME_PATH}/Pictures`]: { kind: "directory" },
  [`${HOME_PATH}/Public`]: { kind: "directory" },
  [`${HOME_PATH}/Templates`]: { kind: "directory" },
  [`${HOME_PATH}/Videos`]: { kind: "directory" },
  "/tmp": { kind: "directory" },
  "/usr": { kind: "directory" },
  "/var": { kind: "directory" },
};

export function createInitialFileSystem(): VirtualFileSystem {
  return new Map(
    Object.entries(SEED_NODES).map(([path, node]) => [path, { ...node }]),
  );
}

/** Resolve a shell path to a normalized absolute path under `/`. */
export function normalizePath(input: string, cwd: string = HOME_PATH): string {
  const expanded =
    input.startsWith("/") || input === "~" || input.startsWith("~/")
      ? input === "~" || input.startsWith("~/")
        ? `${HOME_PATH}${input.slice(1)}`
        : input
      : `${cwd}/${input}`;

  const segments: string[] = [];
  for (const segment of expanded.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }

  return `/${segments.join("/")}`;
}

export function lookupNode(
  filesystem: VirtualFileSystem,
  input: string,
  cwd: string = HOME_PATH,
): { path: string; node: FsNode } | null {
  const path = normalizePath(input, cwd);
  const node = filesystem.get(path);
  return node ? { path, node } : null;
}

/** Only entries strictly inside home are writable without sudo. */
export function isUserWritable(path: string) {
  return path.startsWith(`${HOME_PATH}/`);
}

function childPrefix(path: string) {
  return path === ROOT_PATH ? ROOT_PATH : `${path}/`;
}

function parentPath(path: string) {
  const slash = path.lastIndexOf("/");
  return slash <= 0 ? ROOT_PATH : path.slice(0, slash);
}

/** Immediate child names of a directory, sorted like a shell listing. */
export function listDirectory(
  filesystem: VirtualFileSystem,
  path: string,
  includeHidden = false,
): string[] {
  const prefix = childPrefix(path);
  const names: string[] = [];

  for (const entry of filesystem.keys()) {
    if (entry === path || !entry.startsWith(prefix)) continue;
    const rest = entry.slice(prefix.length);
    if (!rest || rest.includes("/")) continue;
    if (!includeHidden && rest.startsWith(".")) continue;
    names.push(rest);
  }

  return names.sort();
}

export type WriteError =
  "parent-not-found" | "not-a-directory" | "is-directory";

export type RemoveResult = {
  filesystem: VirtualFileSystem;
  error?: "not-found" | "is-directory";
};

/** Remove a node, returning a new tree and leaving the original untouched. */
export function removeNode(
  filesystem: VirtualFileSystem,
  path: string,
  recursive: boolean,
): RemoveResult {
  const node = filesystem.get(path);
  if (!node) return { filesystem, error: "not-found" };
  if (node.kind === "directory" && !recursive) {
    return { filesystem, error: "is-directory" };
  }

  const next = new Map(filesystem);
  const prefix = childPrefix(path);
  for (const entry of next.keys()) {
    if (entry !== path && entry.startsWith(prefix)) next.delete(entry);
  }
  next.delete(path);

  return { filesystem: next };
}

function requireParent(
  filesystem: VirtualFileSystem,
  path: string,
): WriteError | null {
  const parent = filesystem.get(parentPath(path));
  if (!parent) return "parent-not-found";
  if (parent.kind !== "directory") return "not-a-directory";
  return null;
}

export type CreateDirectoryResult = {
  filesystem: VirtualFileSystem;
  error?: WriteError | "exists";
};

/** Create a directory; `parents` builds missing ancestors like `mkdir -p`. */
export function createDirectory(
  filesystem: VirtualFileSystem,
  path: string,
  parents = false,
): CreateDirectoryResult {
  if (filesystem.has(path)) return { filesystem, error: "exists" };

  const parentError = requireParent(filesystem, path);
  if (parentError === "parent-not-found" && parents) {
    const parent = createDirectory(filesystem, parentPath(path), true);
    if (parent.error) return parent;
    filesystem = parent.filesystem;
  } else if (parentError) {
    return { filesystem, error: parentError };
  }

  return {
    filesystem: new Map(filesystem).set(path, { kind: "directory" }),
  };
}

export type CreateFileResult = {
  filesystem: VirtualFileSystem;
  error?: WriteError;
};

/** Create an empty file; existing files and directories are left untouched. */
export function createFile(
  filesystem: VirtualFileSystem,
  path: string,
): CreateFileResult {
  if (filesystem.has(path)) return { filesystem };

  const parentError = requireParent(filesystem, path);
  if (parentError) return { filesystem, error: parentError };

  return {
    filesystem: new Map(filesystem).set(path, {
      kind: "file",
      content: "",
    }),
  };
}

export type WriteFileResult = {
  filesystem: VirtualFileSystem;
  error?: WriteError;
};

/** Write text to a file, replacing it or appending one line. */
export function writeFile(
  filesystem: VirtualFileSystem,
  path: string,
  text: string,
  append = false,
): WriteFileResult {
  const existing = filesystem.get(path);
  if (existing?.kind === "directory") {
    return { filesystem, error: "is-directory" };
  }

  const parentError = requireParent(filesystem, path);
  if (parentError) return { filesystem, error: parentError };

  const previous = existing?.kind === "file" ? existing.content : "";
  const content = append && previous ? `${previous}\n${text}` : text;

  return {
    filesystem: new Map(filesystem).set(path, { kind: "file", content }),
  };
}

export type ReadFileResult = {
  content?: string;
  error?: "not-found" | "is-directory";
};

/** Read a file's stored text. */
export function readFile(
  filesystem: VirtualFileSystem,
  path: string,
): ReadFileResult {
  const node = filesystem.get(path);
  if (!node) return { error: "not-found" };
  if (node.kind === "directory") return { error: "is-directory" };
  return { content: node.content };
}
