import { describe, expect, it } from "vitest";

import { parseRedirect, tokenize, tokenizeWithSpans } from "./parse";

describe("tokenize", () => {
  it("splits plain input and ignores extra whitespace", () => {
    expect(tokenize("  echo   hello   world  ")).toEqual([
      "echo",
      "hello",
      "world",
    ]);
  });

  it("keeps spaces inside double quotes", () => {
    expect(tokenize('echo "hello world"')).toEqual(["echo", "hello world"]);
  });

  it("keeps spaces inside single quotes", () => {
    expect(tokenize("echo 'hello world'")).toEqual(["echo", "hello world"]);
  });

  it("supports mixed quoting", () => {
    expect(tokenize(`echo "a b" 'c d' e`)).toEqual(["echo", "a b", "c d", "e"]);
  });

  it("treats an unclosed quote as the rest of the line", () => {
    expect(tokenize('echo "hello world')).toEqual(["echo", "hello world"]);
  });

  it("preserves an explicitly empty quoted argument", () => {
    expect(tokenize('echo ""')).toEqual(["echo", ""]);
  });

  it("returns no tokens for blank input", () => {
    expect(tokenize("   ")).toEqual([]);
  });
});

describe("tokenizeWithSpans", () => {
  it("points tokens at their original quoted source text", () => {
    const input = `  echo "a b" 'c d'  `;

    expect(tokenizeWithSpans(input)).toEqual([
      { value: "echo", start: 2, end: 6, quoted: false },
      { value: "a b", start: 7, end: 12, quoted: true },
      { value: "c d", start: 13, end: 18, quoted: true },
    ]);
    expect(tokenizeWithSpans(input).map((token) => token.value)).toEqual(
      tokenize(input),
    );
  });

  it("includes an unclosed quote in the final span", () => {
    expect(tokenizeWithSpans('echo "hello world')).toEqual([
      { value: "echo", start: 0, end: 4, quoted: false },
      { value: "hello world", start: 5, end: 17, quoted: true },
    ]);
  });

  it("preserves empty quoted tokens", () => {
    expect(tokenizeWithSpans(`echo ''`)).toEqual([
      { value: "echo", start: 0, end: 4, quoted: false },
      { value: "", start: 5, end: 7, quoted: true },
    ]);
  });

  it("returns no spans for blank input", () => {
    expect(tokenizeWithSpans(" \t ")).toEqual([]);
  });
});

describe("parseRedirect", () => {
  it("leaves lines without an operator untouched", () => {
    expect(parseRedirect('echo "hello world"')).toEqual({
      command: 'echo "hello world"',
    });
  });

  it("splits overwrite and append operators outside quotes", () => {
    expect(parseRedirect("echo hi > notes.txt")).toEqual({
      command: "echo hi ",
      redirect: { operator: ">", target: "notes.txt", ambiguous: false },
    });
    expect(parseRedirect("echo hi >> notes.txt")).toEqual({
      command: "echo hi ",
      redirect: { operator: ">>", target: "notes.txt", ambiguous: false },
    });
  });

  it("treats an operator inside quotes as literal text", () => {
    expect(parseRedirect('echo "a > b"')).toEqual({
      command: 'echo "a > b"',
    });
    expect(parseRedirect("echo 'a >> b'")).toEqual({
      command: "echo 'a >> b'",
    });
  });

  it("keeps a quoted target with spaces as one token", () => {
    expect(parseRedirect('echo hi > "my notes.txt"')).toEqual({
      command: "echo hi ",
      redirect: {
        operator: ">",
        target: "my notes.txt",
        ambiguous: false,
      },
    });
  });

  it("flags missing and ambiguous targets", () => {
    expect(parseRedirect("echo hi >").redirect).toEqual({
      operator: ">",
      target: "",
      ambiguous: false,
    });
    expect(parseRedirect("echo hi > a b").redirect).toEqual({
      operator: ">",
      target: "a",
      ambiguous: true,
    });
  });
});
