import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "@/components/theme-provider";
import Terminal from ".";

function renderTerminal() {
  return render(
    <ThemeProvider>
      <Terminal />
    </ThemeProvider>,
  );
}

describe("Terminal", () => {
  it("runs commands and keeps a fresh prompt after clear", () => {
    renderTerminal();
    const input = screen.getByRole("textbox") as HTMLTextAreaElement;

    fireEvent.change(input, { target: { value: "help" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText(/Portfolio Terminal/)).toBeTruthy();
    expect(input.value).toBe("");

    fireEvent.change(input, { target: { value: "clear" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.queryByText(/Portfolio Terminal/)).toBeNull();
    expect(screen.getByRole("textbox")).toBe(input);
  });
});
