import type { ComponentType } from "react";

import type { TerminalView, TerminalViewProps } from "../types";
import { AboutOutput } from "./about-output";
import { ThemeOutput } from "./theme-output";

export const TERMINAL_VIEWS: Record<
  TerminalView,
  ComponentType<TerminalViewProps>
> = {
  about: AboutOutput,
  theme: ThemeOutput,
};
