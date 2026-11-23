export const APP_USER = "rizkyfauziilmi";
export const APP_HOST = "portofolio";
export const TERMINAL_TITLE = `${APP_USER}@${APP_HOST}`;
export const PROMPT = `${TERMINAL_TITLE}:~$`;

export const LINE_CLASSNAME =
  "min-h-[1lh] break-words whitespace-pre-wrap text-sm leading-5";
export const INPUT_CLASSNAME = "break-words text-sm leading-5 caret-transparent";

export function getPromptWidth(prompt: string) {
  return `${prompt.length + 1}ch`;
}
