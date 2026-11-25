export const THEME_MODES = ["dark", "light", "system"] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export function isThemeMode(
  value: string | undefined | null,
): value is ThemeMode {
  return value != null && (THEME_MODES as readonly string[]).includes(value);
}
