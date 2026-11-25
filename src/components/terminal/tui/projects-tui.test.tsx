import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

describe("ProjectsList", () => {
  it("marks the selected project and forwards clicks", () => {
    const onSelect = vi.fn();
    render(
      <ProjectsList
        projects={[project]}
        selectedIndex={0}
        onSelect={onSelect}
      />,
    );

    const option = screen.getByRole("option", { name: /Demo Project/ });
    expect(option.getAttribute("aria-selected")).toBe("true");

    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith(0, project.id);
  });
});

describe("ProjectDetail", () => {
  it("renders project data and handles going back", () => {
    const onBack = vi.fn();
    render(<ProjectDetail project={project} onBack={onBack} />);

    expect(
      screen.getByRole("heading", { name: "Demo Project" }),
    ).toBeTruthy();
    expect(screen.getByText("A sample description.")).toBeTruthy();
    expect(screen.getByText("React")).toBeTruthy();
    expect(
      screen
        .getByRole("button", { name: /open repository/i })
        .getAttribute("href"),
    ).toBe(project.url);

    fireEvent.click(screen.getByRole("button", { name: /back to list/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
