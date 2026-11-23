export const APP_USER = "rizkyfauziilmi";
export const APP_HOST = "portofolio";
export const TERMINAL_TITLE = `${APP_USER}@${APP_HOST}`;
export const PROMPT = `${TERMINAL_TITLE}:~$`;

// min-h-[1lh] reserves one line box so wrapped lines never overlap the next entry.
export const LINE_CLASSNAME =
  "min-h-[1lh] break-words whitespace-pre-wrap text-sm leading-5";
export const INPUT_CLASSNAME = "break-words text-sm leading-5 caret-transparent";

// +1 reserves the space after the prompt. Assumes ASCII: emoji/wide glyphs
// are not one monospace cell and would break this 1ch estimate.
export function getPromptWidth(prompt: string) {
  return `${prompt.length + 1}ch`;
}
