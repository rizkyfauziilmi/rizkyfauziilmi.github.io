import { MinusIcon, SquareIcon, XIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

// Decorative only: real buttons would be focusable and announced by screen
// readers even though they have no action, while Tab is reserved for the input.
// The shadcn button scale still owns the visuals via its variant.
const DECORATION_CLASSNAME = buttonVariants({
  variant: "window-decoration",
  size: "window-decoration",
});

export function WindowDecoration() {
  return (
    <div aria-hidden className="space-x-2">
      <span className={DECORATION_CLASSNAME}>
        <MinusIcon />
      </span>
      <span className={DECORATION_CLASSNAME}>
        <SquareIcon />
      </span>
      <span className={DECORATION_CLASSNAME}>
        <XIcon />
      </span>
    </div>
  );
}
