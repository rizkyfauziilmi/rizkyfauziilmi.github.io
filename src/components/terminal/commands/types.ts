import type { ThemeMode } from "@/lib/theme";

export { isThemeMode, THEME_MODES } from "@/lib/theme";
export type { ThemeMode } from "@/lib/theme";

export type CommandResult =
  | { type: "output"; text: string; isError: boolean }
  | { type: "component"; view: "about" }
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

export type CommandDefinition = {
  name: string;
  description: string;
  usageArgs?: string;
  arguments?: CommandArgument[];
  examples?: string[];
  acceptsArgs?: boolean;
  // Hidden commands stay runnable but are omitted from help, including -h.
  hidden?: boolean;
  run: (args: string[]) => CommandResult;
};
