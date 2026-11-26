import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { COMMAND_DEFINITIONS } from "../commands/registry";
import { buildAboutOutput, PORTFOLIO } from "../data";

const suggestions = COMMAND_DEFINITIONS.filter(
  (command) => !command.hidden && command.suggestInAbout,
).map((command) => command.name);

export function AboutOutput() {
  return (
    <div>
      <div className="flex gap-2 pt-2 pb-4">
        <Avatar size="lg" className="shrink-0">
          <AvatarImage src={PORTFOLIO.avatarUrl} alt={PORTFOLIO.name} />
          <AvatarFallback>RFI</AvatarFallback>
        </Avatar>
        <div>
          <p>{PORTFOLIO.name} 👋️</p>
          <p>{PORTFOLIO.role}</p>
        </div>
      </div>
      <div className="text-sm leading-5 whitespace-pre-wrap">
        {buildAboutOutput(suggestions)}
      </div>
    </div>
  );
}
