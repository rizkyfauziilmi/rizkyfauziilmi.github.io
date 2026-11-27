import type { ComponentView, ThemeMode } from "../commands";

export type TerminalView = ComponentView | "theme";

export type TerminalEntry = {
  id: number;
  kind: "input" | "output";
  text: string;
  // Prompt snapshot for input lines; output entries ignore it.
  prompt?: string;
  view?: TerminalView;
  themeMode?: ThemeMode;
  isError?: boolean;
};

export type TerminalViewProps = {
  text: string;
  themeMode?: ThemeMode;
};
