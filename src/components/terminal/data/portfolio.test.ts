import { describe, expect, it } from "vitest";

import { buildAboutOutput, PORTFOLIO } from "./portfolio";

describe("buildAboutOutput", () => {
  it("uses the supplied suggestions instead of a hardcoded list", () => {
    const output = buildAboutOutput(["projects", "contact"]);

    expect(output).toContain(PORTFOLIO.bio[0]);
    expect(output).toContain(
      "Get to know me better with these commands: [projects, contact]",
    );
    expect(output).not.toContain("availableCommands");
  });

  it("keeps a valid line when there are no suggestions", () => {
    expect(buildAboutOutput([])).toContain(
      "Get to know me better with these commands: []",
    );
  });
});
