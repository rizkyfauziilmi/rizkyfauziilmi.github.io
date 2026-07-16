import {
  TerminalIcon,
  GlobeIcon,
  FolderIcon,
  FileTextIcon,
  CalculatorIcon,
  NoteIcon,
  GearSixIcon,
  InfoIcon,
  type Icon,
} from "@phosphor-icons/react";
import { DockApp } from "./dock-app";

const apps: { name: string; icon: Icon }[] = [
  { name: "Browser", icon: GlobeIcon },
  { name: "Files", icon: FolderIcon },
  { name: "Terminal", icon: TerminalIcon },
  { name: "Editor", icon: FileTextIcon },
  { name: "Calculator", icon: CalculatorIcon },
  { name: "Notes", icon: NoteIcon },
  { name: "Settings", icon: GearSixIcon },
  { name: "About", icon: InfoIcon },
];

export default function Dock() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-fit p-2 border rounded-md">
      <div className="space-x-2">
        {apps.map((app, id) => (
          <DockApp key={id} name={app.name} icon={app.icon} />
        ))}
      </div>
    </div>
  );
}
