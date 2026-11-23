import type { RefObject } from "react";
import { cn } from "cn";

import { InputGroupTextarea } from "@/components/ui/input-group";
import { useBlockCaret } from "@/hooks";
import { BlockCaret } from "./block-caret";
import { CaretMirror } from "./caret-mirror";

const INPUT_CLASSNAME = "break-words text-sm leading-5 caret-transparent";

interface BlockCaretInputProps {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  indent: string;
  placeholder?: string;
  className?: string;
  caretClassName?: string;
}

export function BlockCaretInput({
  inputRef,
  indent,
  placeholder,
  className,
  caretClassName,
}: BlockCaretInputProps) {
  const { mirrorRef, prefixRef, markerRef, caretStyle, showCaret } =
    useBlockCaret(inputRef);

  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <InputGroupTextarea
        ref={inputRef}
        variant="none-style"
        placeholder={placeholder}
        className={INPUT_CLASSNAME}
        style={{ textIndent: indent }}
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
