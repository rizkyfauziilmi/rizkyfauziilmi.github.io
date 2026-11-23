import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseShutdown } from "./shutdown";

describe("parseShutdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15, 10, 30, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("parses now and -c", () => {
    expect(parseShutdown(["now"])).toEqual({ kind: "now" });
    expect(parseShutdown(["-c"])).toEqual({ kind: "cancel" });
  });

  it("treats +0 as now", () => {
    expect(parseShutdown(["+0"])).toEqual({ kind: "now" });
  });

  it("parses +N minutes and mentions cancellation", () => {
    const plan = parseShutdown(["+5"]);

    expect(plan.kind).toBe("scheduled");
    if (plan.kind === "scheduled") {
      expect(plan.delayMs).toBe(5 * 60_000);
      expect(plan.text).toContain("in 5 minutes");
      expect(plan.text).toContain("shutdown -c");
    }
  });

  it("uses singular wording for +1", () => {
    const plan = parseShutdown(["+1"]);

    expect(plan.kind).toBe("scheduled");
    if (plan.kind === "scheduled") {
      expect(plan.text).toContain("in 1 minute (");
    }
  });

  it("parses a future HH:MM on the same day", () => {
    const plan = parseShutdown(["11:15"]);

    expect(plan.kind).toBe("scheduled");
    if (plan.kind === "scheduled") {
      expect(plan.delayMs).toBe(45 * 60_000);
      expect(plan.text).toContain("scheduled at 11:15");
    }
  });

  it("rolls a past HH:MM to tomorrow", () => {
    const plan = parseShutdown(["09:00"]);

    expect(plan.kind).toBe("scheduled");
    if (plan.kind === "scheduled") {
      expect(plan.delayMs).toBe(22.5 * 60 * 60_000);
      expect(plan.text).toContain("scheduled at 09:00");
    }
  });

  it.each(["25:00", "12:60", "+abc", "-1", "tomorrow", "+1.5"])(
    "rejects the invalid value %s",
    (value) => {
      expect(parseShutdown([value])).toEqual({ kind: "error" });
    },
  );

  it("rejects missing or extra arguments", () => {
    expect(parseShutdown([])).toEqual({ kind: "error" });
    expect(parseShutdown(["now", "+5"])).toEqual({ kind: "error" });
  });
});
