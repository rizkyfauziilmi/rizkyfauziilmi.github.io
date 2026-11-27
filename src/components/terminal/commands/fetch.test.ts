import { describe, expect, it } from "vitest";

import { createInitialFileSystem } from "../filesystem";
import { buildFetchOutput, createDefaultCommandContext } from "./fetch";
import type { CommandContext } from "./types";

const CONTEXT: CommandContext = {
  theme: "dark",
  now: new Date("2026-11-24T10:23:45.000Z"),
  viewport: { width: 1440, height: 900 },
  platform: "Linux",
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
  uptimeMs: 62_345,
  filesystem: createInitialFileSystem(),
};

describe("buildFetchOutput", () => {
  it("renders portfolio and browser details in aligned text rows", () => {
    const output = buildFetchOutput(CONTEXT);

    expect(output).toContain(" /$$$$$$$  /$$$$$$$$ /$$$$$$");
    expect(output).toContain("| $$  \\ $$| $$        | $$");
    expect(output).toContain("|__/  |__/|__/      |______/");

    const lines = output.split("\n");
    // The 8-line logo is vertically centered inside the 10 info rows.
    expect(lines[0]).not.toContain("/$$");
    expect(lines[1]).toContain("/$$$$$$  Role:");
    expect(lines[8]).toContain("|__/");
    expect(lines[9]).not.toContain("|__/");
    expect(output).toContain("rizkyfauziilmi@portofolio");
    expect(output).toContain("User:       rizkyfauziilmi@portofolio");
    expect(output).toContain("OS:         Browser / Linux");
    expect(output).toContain("Browser:    Chrome");
    expect(output).toContain("Theme:      dark");
    expect(output).toContain("Resolution: 1440x900");
    expect(output).toContain("Uptime:     1m 2s");
    expect(output).toContain("Time:       10:23:45 UTC");
    expect(output).toContain("Stack:      React, TypeScript, Tailwind CSS");
  });

  it("prefers the Edge token over Chrome in the user agent", () => {
    const output = buildFetchOutput({
      ...CONTEXT,
      userAgent: "Mozilla/5.0 Chrome/120.0 Safari/537.36 Edg/120.0",
    });

    expect(output).toContain("Browser:    Edge");
  });

  it("uses deterministic defaults when no shell context is supplied", () => {
    const output = buildFetchOutput(createDefaultCommandContext());

    expect(output).toContain("Theme:      system");
    expect(output).toContain("Resolution: 1280x720");
    expect(output).toContain("Uptime:     0s");
    expect(output).toContain("Time:       00:00:00 UTC");
  });
});
