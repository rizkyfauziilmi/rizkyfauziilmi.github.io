import { useTerminalFocus } from "@/hooks";
import { TerminalPane } from "./terminal-pane";
import { TitleBar } from "./title-bar";

export { BlockCaret } from "./block-caret";
export { BlockCaretInput } from "./block-caret-input";
export { CaretMirror } from "./caret-mirror";
export { TerminalPane } from "./terminal-pane";
export { TerminalPrompt } from "./terminal-prompt";

export default function Terminal() {
  const { inputRef, onPointerDownCapture, onKeyDownCapture, onBlur } =
    useTerminalFocus();

  return (
    <div
      className="min-h-screen"
      onPointerDownCapture={onPointerDownCapture}
      onKeyDownCapture={onKeyDownCapture}
      onBlur={onBlur}
    >
      <TitleBar />
      <TerminalPane inputRef={inputRef} />
    </div>
  );
}
