import { HOME_PATH } from "./filesystem";

export const APP_USER = "rizkyfauziilmi";
export const APP_HOST = "portofolio";
export const TERMINAL_TITLE = `${APP_USER}@${APP_HOST}`;
// A real shell echoes ^C at the interrupted line before starting a new prompt.
export const INTERRUPT_MARKER = "^C";

/** Shell prompts abbreviate home as `~`, including its subdirectories. */
export function formatPromptPath(cwd: string) {
  if (cwd === HOME_PATH) return "~";
  if (cwd.startsWith(`${HOME_PATH}/`)) return `~${cwd.slice(HOME_PATH.length)}`;
  return cwd;
}

export function buildPrompt(cwd: string) {
  return `${TERMINAL_TITLE}:${formatPromptPath(cwd)}$`;
}

export const PROMPT = buildPrompt(HOME_PATH);

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
