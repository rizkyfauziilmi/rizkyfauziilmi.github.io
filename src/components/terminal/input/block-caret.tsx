import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface BlockCaretProps {
  style: CSSProperties;
  className?: string;
}

export function BlockCaret({ style, className }: BlockCaretProps) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute z-10 bg-primary", className)}
      style={style}
    />
  );
}
