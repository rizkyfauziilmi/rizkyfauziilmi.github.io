import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

type CaretPosition = {
  left: number;
  top: number;
  height: number;
};

export function useBlockCaret(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
) {
  const mirrorRef = useRef<HTMLDivElement>(null);
  const prefixRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  // Skip measurement during IME composition; the composition UI owns the caret until it settles.
  const composingRef = useRef(false);
  const [position, setPosition] = useState<CaretPosition | null>(null);
  const [showCaret, setShowCaret] = useState(false);

  const measure = useCallback(() => {
    if (composingRef.current) return;

    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    const marker = markerRef.current;
    if (!textarea || !mirror || !marker) return;

    if (document.activeElement !== textarea) {
      setShowCaret(false);
      return;
    }

    // Copy text up to the real caret so the marker lands on the exact glyph boundary,
    // even when the textarea has wrapped into multiple visual lines.
    if (prefixRef.current) {
      prefixRef.current.textContent = textarea.value.slice(
        0,
        textarea.selectionStart,
      );
    }

    const mirrorRect = mirror.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const styles = window.getComputedStyle(textarea);
    const fontSize = parseFloat(styles.fontSize) || 14;
    const lineHeight = parseFloat(styles.lineHeight) || fontSize * 1.25;

    // Marker position relative to the mirror, adjusted for textarea scrolling,
    // becomes the overlay caret position.
    setPosition({
      left: markerRect.left - mirrorRect.left - textarea.scrollLeft,
      top: markerRect.top - mirrorRect.top - textarea.scrollTop,
      height: lineHeight,
    });
    setShowCaret(textarea.selectionStart === textarea.selectionEnd);
  }, [textareaRef]);

  useLayoutEffect(() => {
    measure();
  }, [measure, value]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const onCompositionStart = () => {
      composingRef.current = true;
    };
    const onCompositionEnd = () => {
      composingRef.current = false;
      schedule();
    };

    // keydown/keyup and selectionchange are required: held arrow keys do not
    // reliably fire "select", so the overlay would otherwise lag behind.
    const events = [
      "input",
      "select",
      "keydown",
      "keyup",
      "click",
      "scroll",
      "focus",
      "blur",
    ] as const;

    events.forEach((event) => textarea.addEventListener(event, schedule));
    textarea.addEventListener("compositionstart", onCompositionStart);
    textarea.addEventListener("compositionend", onCompositionEnd);
    document.addEventListener("selectionchange", schedule);
    window.addEventListener("resize", schedule);

    const observer = new ResizeObserver(schedule);
    observer.observe(textarea);

    return () => {
      cancelAnimationFrame(frame);
      events.forEach((event) => textarea.removeEventListener(event, schedule));
      textarea.removeEventListener("compositionstart", onCompositionStart);
      textarea.removeEventListener("compositionend", onCompositionEnd);
      document.removeEventListener("selectionchange", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [measure, textareaRef]);

  const caretStyle: CSSProperties | undefined = position
    ? {
        left: position.left,
        top: position.top,
        // One monospace cell wide, matching the block-caret look.
        width: "1ch",
        height: position.height,
      }
    : undefined;

  return { mirrorRef, prefixRef, markerRef, caretStyle, showCaret };
}
