import {
  useCallback,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";

import { InputGroupTextarea } from "@/components/ui/input-group";
import { useBlockCaret, type HistoryDirection } from "@/hooks";
import { INPUT_CLASSNAME } from "../constants";
import { BlockCaret } from "./block-caret";
import { CaretMirror } from "./caret-mirror";
import { CommandHighlight } from "./command-highlight";

interface BlockCaretInputProps {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  indent: string;
  value: string;
  onChange: (value: string) => void;
  onHistoryNavigate: (direction: HistoryDirection) => boolean;
  onSubmit: () => void;
  onHelp: () => void;
  placeholder?: string;
  className?: string;
  caretClassName?: string;
}

export function BlockCaretInput({
  inputRef,
  indent,
  value,
  onChange,
  onHistoryNavigate,
  onSubmit,
  onHelp,
  placeholder,
  className,
  caretClassName,
}: BlockCaretInputProps) {
  const { mirrorRef, prefixRef, markerRef, caretStyle, showCaret } =
    useBlockCaret(inputRef, value);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl+? (or Ctrl+/) is the global help shortcut, handled before arrow/Enter logic.
      if (
        (event.ctrlKey || event.metaKey) &&
        (event.key === "?" || event.key === "/")
      ) {
        event.preventDefault();
        onHelp();
        return;
      }

      // Only swallow the key when history actually handled it; otherwise native
      // caret navigation stays intact. Modified arrows are left alone too.
      if (
        (event.key === "ArrowUp" || event.key === "ArrowDown") &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.shiftKey
      ) {
        const direction: HistoryDirection =
          event.key === "ArrowUp" ? "previous" : "next";
        if (onHistoryNavigate(direction)) event.preventDefault();
        return;
      }

      if (event.key !== "Enter") return;
      event.preventDefault();
      onSubmit();
    },
    [onHelp, onHistoryNavigate, onSubmit],
  );

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <InputGroupTextarea
        ref={inputRef}
        variant="none-style"
        value={value}
        placeholder={placeholder}
        className={cn(INPUT_CLASSNAME, "text-transparent")}
        style={{ textIndent: indent }}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      {/* Visible tokens sit above the transparent textarea; the invisible
          CaretMirror below still owns caret measurement. */}
      <div
        aria-hidden
        data-command-highlight-overlay=""
        className={cn(
          INPUT_CLASSNAME,
          "pointer-events-none absolute inset-0 whitespace-pre-wrap",
        )}
        style={{ textIndent: indent }}
      >
        <CommandHighlight value={value} />
      </div>
      <CaretMirror
        mirrorRef={mirrorRef}
        prefixRef={prefixRef}
        markerRef={markerRef}
        className={INPUT_CLASSNAME}
        indent={indent}
      />
      {showCaret && caretStyle && (
        <BlockCaret style={caretStyle} className={caretClassName} />
      )}
    </div>
  );
}
