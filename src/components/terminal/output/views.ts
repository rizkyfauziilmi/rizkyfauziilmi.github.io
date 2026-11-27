import type { ComponentType } from "react";

import type { TerminalView, TerminalViewProps } from "../shared";
import { AboutOutput } from "./about-output";
import { HelpOutput } from "./help-output";
import { ThemeOutput } from "./theme-output";

// Views let results render components while history keeps only plain data.
export const TERMINAL_VIEWS: Record<
  TerminalView,
  ComponentType<TerminalViewProps>
> = {
  about: AboutOutput,
  help: HelpOutput,
  theme: ThemeOutput,
};
