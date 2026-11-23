import { Button } from "../../ui/button";
import { XIcon, SquareIcon, MinusIcon } from "lucide-react";

export function WindowDecoration() {
  return (
    <div className="space-x-2">
      <Button size="icon-xs" className="rounded-full" variant="ghost">
        <MinusIcon />
      </Button>
      <Button size="icon-xs" className="rounded-full" variant="ghost">
        <SquareIcon />
      </Button>
      <Button size="icon-xs" className="rounded-full" variant="ghost">
        <XIcon />
      </Button>
    </div>
  );
}
