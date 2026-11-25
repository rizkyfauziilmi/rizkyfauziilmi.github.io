import { KNOWN_COMMAND_NAMES } from "../commands";
import { highlightCommand, type HighlightKind } from "./highlight-command";

const TOKEN_CLASSNAME: Record<HighlightKind, string | undefined> = {
  command: "text-orange-300",
  text: undefined,
};

/** Render a shell line with registry-aware colours. */
export function CommandHighlight({ value }: { value: string }) {
  const segments = highlightCommand(value, KNOWN_COMMAND_NAMES);

  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={`${index}-${segment.kind}`}
          data-highlight-kind={segment.kind}
          className={TOKEN_CLASSNAME[segment.kind]}
        >
          {segment.text}
        </span>
      ))}
    </>
  );
}
