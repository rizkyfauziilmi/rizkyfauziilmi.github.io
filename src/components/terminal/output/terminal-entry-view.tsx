import type { TerminalEntry } from "../types";
import { TerminalInputLine } from "../input";
import { TerminalOutputLine } from "./terminal-output-line";
import { TERMINAL_VIEWS } from "./views";

interface TerminalEntryViewProps {
  entry: TerminalEntry;
  prompt: string;
  indent: string;
}

// One place that turns serializable history data into rendered output.
export function TerminalEntryView({
  entry,
  prompt,
  indent,
}: TerminalEntryViewProps) {
  if (entry.kind === "input") {
    return (
      <TerminalInputLine prompt={prompt} text={entry.text} indent={indent} />
    );
  }

  const View = entry.view ? TERMINAL_VIEWS[entry.view] : null;
  if (View) return <View entry={entry} />;

  return <TerminalOutputLine text={entry.text} isError={entry.isError} />;
}
