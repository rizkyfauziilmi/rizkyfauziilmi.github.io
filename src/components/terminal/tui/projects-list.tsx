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
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Project } from "../data";
import { TuiHints } from "./tui-hints";

interface ProjectsListProps {
  projects: Project[];
  selectedIndex: number;
  onSelect: (index: number, id: string) => void;
  onExit: () => void;
}

export function ProjectsList({
  projects,
  selectedIndex,
  onSelect,
  onExit,
}: ProjectsListProps) {
  return (
    <section
      data-slot="projects-tui"
      data-view="list"
      aria-label="Projects"
      className="flex h-full min-h-0 flex-col gap-2 py-1"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="font-mono text-sm">
            <span className="text-primary">~/projects</span>
            <span className="text-muted-foreground">
              {" "}
              — {projects.length} entries
            </span>
          </div>
          <TuiHints />
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

      <ScrollArea className="min-h-0 flex-1">
        <ItemGroup role="listbox" aria-label="Projects" className="gap-1">
          {projects.map((project, index) => {
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
                onClick={() => onSelect(index, project.id)}
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
