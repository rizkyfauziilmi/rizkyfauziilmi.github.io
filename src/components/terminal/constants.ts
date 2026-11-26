export const APP_USER = "rizkyfauziilmi";
export const APP_HOST = "portofolio";
export const TERMINAL_TITLE = `${APP_USER}@${APP_HOST}`;
export const PROMPT = `${TERMINAL_TITLE}:~$`;
// A real shell echoes ^C at the interrupted line before starting a new prompt.
export const INTERRUPT_MARKER = "^C";

// min-h-[1lh] reserves one line box so wrapped lines never overlap the next entry.
export const LINE_CLASSNAME =
  "min-h-[1lh] break-words whitespace-pre-wrap text-sm leading-5";
export const INPUT_CLASSNAME =
  "break-words text-sm leading-5 caret-transparent";

// +1 reserves the space after the prompt. Assumes ASCII: emoji/wide glyphs
// are not one monospace cell and would break this 1ch estimate.
export function getPromptWidth(prompt: string) {
  return `${prompt.length + 1}ch`;
}

// The shell prompt is fixed, so every line can share the same indent instead
// of threading it through components that only forward it.
export const TERMINAL_INDENT = getPromptWidth(PROMPT);
