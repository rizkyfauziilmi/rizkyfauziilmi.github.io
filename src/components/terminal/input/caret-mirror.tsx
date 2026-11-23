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
        // Invisible still participates in layout, so the marker can be measured.
        // Wrapping must match the textarea or the marker lands on the wrong line.
        "invisible pointer-events-none absolute inset-0 whitespace-pre-wrap",
      )}
      style={{ textIndent: indent }}
    >
      {/* prefix holds text before the caret; the zero-width marker marks its cell. */}
      <span ref={prefixRef} />
      <span ref={markerRef} className="inline-block h-lh w-0 align-bottom" />
    </div>
  );
}
