import type { Icon } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DockAppProps {
  name: string;
  icon: Icon;
}

export function DockApp({ name, icon: Icon }: DockAppProps) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="ghost" size="icon-lg">
          <Icon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{name}</p>
      </TooltipContent>
    </Tooltip>
  );
}
