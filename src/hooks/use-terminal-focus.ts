import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

export function useTerminalFocus() {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Defer to the next frame and ignore unfocused tabs so focus restoration
  // never pulls attention away from another window.
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

  // Capture phase keeps clicks outside the control (including the title bar)
  // from stealing the terminal's exclusive focus.
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

  // Tab is blocked at the root so focus can never escape the terminal input.
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

  return {
    inputRef,
    focusInput,
    onPointerDownCapture,
    onKeyDownCapture,
    onBlur,
  };
}
