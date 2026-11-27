import { act, render, screen, waitFor } from "@testing-library/react";
import { Toaster } from "@/components/ui/toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CV } from "../data";
import { downloadCv, downloadFile } from "./download";

const fetchMock = vi.fn();
const createObjectURL = vi.fn(() => "blob:cv");
const revokeObjectURL = vi.fn();

let clickedDownload = "";
let gate: Promise<void> | undefined;

function response({
  ok = true,
  status = 200,
  chunks = ["%PDF"],
  contentLength = null as string | null,
}: {
  ok?: boolean;
  status?: number;
  chunks?: string[];
  contentLength?: string | null;
} = {}) {
  return {
    ok,
    status,
    headers: {
      get: (name: string) => {
        const header = name.toLowerCase();
        if (header === "content-length") return contentLength;
        if (header === "content-type") return "application/pdf";
        return null;
      },
    },
    body: {
      getReader: () => {
        let index = 0;
        return {
          read: async () => {
            if (gate && index === 1) await gate;
            if (index >= chunks.length) return { done: true, value: undefined };
            const value = new TextEncoder().encode(chunks[index++]);
            return { done: false, value };
          },
        };
      },
    },
  } as unknown as Response;
}

describe("downloadFile", () => {
  beforeEach(() => {
    clickedDownload = "";
    gate = undefined;
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clickedDownload = this.download;
    });
  });

  afterEach(() => {
    gate = undefined;
    vi.unstubAllGlobals();
  });

  it("reports byte progress in a toast and downloads the blob", async () => {
    let release = () => {};
    gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    fetchMock.mockResolvedValue(
      response({ chunks: ["1234", "5678"], contentLength: "8" }),
    );

    render(<Toaster />);
    const pending = downloadFile({ url: "/cv.pdf", filename: "cv.pdf" });

    await waitFor(() => {
      expect(
        screen.getByRole("progressbar").getAttribute("aria-valuenow"),
      ).toBe("50");
    });
    expect(screen.getByText(/50% · 4 B \/ 8 B/)).toBeTruthy();

    await act(async () => {
      release();
      await pending;
    });

    expect(screen.getByText("Download complete")).toBeTruthy();
    expect(clickedDownload).toBe("cv.pdf");
    expect(createObjectURL).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:cv"),
    );
  });

  it("shows a byte count without a bar when the total is unknown", async () => {
    let release = () => {};
    gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    fetchMock.mockResolvedValue(response({ chunks: ["1234", "5678"] }));
    render(<Toaster />);

    const pending = downloadFile({ url: "/cv.pdf", filename: "cv.pdf" });
    await waitFor(() =>
      expect(screen.getByText("4 B downloaded")).toBeTruthy(),
    );
    expect(screen.queryByRole("progressbar")).toBeNull();

    await act(async () => {
      release();
      await pending;
    });
    expect(clickedDownload).toBe("cv.pdf");
  });

  it("turns the toast into an error instead of throwing", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    render(<Toaster />);

    await act(async () => {
      await downloadFile({ url: "/cv.pdf", filename: "cv.pdf" });
    });

    expect(screen.getByText("Download failed")).toBeTruthy();
    expect(screen.getByText("offline")).toBeTruthy();
    expect(clickedDownload).toBe("");
  });
});

describe("downloadCv", () => {
  it("uses the bundled PDF and filename", async () => {
    const fetch = vi.fn().mockResolvedValue(response());
    vi.stubGlobal("fetch", fetch);
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clickedDownload = this.download;
    });

    render(<Toaster />);
    await act(async () => {
      await downloadCv();
    });

    expect(fetch).toHaveBeenCalledWith(CV.pdfUrl);
    expect(clickedDownload).toBe(CV.filename);
    vi.unstubAllGlobals();
  });
});
