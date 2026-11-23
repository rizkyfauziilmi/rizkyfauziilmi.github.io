import type { RefObject } from "react";

import { InputGroup } from "@/components/ui/input-group";
import { BlockCaretInput } from "./block-caret-input";
import { getPromptWidth, PROMPT } from "./constants";
import { TerminalPrompt } from "./terminal-prompt";

const DEFAULT_PLACEHOLDER = "type 'help' or ctrl+? to see command";

interface TerminalPaneProps {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  prompt?: string;
  placeholder?: string;
}

export function TerminalPane({
  inputRef,
  prompt = PROMPT,
  placeholder = DEFAULT_PLACEHOLDER,
}: TerminalPaneProps) {
  return (
    <div className="px-4 py-2">
      <InputGroup variant="none-style" className="font-mono text-sm">
        <TerminalPrompt prompt={prompt} />
        <BlockCaretInput
          inputRef={inputRef}
          indent={getPromptWidth(prompt)}
          placeholder={placeholder}
        />
      </InputGroup>
    </div>
  );
}
