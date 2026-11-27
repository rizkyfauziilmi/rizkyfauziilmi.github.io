import { TerminalInputLine } from "../input";
import { PROMPT, type TerminalEntry } from "../shared";
import { TerminalOutputLine } from "./terminal-output-line";
import { TERMINAL_VIEWS } from "./views";

// One place that turns serializable history data into rendered output.
export function TerminalEntryView({ entry }: { entry: TerminalEntry }) {
  if (entry.kind === "input") {
    return (
      <TerminalInputLine text={entry.text} prompt={entry.prompt ?? PROMPT} />
    );
  }

  const View = entry.view ? TERMINAL_VIEWS[entry.view] : null;
  if (View) {
    return <View text={entry.text} themeMode={entry.themeMode} />;
  }

  return <TerminalOutputLine text={entry.text} isError={entry.isError} />;
}
