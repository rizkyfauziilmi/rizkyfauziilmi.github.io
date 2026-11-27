export type FsNodeKind = "file" | "directory";
export type FsNode = { kind: FsNodeKind };
export type VirtualFileSystem = ReadonlyMap<string, FsNode>;

export const ROOT_PATH = "/";
export const HOME_PATH = "/home/rizkyfauziilmi";

const SEED_NODES: Record<string, FsNodeKind> = {
  [ROOT_PATH]: "directory",
  "/bin": "directory",
  "/etc": "directory",
  "/etc/hostname": "file",
  "/home": "directory",
  [HOME_PATH]: "directory",
  [`${HOME_PATH}/.bashrc`]: "file",
  [`${HOME_PATH}/.profile`]: "file",
  [`${HOME_PATH}/.config`]: "directory",
  [`${HOME_PATH}/.config/git`]: "directory",
  [`${HOME_PATH}/Desktop`]: "directory",
  [`${HOME_PATH}/Documents`]: "directory",
  [`${HOME_PATH}/Documents/notes.txt`]: "file",
  [`${HOME_PATH}/Downloads`]: "directory",
  [`${HOME_PATH}/Music`]: "directory",
  [`${HOME_PATH}/Pictures`]: "directory",
  [`${HOME_PATH}/Public`]: "directory",
  [`${HOME_PATH}/Templates`]: "directory",
  [`${HOME_PATH}/Videos`]: "directory",
  "/tmp": "directory",
  "/usr": "directory",
  "/var": "directory",
};

export function createInitialFileSystem(): VirtualFileSystem {
  return new Map(
    Object.entries(SEED_NODES).map(([path, kind]) => [path, { kind }]),
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
