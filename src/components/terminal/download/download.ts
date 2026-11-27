import { toast } from "@/components/ui/toast";
import { CV } from "../data";

export type DownloadTarget = {
  url: string;
  filename: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${Math.round(bytes / 1024)} KB`;
}

function getTotal(response: Response) {
  const header = response.headers.get("Content-Length");
  if (!header) return 0;
  const total = Number(header);
  return Number.isFinite(total) && total > 0 ? total : 0;
}

async function readBody(response: Response, toastId: string) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("The response has no readable body");

  const chunks: Uint8Array[] = [];
  const total = getTotal(response);
  let loaded = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    chunks.push(value);
    loaded += value.byteLength;
    const progress =
      total > 0 ? Math.min(100, (loaded / total) * 100) : undefined;

    toast.update(toastId, {
      description:
        progress === undefined
          ? `${formatBytes(loaded)} downloaded`
          : `${Math.round(progress)}% · ${formatBytes(loaded)} / ${formatBytes(total)}`,
      data: { progress },
    });
  }

  return chunks;
}

/**
 * Stream a file into a Blob so the download can report real byte progress.
 *
 * This follows shadcn's documented loading → success/error toast lifecycle by
 * hand: `toast.promise()` does not expose its id, so it cannot accept the
 * intermediate byte updates that the progress bar needs. Errors stay in the
 * toast so callers can safely fire-and-forget this promise.
 */
export async function downloadFile({ url, filename }: DownloadTarget) {
  const toastId = toast.add({
    type: "loading",
    title: "Downloading CV...",
    description: "Starting download…",
    data: { progress: 0 },
  });

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`The server responded with ${response.status}`);
    }

    const chunks = await readBody(response, toastId);
    const blob = new Blob(chunks as BlobPart[], {
      type: response.headers.get("Content-Type") ?? "application/pdf",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Let the browser start the navigation before releasing the blob URL.
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);

    toast.update(toastId, {
      type: "success",
      title: "Download complete",
      description: filename,
      timeout: 2500,
    });
  } catch (error) {
    toast.update(toastId, {
      type: "error",
      title: "Download failed",
      description: error instanceof Error ? error.message : "Please try again.",
      data: { progress: undefined },
      timeout: 5000,
    });
  }
}

export function downloadCv() {
  return downloadFile({ url: CV.pdfUrl, filename: CV.filename });
}
