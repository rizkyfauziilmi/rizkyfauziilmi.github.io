import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";

import { InputGroup } from "@/components/ui/input-group";
import { useCommandHistory, useTerminalHistory } from "@/hooks";
import { getPromptWidth, PROMPT } from "./constants";
import { BlockCaretInput, TerminalPrompt } from "./input";
import { HaltedScreen, TerminalEntryView } from "./output";

const DEFAULT_PLACEHOLDER = "type 'help' or ctrl+? to see command";

interface TerminalPaneProps {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  focusInput: () => void;
  prompt?: string;
  placeholder?: string;
}

export function TerminalPane({
  inputRef,
  focusInput,
  prompt = PROMPT,
  placeholder = DEFAULT_PLACEHOLDER,
}: TerminalPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { entries, commands, submit, isHalted, powerOn } = useTerminalHistory();
  const { value, changeValue, navigate, reset } = useCommandHistory(
    commands,
    inputRef,
  );
  const indent = getPromptWidth(prompt);

  const scrollToEnd = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    scrollToEnd();
  }, [entries, value, scrollToEnd]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Content height can change after render (wrapped text, avatar image),
    // so scrolling on entries alone is not enough.
    const observer = new ResizeObserver(scrollToEnd);
    observer.observe(container);

    return () => observer.disconnect();
  }, [scrollToEnd]);

  const execute = useCallback(
    (command: string) => {
      if (!submit(command)) return;
      reset();
      focusInput();
    },
    [submit, reset, focusInput],
  );

  const runValue = useCallback(() => execute(value), [execute, value]);
  const runHelp = useCallback(() => execute("help"), [execute]);

  return (
    // min-h-0 lets the pane shrink in the flex column; scrolling stays here
    // so the title bar is never pushed off-screen.
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto px-4 py-2 font-mono text-sm"
    >
      {isHalted ? (
        <HaltedScreen onPowerOn={powerOn} />
      ) : (
        <div className="flex flex-col gap-1">
          {entries.map((entry) => (
            <TerminalEntryView
              key={entry.id}
              entry={entry}
              prompt={prompt}
              indent={indent}
            />
          ))}
          <InputGroup variant="none-style">
            <TerminalPrompt prompt={prompt} />
            <BlockCaretInput
              inputRef={inputRef}
              indent={indent}
              value={value}
              onChange={changeValue}
              onHistoryNavigate={navigate}
              onSubmit={runValue}
              onHelp={runHelp}
              placeholder={placeholder}
            />
          </InputGroup>
        </div>
      )}
    </div>
  );
}
