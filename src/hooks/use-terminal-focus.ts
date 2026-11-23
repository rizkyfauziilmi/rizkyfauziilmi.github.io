import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

export function useTerminalFocus() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      if (!document.hasFocus()) return;
      if (document.activeElement === inputRef.current) return;
      inputRef.current?.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const onPointerDownCapture = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (window.getSelection()?.toString()) return;
      if (
        (event.target as HTMLElement).closest(
          "[data-slot='input-group-control']",
        )
      ) {
        return;
      }
      event.preventDefault();
      focusInput();
    },
    [focusInput],
  );

  const onKeyDownCapture = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (event.key !== "Tab") return;
      event.preventDefault();
      focusInput();
    },
    [focusInput],
  );

  const onBlur = useCallback(() => {
    focusInput();
  }, [focusInput]);

  return { inputRef, onPointerDownCapture, onKeyDownCapture, onBlur };
}
