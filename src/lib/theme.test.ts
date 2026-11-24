import { describe, expect, it } from "vitest";

import { isThemeMode } from "./theme";

describe("isThemeMode", () => {
  it.each(["dark", "light", "system"])("accepts %s", (value) => {
    expect(isThemeMode(value)).toBe(true);
  });

  it.each(["neon", "", undefined, null])("rejects %s", (value) => {
    expect(isThemeMode(value)).toBe(false);
  });
});
