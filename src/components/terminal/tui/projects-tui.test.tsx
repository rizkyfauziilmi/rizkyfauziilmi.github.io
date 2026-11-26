import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Toaster } from "@/components/ui/toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Project } from "../data";
import { ProjectDetail } from "./project-detail";
import { ProjectsList } from "./projects-list";

const project: Project = {
  id: "demo",
  title: "Demo Project",
  description: "A sample description.",
  tech: ["React"],
  year: 2026,
  image: "demo.png",
  url: "https://example.com",
};

const writeText = vi.fn(() => Promise.resolve());

const renderDetail = (item: Project, onBack = vi.fn()) =>
  render(
    <>
      <Toaster />
      <ProjectDetail project={item} onBack={onBack} />
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

describe("ProjectsList", () => {
  it("marks the selected project, forwards clicks, and exits", () => {
    const onSelect = vi.fn();
    const onExit = vi.fn();
    render(
      <ProjectsList
        projects={[project]}
        selectedIndex={0}
        onSelect={onSelect}
        onExit={onExit}
      />,
    );

    const option = screen.getByRole("option", { name: /Demo Project/ });
    expect(option.getAttribute("aria-selected")).toBe("true");

    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith(0, project.id);

    fireEvent.click(screen.getByRole("button", { name: /back to terminal/i }));
    expect(onExit).toHaveBeenCalledOnce();
  });
});

describe("ProjectDetail", () => {
  it("renders project data and navigates its copy and open actions", async () => {
    const onBack = vi.fn();
    renderDetail(project, onBack);

    expect(screen.getByRole("heading", { name: "Demo Project" })).toBeTruthy();
    expect(screen.getByText("A sample description.")).toBeTruthy();
    expect(screen.getByText("React")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: /open repository/i })
        .getAttribute("href"),
    ).toBe(project.url);

    expect(
      screen
        .getByRole("button", { name: /copy url/i })
        .hasAttribute("data-tui-active"),
    ).toBe(true);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(
      screen
        .getByRole("button", { name: /open repository/i })
        .hasAttribute("data-tui-active"),
    ).toBe(true);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(
      screen
        .getByRole("button", { name: /copy url/i })
        .hasAttribute("data-tui-active"),
    ).toBe(true);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /copy url/i }));
    });
    expect(writeText).toHaveBeenCalledWith("https://example.com");
    await waitFor(() =>
      expect(screen.getByText("Copied to clipboard")).toBeTruthy(),
    );

    fireEvent.click(screen.getByRole("button", { name: /back to list/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("omits actions when the project has no URL", () => {
    renderDetail({ ...project, url: undefined });

    expect(screen.queryByRole("button", { name: /copy url/i })).toBeNull();
    expect(
      screen.queryByRole("button", { name: /open repository/i }),
    ).toBeNull();
  });
});
