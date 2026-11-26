import { PROJECTS } from "../../data";
import { ProjectDetail } from "./project-detail";
import { ProjectsList } from "./projects-list";
import { useProjectsTui } from "./use-projects-tui";

export function ProjectsTui({ onExit }: { onExit: () => void }) {
  const { selectedIndex, expandedId, selectAt, closeDetail } = useProjectsTui(
    PROJECTS,
    onExit,
  );
  const expandedProject = PROJECTS.find((project) => project.id === expandedId);

  if (expandedProject) {
    return <ProjectDetail project={expandedProject} onBack={closeDetail} />;
  }

  return (
    <ProjectsList
      projects={PROJECTS}
      selectedIndex={selectedIndex}
      onSelect={selectAt}
      onExit={onExit}
    />
  );
}
