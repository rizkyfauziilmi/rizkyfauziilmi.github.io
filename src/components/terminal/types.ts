import type { ThemeMode } from "./commands";

export type TerminalView = "about" | "theme";

export type TerminalEntry = {
  id: number;
  kind: "input" | "output";
  text: string;
  view?: TerminalView;
  themeMode?: ThemeMode;
  isError?: boolean;
};

export type TerminalViewProps = {
  entry: TerminalEntry;
};
