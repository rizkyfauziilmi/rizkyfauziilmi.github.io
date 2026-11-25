import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";

import type { ThemeMode } from "../commands";
import type { TerminalViewProps } from "../types";

const THEME_ICONS: Record<ThemeMode, LucideIcon> = {
  dark: Moon,
  light: Sun,
  system: Monitor,
};

export function ThemeOutput({ text, themeMode }: TerminalViewProps) {
  const Icon = THEME_ICONS[themeMode ?? "system"];

  return (
    <div className="flex items-center gap-2 text-sm leading-5">
      <Icon className="size-4 shrink-0 text-orange-300" />
      <span>{text}</span>
    </div>
  );
}
