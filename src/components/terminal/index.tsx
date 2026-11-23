import { useTerminalFocus } from "@/hooks";
import { TerminalPane } from "./terminal-pane";
import { TitleBar } from "./title-bar";

export { BlockCaret } from "./block-caret";
export { BlockCaretInput } from "./block-caret-input";
export { CaretMirror } from "./caret-mirror";
export { TerminalInputLine, TerminalOutputLine } from "./terminal-line";
export { TerminalPane } from "./terminal-pane";
export { TerminalPrompt } from "./terminal-prompt";

export default function Terminal() {
  const {
    inputRef,
    focusInput,
    onPointerDownCapture,
    onKeyDownCapture,
    onBlur,
  } = useTerminalFocus();

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden"
      onPointerDownCapture={onPointerDownCapture}
      onKeyDownCapture={onKeyDownCapture}
      onBlur={onBlur}
    >
      <TitleBar />
      <TerminalPane inputRef={inputRef} focusInput={focusInput} />
    </div>
  );
}
