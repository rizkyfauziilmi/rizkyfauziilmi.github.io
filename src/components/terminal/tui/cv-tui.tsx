import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CV, formatCvUpdatedAt } from "../data";
import { downloadCv } from "../download";
import { isTypingTarget } from "./keyboard";
import { TuiActions, type TuiAction } from "./tui-actions";
import { TuiHints } from "./tui-hints";

export function CvTui({ onExit }: { onExit: () => void }) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    try {
      if (document.fullscreenElement === viewer) {
        await document.exitFullscreen();
      } else if (viewer.requestFullscreen) {
        await viewer.requestFullscreen();
      } else {
        window.open(CV.pdfUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      window.open(CV.pdfUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(
        viewerRef.current !== null &&
          document.fullscreenElement === viewerRef.current,
      );

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const startDownload = useCallback(() => {
    if (isDownloading) return;
    setIsDownloading(true);
    void downloadCv().finally(() => setIsDownloading(false));
  }, [isDownloading]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.isComposing ||
        event.altKey ||
        event.metaKey ||
        isTypingTarget(event.target)
      ) {
        return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (event.ctrlKey) {
        if (key === "c") {
          event.preventDefault();
          onExit();
        }
        return;
      }

      if (key === "f") {
        event.preventDefault();
        void toggleFullscreen();
        return;
      }

      if (key === "d") {
        event.preventDefault();
        startDownload();
        return;
      }

      if (key === "Escape" || key === "q") {
        event.preventDefault();
        onExit();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onExit, startDownload, toggleFullscreen]);

  const actions: TuiAction[] = [
    {
      id: "fullscreen",
      label: isFullscreen ? "exit fullscreen" : "see in fullscreen",
      icon: <Maximize2 aria-hidden />,
      onSelect: () => void toggleFullscreen(),
    },
    {
      id: "download",
      label: isDownloading ? "downloading..." : "download PDF",
      icon: <Download aria-hidden />,
      onSelect: startDownload,
      disabled: isDownloading,
    },
  ];

  return (
    <section
      data-slot="cv-tui"
      aria-label="CV"
      className="flex h-full min-h-0 flex-col gap-2 py-1"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="font-mono text-sm">
            <span className="text-primary">~/cv</span>
            <span className="text-muted-foreground">
              {" "}
              — last updated {formatCvUpdatedAt(CV.updatedAt)}
            </span>
          </div>
          <TuiHints variant="cv" />
        </div>
        <Button
          type="button"
          variant="tui"
          size="tui"
          onClick={onExit}
          data-tui-interactive=""
        >
          back to terminal
        </Button>
      </header>

      <div
        ref={viewerRef}
        data-slot="cv-viewer"
        data-tui-interactive=""
        className="min-h-0 flex-1 overflow-hidden border border-border bg-background"
      >
        <iframe
          src={CV.pdfUrl}
          title="CV PDF viewer"
          className="h-full w-full"
        />
      </div>

      <TuiActions actions={actions} label="CV actions" />
    </section>
  );
}
