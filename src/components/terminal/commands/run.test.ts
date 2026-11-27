import { describe, expect, it } from "vitest";

import { createDefaultCommandContext } from "./fetch";
import { runCommand } from "./run";
import { SHUTDOWN_ERROR } from "./shutdown";

describe("runCommand", () => {
  it("returns blank for empty input and errors for unknown commands", () => {
    expect(runCommand("   ")).toEqual({ type: "blank" });

    const result = runCommand("nope");
    expect(result.type).toBe("output");
    if (result.type === "output") {
      expect(result.text).toBe("nope: command not found...");
      expect(result.isError).toBe(true);
    }
  });

  it("rejects arguments for commands that do not accept them", () => {
    const result = runCommand("about extra");
    expect(result.type).toBe("output");
    if (result.type === "output") {
      expect(result.text).toBe("about: command does not accept arguments...");
    }
  });

  it("opens the contact TUI and rejects stray arguments", () => {
    expect(runCommand("contact")).toEqual({ type: "tui", view: "contact" });

    const result = runCommand("contact extra");
    expect(result.type).toBe("output");
    if (result.type === "output") {
      expect(result.text).toBe("contact: command does not accept arguments...");
    }

    const help = runCommand("contact -h");
    expect(help.type).toBe("output");
    if (help.type === "output") {
      expect(help.text).toContain("Find me and get in touch");
      expect(help.text).toContain("Usage: contact");
    }
  });

  it("opens the cv viewer, downloads with --download, and validates arguments", () => {
    expect(runCommand("cv")).toEqual({ type: "tui", view: "cv" });
    expect(runCommand("resume")).toEqual({ type: "tui", view: "cv" });

    const expectedDownload = {
      type: "download" as const,
      url: "/cv.pdf",
      filename: "rizky-fauzi-ilmi-cv.pdf",
      text: "Downloading rizky-fauzi-ilmi-cv.pdf — updated 26 Nov 2026. Progress: see toast.",
    };
    expect(runCommand("cv --download")).toEqual(expectedDownload);
    expect(runCommand("resume --download")).toEqual(expectedDownload);

    for (const command of ["cv --bogus", "resume extra"]) {
      const result = runCommand(command);
      expect(result.type).toBe("output");
      if (result.type === "output") {
        expect(result.text).toContain("expected '--download'");
        expect(result.isError).toBe(true);
      }
    }

    const help = runCommand("cv -h");
    expect(help.type).toBe("output");
    if (help.type === "output") {
      expect(help.text).toContain("Usage: cv [--download]");
      expect(help.text).toContain("Download the PDF immediately");
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

  it("shows echo help for flags but keeps other words literal", () => {
    for (const command of ["echo -h", "echo --help"]) {
      const result = runCommand(command);
      expect(result.type).toBe("output");
      if (result.type === "output") {
        expect(result.text).toContain("Usage: echo [text...]");
        expect(result.text).toContain('echo "Halo" > notes/hello.txt');
      }
    }

    expect(runCommand("echo help")).toMatchObject({
      type: "output",
      text: "help",
    });
    expect(runCommand('echo "hello world"')).toMatchObject({
      type: "output",
      text: "hello world",
    });
  });

  it("rejects redirection for commands other than echo", () => {
    expect(runCommand("ls > out.txt")).toMatchObject({
      type: "output",
      text: "ls: redirection is not supported...",
      isError: true,
    });
  });

  it.each(["fastfetch", "rm", "sudo", "whoami"])(
    "shows help for the %s easter egg",
    (name) => {
      for (const variant of [`${name} -h`, `${name} --help`, `${name} help`]) {
        const result = runCommand(variant);
        expect(result.type).toBe("output");
        if (result.type === "output") {
          expect(result.text).toContain("Usage:");
          expect(result.text).toContain("Flags:");
          expect(result.text).toContain("-h");
          expect(result.text).toContain("--help");
        }
      }
    },
  );

  it("validates theme arguments", () => {
    expect(runCommand("theme dark")).toMatchObject({
      type: "theme",
      mode: "dark",
    });

    const invalid = runCommand("theme neon");
    expect(invalid.type).toBe("output");
    if (invalid.type === "output") {
      expect(invalid.text).toBe(
        "theme: expected 'dark', 'light', or 'system'...",
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

  it("renders the global help as a component", () => {
    expect(runCommand("help")).toEqual({ type: "component", view: "help" });
  });

  it("keeps clear as a screen-only result", () => {
    expect(runCommand("clear")).toEqual({ type: "clear" });
  });

  it("opens the projects tui and routes global help to the component", () => {
    expect(runCommand("projects")).toEqual({ type: "tui", view: "projects" });

    expect(runCommand("help")).toEqual({ type: "component", view: "help" });

    const detail = runCommand("projects -h");
    expect(detail.type).toBe("output");
    if (detail.type === "output") {
      expect(detail.text).toContain("Usage: projects");
    }
  });

  it("runs neofetch and its fastfetch alias with the supplied context", () => {
    const context = {
      ...createDefaultCommandContext(),
      theme: "light" as const,
    };
    const neofetch = runCommand("neofetch", context);
    const fastfetch = runCommand("fastfetch", context);

    expect(neofetch).toEqual({
      type: "output",
      text: expect.any(String),
      isError: false,
    });
    expect(fastfetch).toEqual(neofetch);

    if (neofetch.type === "output") {
      expect(neofetch.text).toContain("Theme:      light");
    }
  });

  it("shows per-command help for the fastfetch alias", () => {
    expect(runCommand("help")).toEqual({ type: "component", view: "help" });

    const aliasHelp = runCommand("fastfetch -h");
    expect(aliasHelp.type).toBe("output");
    if (aliasHelp.type === "output") {
      expect(aliasHelp.text).toContain("Alias for neofetch");
      expect(aliasHelp.text).toContain("Usage: fastfetch");
    }
  });

  it("runs ls against the seeded filesystem", () => {
    expect(runCommand("ls")).toMatchObject({
      type: "output",
      text: "Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos",
    });
    expect(runCommand("ls -a")).toMatchObject({
      type: "output",
      text: ".  ..  .bashrc  .config  .profile  Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos",
    });
    expect(runCommand("ls asdf")).toMatchObject({
      type: "output",
      isError: true,
      text: "ls: cannot access 'asdf': No such file or directory",
    });
  });

  it("runs rm with real shell errors and a filesystem snapshot", () => {
    expect(runCommand("rm asdf")).toMatchObject({
      type: "output",
      isError: true,
      text: "rm: cannot remove 'asdf': No such file or directory",
    });
    expect(runCommand("rm -rf /home/")).toMatchObject({
      type: "output",
      isError: true,
      text: "rm: cannot remove '/home/': Permission denied",
    });

    const removed = runCommand("rm Documents/notes.txt");
    expect(removed.type).toBe("blank");
    if (removed.type !== "blank" || !removed.filesystem) {
      throw new Error("Expected a filesystem mutation");
    }
    expect(
      removed.filesystem.has("/home/rizkyfauziilmi/Documents/notes.txt"),
    ).toBe(false);
  });
});
