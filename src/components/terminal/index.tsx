import { useTerminalFocus } from "@/hooks";
import { TitleBar } from "./window";
import { TerminalPane } from "./terminal-pane";

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
