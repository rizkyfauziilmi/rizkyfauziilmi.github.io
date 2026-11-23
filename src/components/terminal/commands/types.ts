export const THEME_MODES = ["dark", "light", "system"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export function isThemeMode(value: string | undefined): value is ThemeMode {
  return THEME_MODES.includes(value as ThemeMode);
}

export type CommandResult =
  | { type: "output"; text: string; isError: boolean }
  | { type: "component"; view: "about" }
  | { type: "theme"; mode: ThemeMode; text: string }
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
  acceptsArgs?: boolean;
  run: (args: string[]) => CommandResult;
};
