import { Copy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/toast";
import type { Project } from "../../data";
import { TuiActions, TuiHints } from "../shared";

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const copyUrl = () => {
    if (!project.url) return;
    return (
      toast
        .promise(navigator.clipboard.writeText(project.url), {
          loading: { type: "loading", title: "Copying..." },
          success: {
            type: "success",
            title: "Copied to clipboard",
            description: project.url,
            timeout: 2500,
          },
          error: {
            type: "error",
            title: "Copy failed",
            description: "Select the URL and copy it manually.",
          },
        })
        // toast.promise already reports the failure in the toast.
        .catch(() => {})
    );
  };

  const actions = project.url
    ? [
        {
          id: "copy",
          label: "copy URL",
          icon: <Copy aria-hidden />,
          onSelect: copyUrl,
        },
        { id: "open", label: "open repository ↗", href: project.url },
      ]
    : [];

  return (
    <section
      data-slot="projects-tui"
      data-view="detail"
      aria-label={`${project.title} details`}
      className="flex h-full min-h-0 flex-col gap-3 py-1"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="font-mono text-sm">
            <span className="text-primary">~/projects/</span>
            <span>{project.title}</span>
          </div>
          <TuiHints variant="detail" />
        </div>
        <Button
          type="button"
          variant="tui"
          size="tui"
          onClick={onBack}
          data-tui-interactive=""
        >
          back to list
        </Button>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <article
          data-slot="project-detail"
          className="flex flex-col gap-3 pb-4"
        >
          <img
            src={project.image}
            alt={`${project.title} preview`}
            data-tui-interactive=""
            className="aspect-video size-1/2 rounded-none border object-cover"
          />
          <div>
            <h2 className="font-mono text-lg text-foreground">
              {project.title}
            </h2>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              {project.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="mr-1 font-mono text-xs text-muted-foreground">
              {project.year}
            </span>
            {project.tech.map((tech) => (
              <Badge key={tech} variant="tui">
                {tech}
              </Badge>
            ))}
          </div>
          <TuiActions actions={actions} label={`${project.title} actions`} />
        </article>
      </ScrollArea>
    </section>
  );
}
