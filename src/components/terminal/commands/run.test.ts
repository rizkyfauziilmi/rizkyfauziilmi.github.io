import { describe, expect, it } from "vitest";

import { runCommand } from "./index";
import { SHUTDOWN_ERROR } from "./shutdown";

describe("runCommand", () => {
  it("returns blank for empty input and errors for unknown commands", () => {
    expect(runCommand("   ")).toEqual({ type: "blank" });

    const result = runCommand("nope");
    expect(result.type).toBe("output");
    if (result.type === "output") {
      expect(result.text).toBe("(error) nope: command not found...");
      expect(result.isError).toBe(true);
    }
  });

  it("rejects arguments for commands that do not accept them", () => {
    const result = runCommand("about extra");
    expect(result.type).toBe("output");
    if (result.type === "output") {
      expect(result.text).toBe(
        "(error) about: command does not accept arguments...",
      );
    }
  });

  it.each(["about -h", "about --help", "about help"])(
    "shows per-command help for %s",
    (command) => {
      const result = runCommand(command);
      expect(result.type).toBe("output");
      if (result.type === "output") {
        expect(result.text).toContain("Show a short introduction");
        expect(result.text).toContain("Usage:");
      }
    },
  );

  it("lets echo consume help-like arguments literally", () => {
    expect(runCommand("echo -h")).toMatchObject({
      type: "output",
      text: "-h",
    });
    expect(runCommand("echo help")).toMatchObject({
      type: "output",
      text: "help",
    });
    expect(runCommand('echo "hello world"')).toMatchObject({
      type: "output",
      text: "hello world",
    });
  });

  it("keeps hidden eggs silent on every help variant", () => {
    for (const command of [
      "sudo -h",
      "sudo --h",
      "sudo -help",
      "whoami --help",
      "rm -h",
    ]) {
      const result = runCommand(command);
      expect(result.type).toBe("output");
      if (result.type === "output") {
        expect(result.text).not.toContain("Usage:");
        expect(result.text).not.toContain("Flags:");
      }
    }
  });

  it("validates theme arguments", () => {
    expect(runCommand("theme dark")).toMatchObject({
      type: "theme",
      mode: "dark",
    });

    const invalid = runCommand("theme neon");
    expect(invalid.type).toBe("output");
    if (invalid.type === "output") {
      expect(invalid.text).toBe(
        "(error) theme: expected 'dark', 'light', or 'system'...",
      );
    }
  });

  it("returns lifecycle results for reboot and shutdown", () => {
    expect(runCommand("reboot")).toEqual({
      type: "reboot",
      text: "Rebooting...",
    });
    expect(runCommand("shutdown now")).toEqual({
      type: "shutdown",
      delayMs: 0,
      text: "Closing tab now...",
    });
    expect(runCommand("shutdown -c")).toEqual({ type: "shutdown-cancel" });
  });

  it("returns scheduled and invalid shutdown results", () => {
    const scheduled = runCommand("shutdown +5");
    expect(scheduled.type).toBe("shutdown");
    if (scheduled.type === "shutdown") {
      expect(scheduled.delayMs).toBe(5 * 60_000);
      expect(scheduled.text).toContain("shutdown -c");
    }

    const invalid = runCommand("shutdownSoon");
    expect(invalid.type).toBe("output");
    if (invalid.type === "output") {
      expect(invalid.text).toContain("command not found");
    }

    const badArg = runCommand("shutdown whatever");
    expect(badArg.type).toBe("output");
    if (badArg.type === "output") expect(badArg.text).toBe(SHUTDOWN_ERROR);
  });

  it("uses bare shutdown as a format hint", () => {
    const result = runCommand("shutdown");
    expect(result.type).toBe("output");
    if (result.type === "output") {
      expect(result.text).toContain("Usage: shutdown <now|+N|HH:MM|-c>");
      expect(result.text).toContain("Examples:");
      expect(result.text).toContain("shutdown 23:30");
    }
  });

  it("hides easter eggs from the global help", () => {
    const result = runCommand("help");
    expect(result.type).toBe("output");
    if (result.type === "output") {
      for (const hidden of ["sudo", "whoami", "refusing to remove"]) {
        expect(result.text).not.toContain(hidden);
      }
      expect(result.text).toContain("classic Unix troublemakers");
    }
  });

  it("keeps clear as a screen-only result", () => {
    expect(runCommand("clear")).toEqual({ type: "clear" });
  });
});
