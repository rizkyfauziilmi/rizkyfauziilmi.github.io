import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CommandSuggestions } from "./command-suggestions";

describe("CommandSuggestions", () => {
  it("renders candidate names as a polite status in normal flow", () => {
    const { container } = render(
      <>
        <div data-testid="prompt">prompt</div>
        <CommandSuggestions names={["shutdown", "sudo"]} />
      </>,
    );

    const hint = container.querySelector("[data-command-suggestions]");
    expect(hint).not.toBeNull();
    expect(hint?.getAttribute("role")).toBe("status");
    expect(hint?.getAttribute("aria-live")).toBe("polite");
    expect(hint?.textContent).toContain("shutdown");
    expect(hint?.textContent).toContain("sudo");
    expect(hint?.className).not.toContain("absolute");
    // The hint starts at the prompt's left edge, not after the prompt text.
    expect(hint?.getAttribute("style")).toBeNull();
    expect(container.firstElementChild?.nextElementSibling).toBe(hint);
  });

  it("renders nothing without candidates", () => {
    const { container } = render(<CommandSuggestions names={[]} />);

    expect(container.querySelector("[data-command-suggestions]")).toBeNull();
  });
});
