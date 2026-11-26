import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { downloadCv } from "../../download";
import { CvTui } from "./cv-tui";

vi.mock("../../download", () => ({
  downloadCv: vi.fn(() => Promise.resolve()),
}));

let fullscreenElement: Element | null = null;
const requestFullscreen = vi.fn(function (this: Element) {
  return Promise.resolve();
});
const exitFullscreen = vi.fn(() => Promise.resolve());

describe("CvTui", () => {
  beforeEach(() => {
    fullscreenElement = null;
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      get: () => fullscreenElement,
    });
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exitFullscreen,
    });
    Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });
  });

  it("renders the PDF, shows the update date, and exits by button or key", () => {
    const onExit = vi.fn();
    render(<CvTui onExit={onExit} />);

    const iframe = screen.getByTitle("CV PDF viewer");
    expect(iframe.getAttribute("src")).toBe("/cv.pdf");
    expect(screen.getByText(/last updated 26 Nov 2026/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /back to terminal/i }));
    fireEvent.keyDown(window, { key: "q" });
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.keyDown(window, { key: "c", ctrlKey: true });
    expect(onExit).toHaveBeenCalledTimes(4);
  });

  it("downloads from the button and the d shortcut", async () => {
    render(<CvTui onExit={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));
    });
    await act(async () => {
      fireEvent.keyDown(window, { key: "d" });
    });

    expect(downloadCv).toHaveBeenCalledTimes(2);
  });

  it("selects buttons with arrows and activates with Enter", async () => {
    render(<CvTui onExit={vi.fn()} />);
    const fullscreen = screen.getByRole("button", {
      name: /see in fullscreen/i,
    });
    const download = screen.getByRole("button", { name: /download pdf/i });

    expect(fullscreen.hasAttribute("data-tui-active")).toBe(true);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(download.hasAttribute("data-tui-active")).toBe(true);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(fullscreen.hasAttribute("data-tui-active")).toBe(true);
    fireEvent.keyDown(window, { key: "l" });
    expect(download.hasAttribute("data-tui-active")).toBe(true);

    await act(async () => {
      fireEvent.keyDown(window, { key: "Enter" });
    });
    expect(downloadCv).toHaveBeenCalledOnce();
  });

  it("ignores repeat downloads while one is in flight", async () => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    vi.mocked(downloadCv).mockImplementationOnce(() => pending);
    render(<CvTui onExit={vi.fn()} />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /download pdf/i }));
    });
    expect(
      screen
        .getByRole("button", { name: /downloading/i })
        .hasAttribute("disabled"),
    ).toBe(true);

    await act(async () => {
      fireEvent.keyDown(window, { key: "d" });
    });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    await act(async () => {
      fireEvent.keyDown(window, { key: "Enter" });
    });
    expect(
      screen
        .getByRole("button", { name: /downloading/i })
        .hasAttribute("data-tui-active"),
    ).toBe(false);
    expect(downloadCv).toHaveBeenCalledOnce();

    await act(async () => {
      release();
      await pending;
    });
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeTruthy();
  });

  it("toggles fullscreen from the button and the f shortcut", async () => {
    render(<CvTui onExit={vi.fn()} />);
    const viewer = document.querySelector('[data-slot="cv-viewer"]');
    if (!viewer) throw new Error("CV viewer was not rendered");

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /see in fullscreen/i }),
      );
    });
    expect(requestFullscreen).toHaveBeenCalledOnce();
    expect(requestFullscreen.mock.contexts[0]).toBe(viewer);

    fullscreenElement = viewer;
    await act(async () => {
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    expect(
      screen.getByRole("button", { name: /exit fullscreen/i }),
    ).toBeTruthy();

    await act(async () => {
      fireEvent.keyDown(window, { key: "f" });
    });
    expect(exitFullscreen).toHaveBeenCalledOnce();

    fullscreenElement = null;
    await act(async () => {
      document.dispatchEvent(new Event("fullscreenchange"));
    });
    expect(
      screen.getByRole("button", { name: /see in fullscreen/i }),
    ).toBeTruthy();
  });
});
