import { tokenizeWithSpans } from "./parse";

export type CommandCompletion = {
  /** Input after completion; identical to the source when nothing can grow. */
  value: string;
  /** Desired caret position in `value`. */
  caret: number;
  /** All candidates when the common prefix cannot be extended. */
  suggestions: string[];
};

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

/**
 * Complete only the first shell token. Token spans come from the same parser
 * as highlighting and runCommand, so completion never disagrees with them.
 */
export function completeCommand(
  input: string,
  caret: number,
  candidates: ReadonlySet<string>,
): CommandCompletion {
  const names = [...candidates].sort();
  const safeCaret = Math.max(0, Math.min(caret, input.length));
  const unchanged = (suggestions: string[] = []): CommandCompletion => ({
    value: input,
    caret: safeCaret,
    suggestions,
  });

  const [first] = tokenizeWithSpans(input);
  if (!first) return unchanged(names);

  // Quoted commands are not valid names; caret past the token means the user
  // is already typing arguments, which are out of scope for this release.
  if (first.quoted || safeCaret > first.end) return unchanged();

  const prefix = input.slice(first.start, Math.min(safeCaret, first.end));
  const matches = names.filter((name) => name.startsWith(prefix));
  if (matches.length === 0) return unchanged();

  if (matches.length === 1) {
    const name = matches[0];
    const rest = input.slice(first.end);
    const tail = rest.length === 0 || /^\s/.test(rest) ? rest : ` ${rest}`;
    const value = `${input.slice(0, first.start)}${name}${tail || " "}`;

    return {
      value,
      caret: first.start + name.length + 1,
      suggestions: [],
    };
  }

  const common = longestCommonPrefix(matches);
  if (common.length > prefix.length) {
    return {
      value: `${input.slice(0, first.start)}${common}${input.slice(first.end)}`,
      caret: first.start + common.length,
      suggestions: [],
    };
  }

  return unchanged(matches);
}
