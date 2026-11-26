import { describe, expect, it } from "vitest";

import { CV, formatCvUpdatedAt } from "./cv";

describe("CV data", () => {
  it("points at the bundled PDF and formats its update date", () => {
    expect(CV.pdfUrl).toBe("/cv.pdf");
    expect(CV.filename).toBe("rizky-fauzi-ilmi-cv.pdf");
    expect(formatCvUpdatedAt(CV.updatedAt)).toBe("26 Nov 2026");
  });
});
