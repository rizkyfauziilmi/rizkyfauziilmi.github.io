import type { ComponentType } from "react";

import type { TerminalView, TerminalViewProps } from "../types";
import { AboutOutput } from "./about-output";
import { ThemeOutput } from "./theme-output";

// Views let results render components while history keeps only plain data.
export const TERMINAL_VIEWS: Record<
  TerminalView,
  ComponentType<TerminalViewProps>
> = {
  about: AboutOutput,
  theme: ThemeOutput,
};
