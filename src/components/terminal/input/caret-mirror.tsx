import type { RefObject } from "react";
import { cn } from "cn";

interface CaretMirrorProps {
  mirrorRef: RefObject<HTMLDivElement | null>;
  prefixRef: RefObject<HTMLSpanElement | null>;
  markerRef: RefObject<HTMLSpanElement | null>;
  className: string;
  indent: string;
}

export function CaretMirror({
  mirrorRef,
  prefixRef,
  markerRef,
  className,
  indent,
}: CaretMirrorProps) {
  return (
    <div
      ref={mirrorRef}
      aria-hidden
      className={cn(
        className,
        "invisible pointer-events-none absolute inset-0 whitespace-pre-wrap",
      )}
      style={{ textIndent: indent }}
    >
      <span ref={prefixRef} />
      <span ref={markerRef} className="inline-block h-lh w-0 align-bottom" />
    </div>
  );
}
