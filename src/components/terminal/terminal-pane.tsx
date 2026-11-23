import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type RefObject,
} from "react";

import { InputGroup } from "@/components/ui/input-group";
import { AboutOutput } from "./about-output";
import { BlockCaretInput } from "./block-caret-input";
import { getPromptWidth, PROMPT } from "./constants";
import { TerminalInputLine, TerminalOutputLine } from "./terminal-line";
import { TerminalPrompt } from "./terminal-prompt";
import { ThemeOutput } from "./theme-output";
import {
  useTerminalHistory,
  type TerminalEntry,
  type TerminalView,
} from "./use-terminal-history";

const DEFAULT_PLACEHOLDER = "type 'help' or ctrl+? to see command";

const TERMINAL_VIEWS: Record<
  TerminalView,
  ComponentType<{ entry: TerminalEntry }>
> = {
  about: AboutOutput,
  theme: ThemeOutput,
};

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
  const [value, setValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { entries, submit } = useTerminalHistory();
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

    const observer = new ResizeObserver(scrollToEnd);
    observer.observe(container);

    return () => observer.disconnect();
  }, [scrollToEnd]);

  const execute = (command: string) => {
    if (!submit(command)) return;
    setValue("");
    focusInput();
  };

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto px-4 py-2 font-mono text-sm"
    >
      <div className="flex flex-col gap-1">
        {entries.map((entry) => {
          if (entry.kind === "input") {
            return (
              <TerminalInputLine
                key={entry.id}
                prompt={prompt}
                text={entry.text}
                indent={indent}
              />
            );
          }

          const View = entry.view ? TERMINAL_VIEWS[entry.view] : null;
          if (View) return <View key={entry.id} entry={entry} />;

          return (
            <TerminalOutputLine
              key={entry.id}
              text={entry.text}
              isError={entry.isError}
            />
          );
        })}
        <InputGroup variant="none-style">
          <TerminalPrompt prompt={prompt} />
          <BlockCaretInput
            inputRef={inputRef}
            indent={indent}
            value={value}
            onChange={setValue}
            onSubmit={() => execute(value)}
            onHelp={() => execute("help")}
            placeholder={placeholder}
          />
        </InputGroup>
      </div>
    </div>
  );
}
