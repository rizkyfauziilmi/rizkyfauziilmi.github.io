import { tokenizeWithSpans, type TokenSpan } from "./parse";
import type { CommandDefinition } from "./types";

export type CommandCompletion = {
  /** Input after completion; identical to the source when nothing can grow. */
  value: string;
  /** Desired caret position in `value`. */
  caret: number;
  /** Every sorted candidate when the active token is ambiguous. */
  suggestions: string[];
};

/** Everything pure completion needs, supplied by the command registry. */
export type CompletionCatalog = {
  commandNames: ReadonlySet<string>;
  commands: ReadonlyMap<string, CommandDefinition>;
  flagsFor: (
    command: CommandDefinition,
    isFirstArgument: boolean,
  ) => readonly string[];
};

export type CompletionSpan = Pick<TokenSpan, "start" | "end">;

type CompletionToken = Pick<TokenSpan, "value" | "start" | "end" | "quoted">;

function clampCaret(input: string, caret: number) {
  return Math.max(0, Math.min(caret, input.length));
}

function longestCommonPrefix(values: string[]) {
  if (values.length === 0) return "";

  let prefix = values[0];
  for (const value of values.slice(1)) {
    let index = 0;
    while (
      index < prefix.length &&
      index < value.length &&
      prefix[index] === value[index]
    ) {
      index += 1;
    }
    prefix = prefix.slice(0, index);
    if (!prefix) break;
  }
  return prefix;
}

function findActiveToken(tokens: TokenSpan[], caret: number) {
  const index = tokens.findIndex((token) => caret <= token.end);
  if (index >= 0) return { token: tokens[index], index };

  // Caret after the last token (usually a trailing space): complete a virtual
  // empty token so new text lands exactly where the user stopped typing.
  return {
    token: { value: "", start: caret, end: caret, quoted: false },
    index: tokens.length,
  };
}

/** Token boundaries of the word completion applies to, in the source input. */
export function getCompletionSpan(
  input: string,
  caret: number,
): CompletionSpan {
  const safeCaret = clampCaret(input, caret);
  const tokens = tokenizeWithSpans(input);
  const [first] = tokens;

  if (!first || safeCaret <= first.end) {
    return { start: first?.start ?? safeCaret, end: first?.end ?? safeCaret };
  }

  const { token } = findActiveToken(tokens, safeCaret);
  return { start: token.start, end: token.end };
}

/** Replaces one token with a candidate, preserving any text after it. */
export function applyCandidate(
  input: string,
  span: CompletionSpan,
  candidate: string,
) {
  const rest = input.slice(span.end);
  const tail = rest.length === 0 || /^\s/.test(rest) ? rest || " " : ` ${rest}`;

  return {
    value: `${input.slice(0, span.start)}${candidate}${tail}`,
    caret: span.start + candidate.length + 1,
  };
}

function completeSpan(
  input: string,
  caret: number,
  token: CompletionToken,
  candidates: string[],
  unchanged: (suggestions?: string[]) => CommandCompletion,
): CommandCompletion {
  const prefixEnd = Math.max(token.start, Math.min(caret, token.end));
  const prefix = input.slice(token.start, prefixEnd);
  const matches = candidates.filter((name) => name.startsWith(prefix)).sort();
  if (matches.length === 0) return unchanged();

  if (matches.length === 1) {
    return { ...applyCandidate(input, token, matches[0]), suggestions: [] };
  }

  const common = longestCommonPrefix(matches);
  if (common.length > prefix.length) {
    return {
      value: `${input.slice(0, token.start)}${common}${input.slice(token.end)}`,
      caret: token.start + common.length,
      // Keep the full set so repeated Tab presses can cycle through it.
      suggestions: matches,
    };
  }

  return unchanged(matches);
}

/**
 * Completes the token under the caret: command name, flag, or argument value.
 * Token spans come from the same parser as highlighting and runCommand.
 */
export function completeCommand(
  input: string,
  caret: number,
  catalog: CompletionCatalog,
): CommandCompletion {
  const safeCaret = clampCaret(input, caret);
  const names = [...catalog.commandNames].sort();
  const unchanged = (suggestions: string[] = []): CommandCompletion => ({
    value: input,
    caret: safeCaret,
    suggestions,
  });

  const tokens = tokenizeWithSpans(input);
  const [first] = tokens;
  if (!first) return unchanged(names);

  if (safeCaret <= first.end) {
    if (first.quoted) return unchanged();
    return completeSpan(input, safeCaret, first, names, unchanged);
  }

  const command = catalog.commands.get(first.value);
  if (!command) return unchanged();

  const { token, index } = findActiveToken(tokens, safeCaret);
  if (token.quoted) return unchanged();

  const argumentIndex = index - 1;
  // Registry arguments describe accepted forms of the command's argument slot,
  // not strict positions: theme lists dark/light/system as separate entries.
  const values =
    argumentIndex === 0
      ? (command.arguments ?? []).flatMap((argument) => argument.values ?? [])
      : [];
  const flags = catalog.flagsFor(command, argumentIndex === 0);
  const candidates = [...new Set([...values, ...flags])];

  return completeSpan(input, safeCaret, token, candidates, unchanged);
}
