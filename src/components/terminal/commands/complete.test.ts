import { describe, expect, it } from "vitest";

import { KNOWN_COMMAND_NAMES } from "./index";
import { completeCommand } from "./complete";

function names(values: string[]) {
  return new Set(values);
}

describe("completeCommand", () => {
  it("completes a unique prefix and leaves one space", () => {
    expect(
      completeCommand("the", 3, names(["theme", "shutdown"])),
    ).toEqual({ value: "theme ", caret: 6, suggestions: [] });
  });

  it("keeps existing arguments while replacing the command", () => {
    expect(
      completeCommand("the dark", 3, names(["theme", "shutdown"])),
    ).toEqual({ value: "theme dark", caret: 6, suggestions: [] });
  });

  it("extends an ambiguous prefix to the common prefix", () => {
    expect(
      completeCommand("t", 1, names(["theme", "theatre", "theme2"])),
    ).toEqual({ value: "the", caret: 3, suggestions: [] });
  });

  it("lists candidates when the common prefix cannot grow", () => {
    expect(
      completeCommand("s", 1, names(["sudo", "shutdown"])),
    ).toEqual({
      value: "s",
      caret: 1,
      suggestions: ["shutdown", "sudo"],
    });
  });

  it("lists every runnable command for blank input", () => {
    const result = completeCommand("  ", 2, names(["echo", "about"]));

    expect(result).toEqual({
      value: "  ",
      caret: 2,
      suggestions: ["about", "echo"],
    });
  });

  it("does nothing when the caret is already in arguments", () => {
    expect(
      completeCommand("echo hel", 8, names(["echo", "help"])),
    ).toEqual({ value: "echo hel", caret: 8, suggestions: [] });
  });

  it("does nothing for a quoted first token", () => {
    expect(
      completeCommand('"the"', 5, names(["theme"])),
    ).toEqual({ value: '"the"', caret: 5, suggestions: [] });
  });

  it("does nothing when no name matches", () => {
    expect(
      completeCommand("xyz", 3, names(["theme", "shutdown"])),
    ).toEqual({ value: "xyz", caret: 3, suggestions: [] });
  });

  it("includes hidden runnable commands from the registry", () => {
    expect(completeCommand("s", 1, KNOWN_COMMAND_NAMES).suggestions).toContain(
      "sudo",
    );
  });
});
