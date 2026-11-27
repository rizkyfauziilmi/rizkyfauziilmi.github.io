import {
  createInitialFileSystem,
  HOME_PATH,
  listDirectory,
  lookupNode,
  type VirtualFileSystem,
} from "../filesystem";
import type { CompletionCatalog } from "./complete";
import { getDeclaredFlags, getHelpTokens } from "./flags";
import { COMMAND_DEFINITIONS } from "./registry";

// Every runnable command, including hidden eggs and aliases: highlighting must
// agree with runCommand about what the shell recognises.
export const KNOWN_COMMAND_NAMES: ReadonlySet<string> = new Set(
  COMMAND_DEFINITIONS.map((command) => command.name),
);

const PATH_COMMANDS = new Set(["cd", "ls", "rm"]);

function pathCandidates(
  filesystem: VirtualFileSystem,
  cwd: string,
  prefix: string,
) {
  const slash = prefix.lastIndexOf("/");
  // Keep the typed directory prefix so `/etc/h` matches `/etc/hostname`.
  const base = slash >= 0 ? prefix.slice(0, slash + 1) : "";
  const namePrefix = slash >= 0 ? prefix.slice(slash + 1) : prefix;
  const found = lookupNode(filesystem, base || ".", cwd);
  if (!found || found.node.kind !== "directory") return [];

  return listDirectory(filesystem, found.path, namePrefix.startsWith(".")).map(
    (name) => {
      const child = lookupNode(filesystem, `${found.path}/${name}`, cwd);
      return `${base}${name}${child?.node.kind === "directory" ? "/" : ""}`;
    },
  );
}

/** Registry snapshot consumed by pure completion and the input hook. */
export function createCompletionCatalog(
  filesystem: VirtualFileSystem,
  cwd: string = HOME_PATH,
): CompletionCatalog {
  return {
    commandNames: KNOWN_COMMAND_NAMES,
    commands: new Map(
      COMMAND_DEFINITIONS.map((command) => [command.name, command]),
    ),
    flagsFor: (command, isFirstArgument) => [
      ...getDeclaredFlags(command).map((flag) => flag.name),
      ...(isFirstArgument ? getHelpTokens(command) : []),
    ],
    pathsFor: (command, prefix) =>
      PATH_COMMANDS.has(command.name)
        ? pathCandidates(filesystem, cwd, prefix)
        : [],
  };
}

export const COMMAND_CATALOG = createCompletionCatalog(
  createInitialFileSystem(),
);
