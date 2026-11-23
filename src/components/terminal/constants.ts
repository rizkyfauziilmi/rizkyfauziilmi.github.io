export const APP_USER = "rizkyfauziilmi";
export const APP_HOST = "portofolio";
export const TERMINAL_TITLE = `${APP_USER}@${APP_HOST}`;
export const PROMPT = `${TERMINAL_TITLE}:~$`;

export function getPromptWidth(prompt: string) {
  return `${prompt.length + 1}ch`;
}

export const PROMPT_WIDTH = getPromptWidth(PROMPT);
