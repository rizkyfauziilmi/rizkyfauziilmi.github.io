import type { ThemeMode } from "@/lib/theme";

export { isThemeMode, THEME_MODES } from "@/lib/theme";
export type { ThemeMode } from "@/lib/theme";

export type TuiView = "projects";
export type ComponentView = "about" | "help";

export type CommandResult =
  | { type: "output"; text: string; isError: boolean }
  | { type: "component"; view: ComponentView }
  | { type: "tui"; view: TuiView }
  | { type: "theme"; mode: ThemeMode; text: string }
  | { type: "reboot"; text: string }
  | { type: "shutdown"; delayMs: number; text: string }
  | { type: "shutdown-cancel" }
  | { type: "clear" }
  | { type: "blank" };

export type CommandArgument = {
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
};

export type CommandDefinition = {
  name: string;
  description: string;
  usageArgs?: string;
  arguments?: CommandArgument[];
  examples?: string[];
  acceptsArgs?: boolean;
  // Hidden commands stay runnable but are omitted from help, including -h.
  hidden?: boolean;
  run: (args: string[], context: CommandContext) => CommandResult;
};
