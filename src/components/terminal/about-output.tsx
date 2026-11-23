import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { buildAboutOutput, PORTFOLIO } from "./portfolio";

export function AboutOutput() {
  return (
    <div>
      <div className="flex gap-2 pb-4 pt-2">
        <Avatar size="lg" className="shrink-0">
          <AvatarImage src={PORTFOLIO.avatarUrl} alt={PORTFOLIO.name} />
          <AvatarFallback>RFI</AvatarFallback>
        </Avatar>
        <div>
          <p>{PORTFOLIO.name} 👋️</p>
          <p>{PORTFOLIO.role}</p>
        </div>
      </div>
      <div className="whitespace-pre-wrap text-sm leading-5">
        {buildAboutOutput()}
      </div>
    </div>
  );
}
