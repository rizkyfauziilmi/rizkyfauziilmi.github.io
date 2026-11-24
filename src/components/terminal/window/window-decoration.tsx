import { MinusIcon, SquareIcon, XIcon } from "lucide-react";

// Decorative only: real buttons would be focusable and announced by screen
// readers even though they have no action, while Tab is reserved for the input.
const DECORATION_CLASSNAME =
  "inline-flex size-6 items-center justify-center rounded-full [&>svg]:size-3";

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
