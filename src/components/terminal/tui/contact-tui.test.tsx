import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { GitHub } from "@/components/svgs/github";
import { Gmail } from "@/components/svgs/gmail";
import { Toaster } from "@/components/ui/toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ContactChannel } from "../data";
import { ContactDetail } from "./contact-detail";
import { ContactList } from "./contact-list";

const CHANNELS: ContactChannel[] = [
  {
    id: "email",
    label: "Email",
    icon: Gmail,
    value: "dev@example.com",
    href: "mailto:dev@example.com",
    copyText: "dev@example.com",
    description: "Email me about anything.",
  },
  {
    id: "github",
    label: "GitHub",
    icon: GitHub,
    value: "TODO: add GitHub URL",
    copyText: "TODO: add GitHub URL",
    description: "TODO: replace with the real profile.",
  },
];

const writeText = vi.fn(() => Promise.resolve());

const renderDetail = (channel: ContactChannel, onBack = vi.fn()) =>
  render(
    <>
      <Toaster />
      <ContactDetail channel={channel} onBack={onBack} />
    </>,
  );

beforeEach(() => {
  writeText.mockReset();
  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

afterEach(() => {
  Reflect.deleteProperty(navigator, "clipboard");
});

describe("ContactList", () => {
  it("marks the selected channel, renders icons, forwards clicks, and exits", () => {
    const onSelect = vi.fn();
    const onExit = vi.fn();
    render(
      <ContactList
        channels={CHANNELS}
        selectedIndex={0}
        onSelect={onSelect}
        onExit={onExit}
      />,
    );

    const option = screen.getByRole("option", { name: /Email/ });
    expect(option.getAttribute("aria-selected")).toBe("true");
    expect(option.querySelector("svg")).toBeTruthy();
    expect(screen.getAllByRole("option")).toHaveLength(2);

    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith(0, "email");

    fireEvent.click(screen.getByRole("button", { name: /back to terminal/i }));
    expect(onExit).toHaveBeenCalledOnce();
  });
});

describe("ContactDetail", () => {
  it("renders channel data, opens the link, copies the value, and goes back", async () => {
    const onBack = vi.fn();
    renderDetail(CHANNELS[0], onBack);

    expect(screen.getByRole("heading", { name: "Email" })).toBeTruthy();
    expect(screen.getByText("dev@example.com")).toBeTruthy();
    expect(screen.getByText("Email me about anything.")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: /open in browser/i })
        .getAttribute("href"),
    ).toBe("mailto:dev@example.com");

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(
      screen
        .getByRole("button", { name: /open in browser/i })
        .hasAttribute("data-tui-active"),
    ).toBe(true);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(
      screen
        .getByRole("button", { name: /copy text/i })
        .hasAttribute("data-tui-active"),
    ).toBe(true);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /copy text/i }));
    });
    expect(writeText).toHaveBeenCalledWith("dev@example.com");
    await waitFor(() =>
      expect(screen.getByText("Copied to clipboard")).toBeTruthy(),
    );

    fireEvent.click(screen.getByRole("button", { name: /back to list/i }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("hides the open button when the URL is still a TODO", () => {
    renderDetail(CHANNELS[1]);

    expect(
      screen.queryByRole("button", { name: /open in browser/i }),
    ).toBeNull();
    expect(screen.getByText(/open button appears once/i)).toBeTruthy();
  });

  it("reports a clipboard failure without throwing", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    renderDetail(CHANNELS[0]);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /copy text/i }));
    });

    await waitFor(() => expect(screen.getByText("Copy failed")).toBeTruthy());
  });
});
