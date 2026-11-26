import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentType,
  type RefObject,
} from "react";

import { InputGroup } from "@/components/ui/input-group";
import { useTerminalShell } from "@/hooks";
import type { TuiView } from "./commands";
import { PROMPT } from "./constants";
import { BlockCaretInput, TerminalPrompt } from "./input";
import { CommandSuggestions, HaltedScreen, TerminalEntryView } from "./output";
import { ContactTui, CvTui, ProjectsTui } from "./tui";

const DEFAULT_PLACEHOLDER = "type 'help' or ctrl+? to see command";

const TUI_VIEWS: Record<TuiView, ComponentType<{ onExit: () => void }>> = {
  projects: ProjectsTui,
  contact: ContactTui,
  cv: CvTui,
};

interface TerminalPaneProps {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  focusInput: () => void;
}

export function TerminalPane({ inputRef, focusInput }: TerminalPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    entries,
    value,
    isHalted,
    activeTui,
    changeValue,
    navigate,
    complete,
    suggestions,
    activeSuggestion,
    hasSelection,
    acceptCompletion,
    clearSuggestions,
    interruptLine,
    runValue,
    runHelp,
    leaveTui,
    powerOn,
  } = useTerminalShell({ inputRef, focusInput });

  const scrollToEnd = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    scrollToEnd();
  }, [entries, value, suggestions, scrollToEnd]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Content height can change after render (wrapped text, avatar image),
    // so scrolling on entries alone is not enough.
    const observer = new ResizeObserver(scrollToEnd);
    observer.observe(container);

    return () => observer.disconnect();
  }, [scrollToEnd]);

  const showsTui = !isHalted && activeTui !== null;
  const ActiveTui = activeTui ? TUI_VIEWS[activeTui] : null;

  return (
    // min-h-0 lets the pane shrink in the flex column; scrolling stays here
    // so the title bar is never pushed off-screen. The TUI owns its own scroll.
    <div
      ref={scrollRef}
      className={
        "min-h-0 flex-1 px-4 py-2 font-mono text-sm " +
        (showsTui ? "overflow-hidden" : "overflow-y-auto")
      }
    >
      {isHalted ? (
        <HaltedScreen onPowerOn={powerOn} />
      ) : ActiveTui ? (
        <ActiveTui onExit={leaveTui} />
      ) : (
        <div className="flex flex-col gap-1">
          {entries.map((entry) => (
            <TerminalEntryView key={entry.id} entry={entry} />
          ))}
          <InputGroup variant="none-style">
            <TerminalPrompt prompt={PROMPT} />
            <BlockCaretInput
              inputRef={inputRef}
              value={value}
              onChange={changeValue}
              onHistoryNavigate={navigate}
              onComplete={complete}
              onAcceptCompletion={acceptCompletion}
              onCancelCompletion={clearSuggestions}
              hasCompletionSelection={hasSelection}
              onSubmit={runValue}
              onHelp={runHelp}
              onInterrupt={interruptLine}
              placeholder={DEFAULT_PLACEHOLDER}
            />
          </InputGroup>
          <CommandSuggestions
            names={suggestions}
            activeIndex={activeSuggestion}
          />
        </div>
      )}
    </div>
  );
}
