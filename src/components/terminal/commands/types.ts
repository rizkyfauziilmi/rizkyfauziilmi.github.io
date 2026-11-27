import type { ThemeMode } from "@/lib/theme";

import type { VirtualFileSystem } from "../filesystem";

export type { ThemeMode } from "@/lib/theme";

export type TuiView = "projects" | "contact" | "cv";
export type ComponentView = "about" | "help";

export type CommandResult =
  | {
      type: "output";
      text: string;
      isError: boolean;
      filesystem?: VirtualFileSystem;
      cwd?: string;
    }
  | { type: "component"; view: ComponentView }
  | { type: "tui"; view: TuiView }
  | { type: "download"; url: string; filename: string; text: string }
  | { type: "theme"; mode: ThemeMode; text: string }
  | { type: "reboot"; text: string }
  | { type: "shutdown"; delayMs: number; text: string }
  | { type: "shutdown-cancel" }
  | { type: "clear" }
  | { type: "blank"; filesystem?: VirtualFileSystem; cwd?: string };

export type CommandArgument = {
  name: string;
  description: string;
  // Concrete tokens offered by Tab completion. Labels like "+N" stay display-only.
  values?: string[];
};

export type CommandFlag = {
  name: string;
  description: string;
};

// Snapshot supplied by the shell so commands stay pure and testable.
export type CommandContext = {
  theme: ThemeMode;
  now: Date;
  viewport: { width: number; height: number };
  platform: string;
  userAgent: string;
  uptimeMs: number;
  filesystem: VirtualFileSystem;
  cwd: string;
};

export type CommandDefinition = {
  name: string;
  description: string;
  usageArgs?: string;
  arguments?: CommandArgument[];
  flags?: CommandFlag[];
  examples?: string[];
  acceptsArgs?: boolean;
  // Hidden commands stay runnable but are omitted from help, including -h.
  hidden?: boolean;
  // Commands suggested by the about card as ways to get to know the owner.
  // About itself is intentionally not flagged, so it never lists itself.
  suggestInAbout?: boolean;
  run: (args: string[], context: CommandContext) => CommandResult;
};
