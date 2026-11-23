import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";
import { cn } from "cn";

import { InputGroupTextarea } from "@/components/ui/input-group";
import { useBlockCaret } from "@/hooks";
import { INPUT_CLASSNAME } from "../constants";
import { BlockCaret } from "./block-caret";
import { CaretMirror } from "./caret-mirror";

interface BlockCaretInputProps {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  indent: string;
  value: string;
  onChange: (value: string) => void;
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
  onSubmit,
  onHelp,
  placeholder,
  className,
  caretClassName,
}: BlockCaretInputProps) {
  const { mirrorRef, prefixRef, markerRef, caretStyle, showCaret } =
    useBlockCaret(inputRef, value);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      (event.key === "?" || event.key === "/")
    ) {
      event.preventDefault();
      onHelp();
      return;
    }

    if (event.key !== "Enter") return;
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <InputGroupTextarea
        ref={inputRef}
        variant="none-style"
        value={value}
        placeholder={placeholder}
        className={INPUT_CLASSNAME}
        style={{ textIndent: indent }}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
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
