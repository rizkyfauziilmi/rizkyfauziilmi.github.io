import type { RefObject } from "react";
import { cn } from "@/lib/utils";

import { InputGroupTextarea } from "@/components/ui/input-group";
import { useBlockCaret, type HistoryDirection } from "@/hooks";
import { INPUT_CLASSNAME, TERMINAL_INDENT } from "../constants";
import { BlockCaret } from "./block-caret";
import { CaretMirror } from "./caret-mirror";
import { CommandHighlight } from "./command-highlight";
import { useCommandInputKeys } from "./use-command-input-keys";

interface BlockCaretInputProps {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onHistoryNavigate: (direction: HistoryDirection) => boolean;
  onSubmit: () => void;
  onHelp: () => void;
  onComplete: (backward?: boolean) => void;
  onAcceptCompletion: () => boolean;
  onCancelCompletion: () => void;
  hasCompletionSelection: boolean;
  placeholder?: string;
}

export function BlockCaretInput({
  inputRef,
  value,
  onChange,
  onHistoryNavigate,
  onSubmit,
  onHelp,
  onComplete,
  onAcceptCompletion,
  onCancelCompletion,
  hasCompletionSelection,
  placeholder,
}: BlockCaretInputProps) {
  const { mirrorRef, prefixRef, markerRef, caretStyle, showCaret } =
    useBlockCaret(inputRef, value);
  const handleKeyDown = useCommandInputKeys({
    onComplete,
    onHelp,
    onHistoryNavigate,
    onSubmit,
    onAcceptCompletion,
    onCancelCompletion,
    hasCompletionSelection,
  });

  return (
    <div className="relative min-w-0 flex-1">
      <InputGroupTextarea
        ref={inputRef}
        variant="none-style"
        value={value}
        placeholder={placeholder}
        className={cn(INPUT_CLASSNAME, "text-transparent")}
        style={{ textIndent: TERMINAL_INDENT }}
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
        style={{ textIndent: TERMINAL_INDENT }}
      >
        <CommandHighlight value={value} />
      </div>
      <CaretMirror
        mirrorRef={mirrorRef}
        prefixRef={prefixRef}
        markerRef={markerRef}
        className={INPUT_CLASSNAME}
        indent={TERMINAL_INDENT}
      />
      {showCaret && caretStyle && <BlockCaret style={caretStyle} />}
    </div>
  );
}
