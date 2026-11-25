import { describe, expect, it } from "vitest";

import { highlightCommand } from "./highlight-command";

const names = new Set(["echo", "shutdown", "help", "fastfetch"]);

describe("highlightCommand", () => {
  it("colours only the command token and leaves arguments plain", () => {
    expect(highlightCommand('  echo -n "a b" tail', names)).toEqual([
      { text: "  ", kind: "text" },
      { text: "echo", kind: "command" },
      { text: ' -n "a b" tail', kind: "text" },
    ]);
  });

  it("does not give flags or strings their own tokens", () => {
    expect(highlightCommand("shutdown -c", names)).toEqual([
      { text: "shutdown", kind: "command" },
      { text: " -c", kind: "text" },
    ]);
  });

  it("leaves unknown commands completely plain", () => {
    expect(highlightCommand("nope -x 'value'", names)).toEqual([
      { text: "nope -x 'value'", kind: "text" },
    ]);
  });

  it("is case-sensitive like the command registry", () => {
    expect(highlightCommand("HELP", names)).toEqual([
      { text: "HELP", kind: "text" },
    ]);
  });

  it("recognises quoted command names", () => {
    expect(highlightCommand('"echo" hi', names)).toEqual([
      { text: '"echo"', kind: "command" },
      { text: " hi", kind: "text" },
    ]);
  });

  it("recognises runnable hidden commands", () => {
    expect(highlightCommand("fastfetch", names)).toEqual([
      { text: "fastfetch", kind: "command" },
    ]);
  });

  it("keeps an unclosed quote inside the highlighted token", () => {
    expect(highlightCommand('"echo', names)).toEqual([
      { text: '"echo', kind: "command" },
    ]);
  });

  it("returns no segments for empty input", () => {
    expect(highlightCommand("", names)).toEqual([]);
  });

  it("always reconstructs the original input", () => {
    const input = `  help --long 'quoted value'  `;
    const segments = highlightCommand(input, names);

    expect(segments.map((segment) => segment.text).join("")).toBe(input);
  });
});
