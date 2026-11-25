import { describe, expect, it } from "vitest";

import { buildCommandHelp, buildHelpModel, getCommandLabel } from "./help";
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

describe("buildHelpModel", () => {
  it("keeps visible commands and omits hidden ones", () => {
    const model = buildHelpModel([
      command({ name: "about", description: "Show intro" }),
      command({
        name: "theme",
        description: "Set theme",
        usageArgs: "<dark|light|system>",
      }),
      command({ name: "sudo", description: "Secret", hidden: true }),
    ]);

    expect(model.commands.map((item) => item.name)).toEqual([
      "about",
      "theme",
    ]);
    expect(model.commands[1].label).toBe("theme <dark|light|system>");
    expect(model.commands[1].description).toBe("Set theme");
    expect(model.commands.some((item) => item.name === "sudo")).toBe(false);
    expect(model.version).toBeTruthy();
  });

  it("exposes completion tips as key/text parts", () => {
    const model = buildHelpModel([command({ name: "help" })]);
    const flattened = model.tips
      .flat()
      .map((part) => part.value)
      .join(" ");

    expect(flattened).toContain("Tab");
    expect(flattened).toContain(
      "completes commands, flags, or argument values",
    );
    expect(flattened).toContain("lists matches when ambiguous");
    expect(flattened).toContain("classic Unix troublemakers");
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

  it("lists declared flags alongside the help flags", () => {
    const output = buildCommandHelp(
      command({
        name: "rm",
        flags: [{ name: "-r", description: "Remove recursively" }],
      }),
    );

    expect(output).toContain("-r");
    expect(output).toContain("Remove recursively");
    expect(output).toContain("--help");
  });

  it("omits optional blocks when they are not defined", () => {
    const output = buildCommandHelp(command({ name: "about" }));

    expect(output).not.toContain("Arguments:");
    expect(output).not.toContain("Examples:");
    expect(output).toContain("Usage: about");
  });
});
