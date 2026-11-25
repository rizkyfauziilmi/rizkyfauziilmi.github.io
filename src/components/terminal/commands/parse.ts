export type TokenSpan = {
  /** Token text with surrounding quotes removed, as passed to commands. */
  value: string;
  /** Inclusive start index in the original input. */
  start: number;
  /** Exclusive end index in the original input, including any quotes. */
  end: number;
  /** Whether the token contained quotes, including an unclosed quote. */
  quoted: boolean;
};

/**
 * Split a command line on whitespace, treating quoted segments as one token.
 * An unclosed quote consumes the rest of the line instead of failing.
 * Spans point back into the original input so renderers can preserve quotes
 * and whitespace while using the same token boundaries as command parsing.
 */
export function tokenizeWithSpans(input: string): TokenSpan[] {
  const tokens: TokenSpan[] = [];
  let current = "";
  let quote: "'" | '"' | null = null;
  let started = false;
  let start = 0;
  let quoted = false;

  const push = (end: number) => {
    if (!started) return;
    tokens.push({ value: current, start, end, quoted });
    current = "";
    started = false;
    quoted = false;
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (quote) {
      if (char === quote) quote = null;
      else current += char;
      continue;
    }

    if (char === "'" || char === '"') {
      if (!started) start = index;
      quote = char;
      quoted = true;
      started = true;
      continue;
    }

    if (/\s/.test(char)) {
      push(index);
      continue;
    }

    if (!started) start = index;
    current += char;
    started = true;
  }

  push(input.length);
  return tokens;
}

/** Token values only; kept as the parser-facing API used by runCommand. */
export function tokenize(input: string): string[] {
  return tokenizeWithSpans(input).map((token) => token.value);
}
