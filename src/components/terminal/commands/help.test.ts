import { describe, expect, it } from "vitest";

import { buildCommandHelp, buildHelpOutput, getCommandLabel } from "./help";
import type { CommandDefinition } from "./types";

const command = (
  overrides: Partial<CommandDefinition> & Pick<CommandDefinition, "name">,
): CommandDefinition => ({
  description: "A command",
  run: () => ({ type: "blank" }),
  ...overrides,
});

describe("getCommandLabel", () => {
  it("uses just the name when there are no usage args", () => {
    expect(getCommandLabel(command({ name: "about" }))).toBe("about");
  });

  it("appends usage args when present", () => {
    expect(
      getCommandLabel(
        command({ name: "theme", usageArgs: "<dark|light|system>" }),
      ),
    ).toBe("theme <dark|light|system>");
  });
});

describe("buildHelpOutput", () => {
  it("lists visible commands but omits hidden ones", () => {
    const output = buildHelpOutput([
      command({ name: "about", description: "Show intro" }),
      command({ name: "sudo", description: "Secret", hidden: true }),
    ]);

    expect(output).toContain("about");
    expect(output).toContain("Show intro");
    expect(output).not.toContain("sudo");
    expect(output).toContain("<command> -h");
    expect(output).toContain("-h, --help");
  });
});

describe("buildCommandHelp", () => {
  it("renders arguments and examples blocks when provided", () => {
    const output = buildCommandHelp(
      command({
        name: "shutdown",
        description: "Power off or schedule shutdown",
        usageArgs: "<now|+N|HH:MM|-c>",
        arguments: [{ name: "now", description: "Power off immediately" }],
        examples: ["shutdown now", "shutdown -c"],
      }),
    );

    expect(output).toContain("Usage: shutdown <now|+N|HH:MM|-c>");
    expect(output).toContain("Arguments:");
    expect(output).toContain("Power off immediately");
    expect(output).toContain("Examples:");
    expect(output).toContain("  shutdown now");
    expect(output).toContain("Flags:");
  });

  it("omits optional blocks when they are not defined", () => {
    const output = buildCommandHelp(command({ name: "about" }));

    expect(output).not.toContain("Arguments:");
    expect(output).not.toContain("Examples:");
    expect(output).toContain("Usage: about");
  });
});
