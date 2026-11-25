import { tokenizeWithSpans, type TokenSpan } from "./parse";
import type { CommandDefinition } from "./types";

export type CommandCompletion = {
  /** Input after completion; identical to the source when nothing can grow. */
  value: string;
  /** Desired caret position in `value`. */
  caret: number;
  /** All candidates when the common prefix cannot be extended. */
  suggestions: string[];
};

/** Everything pure completion needs, supplied by the command registry. */
export type CompletionCatalog = {
  commandNames: ReadonlySet<string>;
  commands: ReadonlyMap<string, CommandDefinition>;
  flagsFor: (command: CommandDefinition, isFirstArgument: boolean) => readonly string[];
};

type CompletionSpan = Pick<TokenSpan, "value" | "start" | "end" | "quoted">;

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

function findActiveSpan(tokens: TokenSpan[], caret: number) {
  const index = tokens.findIndex((token) => caret <= token.end);
  if (index >= 0) return { span: tokens[index], index };

  // Caret after the last token (usually a trailing space): complete a virtual
  // empty token so new text lands exactly where the user stopped typing.
  return {
    span: { value: "", start: caret, end: caret, quoted: false },
    index: tokens.length,
  };
}

function completeSpan(
  input: string,
  caret: number,
  span: CompletionSpan,
  candidates: string[],
  unchanged: (suggestions?: string[]) => CommandCompletion,
): CommandCompletion {
  const prefixEnd = Math.max(span.start, Math.min(caret, span.end));
  const prefix = input.slice(span.start, prefixEnd);
  const matches = candidates.filter((name) => name.startsWith(prefix)).sort();
  if (matches.length === 0) return unchanged();

  if (matches.length === 1) {
    const name = matches[0];
    const rest = input.slice(span.end);
    const tail =
      rest.length === 0 || /^\s/.test(rest) ? rest || " " : ` ${rest}`;

    return {
      value: `${input.slice(0, span.start)}${name}${tail}`,
      caret: span.start + name.length + 1,
      suggestions: [],
    };
  }

  const common = longestCommonPrefix(matches);
  if (common.length > prefix.length) {
    return {
      value: `${input.slice(0, span.start)}${common}${input.slice(span.end)}`,
      caret: span.start + common.length,
      suggestions: [],
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
  const safeCaret = Math.max(0, Math.min(caret, input.length));
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

  const { span, index } = findActiveSpan(tokens, safeCaret);
  if (span.quoted) return unchanged();

  const argumentIndex = index - 1;
  // Registry arguments describe accepted forms of the command's argument slot,
  // not strict positions: theme lists dark/light/system as separate entries.
  const values =
    argumentIndex === 0
      ? (command.arguments ?? []).flatMap((argument) => argument.values ?? [])
      : [];
  const flags = catalog.flagsFor(command, argumentIndex === 0);
  const candidates = [...new Set([...values, ...flags])];

  return completeSpan(input, safeCaret, span, candidates, unchanged);
}
