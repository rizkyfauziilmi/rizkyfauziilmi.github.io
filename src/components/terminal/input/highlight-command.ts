import { tokenizeWithSpans } from "../commands/parse";

export type HighlightKind = "command" | "text";

export type HighlightSegment = {
  text: string;
  kind: HighlightKind;
};

/**
 * Segment a shell line for display. Only the first token is coloured, and
 * only when the registry would actually run it. Joining every segment always
 * reproduces the original input exactly.
 */
export function highlightCommand(
  input: string,
  knownNames: ReadonlySet<string>,
): HighlightSegment[] {
  const [first] = tokenizeWithSpans(input);

  if (!first || !knownNames.has(first.value)) {
    return input ? [{ text: input, kind: "text" }] : [];
  }

  const segments: HighlightSegment[] = [];

  if (first.start > 0) {
    segments.push({ text: input.slice(0, first.start), kind: "text" });
  }
  segments.push({ text: input.slice(first.start, first.end), kind: "command" });
  if (first.end < input.length) {
    segments.push({ text: input.slice(first.end), kind: "text" });
  }

  return segments;
}
