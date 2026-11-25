import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Project } from "../data";

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  return (
    <section
      data-slot="projects-tui"
      data-view="detail"
      aria-label={`${project.title} details`}
      className="flex h-full min-h-0 flex-col gap-3 py-1"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="font-mono text-sm">
          <span className="text-primary">~/projects/</span>
          <span>{project.title}</span>
        </div>
        <Button
          type="button"
          variant="tui"
          size="tui"
          onClick={onBack}
          data-tui-interactive=""
        >
          <KbdGroup>
            <Kbd variant="tui">Esc</Kbd>
            <Kbd variant="tui">q</Kbd>
          </KbdGroup>
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
          {project.url && (
            <Button
              render={<a href={project.url} target="_blank" rel="noreferrer" />}
              variant="tui-link"
              size="tui-link"
              nativeButton={false}
              data-tui-interactive=""
              className="w-fit"
            >
              open repository ↗
            </Button>
          )}
        </article>
      </ScrollArea>
    </section>
  );
}
