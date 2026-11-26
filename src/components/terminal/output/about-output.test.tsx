import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { COMMAND_DEFINITIONS } from "../commands/registry";
import { AboutOutput } from "./about-output";

describe("AboutOutput", () => {
  it("lists only commands flagged for about", () => {
    render(<AboutOutput />);

    const expected = COMMAND_DEFINITIONS.filter(
      (command) => !command.hidden && command.suggestInAbout,
    ).map((command) => command.name);

    expect(expected).toEqual(["projects", "contact", "cv"]);
    expect(
      screen.getByText(new RegExp(`\\[${expected.join(", ")}\\]`)),
    ).toBeTruthy();
    expect(screen.queryByText(/\babout\b/)).toBeNull();
    expect(screen.queryByText(/sudo/)).toBeNull();
  });
});
