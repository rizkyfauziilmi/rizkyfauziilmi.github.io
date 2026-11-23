import { describe, expect, it } from "vitest";

import { tokenize } from "./parse";

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
    expect(tokenize(`echo "a b" 'c d' e`)).toEqual([
      "echo",
      "a b",
      "c d",
      "e",
    ]);
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
