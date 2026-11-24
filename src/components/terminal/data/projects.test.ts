import { describe, expect, it } from "vitest";

import { PROJECTS } from "./projects";

describe("PROJECTS", () => {
  it("contains the six selected repositories exactly once", () => {
    expect(PROJECTS.map((project) => project.id)).toEqual([
      "portfolio-terminal",
      "gambling-blocker",
      "simba",
      "quran-api",
      "project-simulasi-gerak",
      "anywall",
    ]);
  });

  it("has complete metadata for every project and descending years", () => {
    for (const project of PROJECTS) {
      expect(project.title.length).toBeGreaterThan(0);
      expect(project.description.length).toBeGreaterThan(80);
      expect(project.tech.length).toBeGreaterThan(0);
      expect(project.image.length).toBeGreaterThan(0);
      expect(project.url).toMatch(/^https:\/\/github\.com\/rizkyfauziilmi\//);
    }

    const years = PROJECTS.map((project) => project.year);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });
});
