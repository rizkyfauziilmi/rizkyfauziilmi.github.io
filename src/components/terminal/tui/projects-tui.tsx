import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PROJECTS } from "../data";
import { useProjectsTui } from "./use-projects-tui";

function TuiHints() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[0.65rem] text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <KbdGroup>
          <Kbd variant="tui">↑</Kbd>
          <Kbd variant="tui">↓</Kbd>
        </KbdGroup>
        navigate
      </span>
      <span className="inline-flex items-center gap-1">
        <KbdGroup>
          <Kbd variant="tui">j</Kbd>
          <Kbd variant="tui">k</Kbd>
        </KbdGroup>
        navigate
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd variant="tui">Enter</Kbd> detail
      </span>
      <span className="inline-flex items-center gap-1">
        <Kbd variant="tui">q</Kbd> /{" "}
        <KbdGroup>
          <Kbd variant="tui">Ctrl</Kbd>
          <Kbd variant="tui">C</Kbd>
        </KbdGroup>{" "}
        exit
      </span>
      <span>click to select, again to inspect</span>
    </div>
  );
}

export function ProjectsTui({ onExit }: { onExit: () => void }) {
  const { selectedIndex, expandedId, selectAt, closeDetail } = useProjectsTui(
    PROJECTS,
    onExit,
  );
  const expandedProject = PROJECTS.find((project) => project.id === expandedId);

  if (expandedProject) {
    return (
      <section
        data-slot="projects-tui"
        data-view="detail"
        aria-label={`${expandedProject.title} details`}
        className="flex h-full min-h-0 flex-col gap-3 py-1"
      >
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
          <div className="font-mono text-sm">
            <span className="text-primary">~/projects/</span>
            <span>{expandedProject.title}</span>
          </div>
          <Button
            type="button"
            variant="tui"
            size="tui"
            onClick={closeDetail}
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
              src={expandedProject.image}
              alt={`${expandedProject.title} preview`}
              data-tui-interactive=""
              className="aspect-video rounded-none border object-cover size-1/2"
            />
            <div>
              <h2 className="font-mono text-lg text-foreground">
                {expandedProject.title}
              </h2>
              <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                {expandedProject.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="mr-1 font-mono text-xs text-muted-foreground">
                {expandedProject.year}
              </span>
              {expandedProject.tech.map((tech) => (
                <Badge key={tech} variant="tui">
                  {tech}
                </Badge>
              ))}
            </div>
            {expandedProject.url && (
              <Button
                render={
                  <a
                    href={expandedProject.url}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
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

  return (
    <section
      data-slot="projects-tui"
      data-view="list"
      aria-label="Projects"
      className="flex h-full min-h-0 flex-col gap-2 py-1"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="font-mono text-sm">
          <span className="text-primary">~/projects</span>
          <span className="text-muted-foreground">
            {" "}
            — {PROJECTS.length} entries
          </span>
        </div>
        <TuiHints />
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <ItemGroup role="listbox" aria-label="Projects" className="gap-1">
          {PROJECTS.map((project, index) => {
            const selected = index === selectedIndex;

            return (
              <Item
                key={project.id}
                variant="tui"
                size="tui"
                role="option"
                aria-selected={selected}
                data-selected={selected ? "true" : undefined}
                data-tui-interactive=""
                onClick={() => selectAt(index, project.id)}
                className="cursor-pointer"
              >
                <span
                  aria-hidden
                  className={
                    selected ? "w-3 text-primary" : "w-3 text-transparent"
                  }
                >
                  ❯
                </span>
                <ItemMedia variant="tui" aria-hidden>
                  <img src={project.image} alt="" loading="lazy" />
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="font-mono">{project.title}</ItemTitle>
                </ItemContent>
                <ItemActions className="ml-auto gap-1">
                  <span className="font-mono text-[0.65rem] text-muted-foreground">
                    {project.year}
                  </span>
                  {project.tech.slice(0, 2).map((tech) => (
                    <Badge key={tech} variant="tui">
                      {tech}
                    </Badge>
                  ))}
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      </ScrollArea>

      <p className="shrink-0 border-t border-border pt-2 text-xs text-muted-foreground">
        Press <Kbd variant="tui">Enter</Kbd> to inspect the selected project.
      </p>
    </section>
  );
}
