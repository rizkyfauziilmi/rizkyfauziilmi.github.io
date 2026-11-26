import type { ReactNode } from "react";

import { Kbd, KbdGroup } from "@/components/ui/kbd";

type TuiHintsProps = {
  variant?: "list" | "detail";
};

function Hint({
  hint,
  keys,
  children,
}: {
  hint: string;
  keys: ReactNode;
  children: ReactNode;
}) {
  return (
    <span data-hint={hint} className="inline-flex items-center gap-1">
      {keys}
      {children}
    </span>
  );
}

export function TuiHints({ variant = "list" }: TuiHintsProps) {
  const isDetail = variant === "detail";

  return (
    <div
      data-slot="tui-hints"
      data-variant={variant}
      className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-[0.65rem] text-muted-foreground"
    >
      {isDetail ? (
        <>
          <Hint
            hint="actions"
            keys={
              <>
                <KbdGroup>
                  <Kbd variant="tui">←</Kbd>
                  <Kbd variant="tui">→</Kbd>
                </KbdGroup>
                <KbdGroup>
                  <Kbd variant="tui">h</Kbd>
                  <Kbd variant="tui">l</Kbd>
                </KbdGroup>
              </>
            }
          >
            select action
          </Hint>
          <Hint hint="activate" keys={<Kbd variant="tui">Enter</Kbd>}>
            activate
          </Hint>
          <Hint
            hint="back"
            keys={
              <>
                <Kbd variant="tui">Esc</Kbd> / <Kbd variant="tui">q</Kbd>
              </>
            }
          >
            back
          </Hint>
        </>
      ) : (
        <>
          <Hint
            hint="navigate"
            keys={
              <>
                <KbdGroup>
                  <Kbd variant="tui">↑</Kbd>
                  <Kbd variant="tui">↓</Kbd>
                </KbdGroup>
                <KbdGroup>
                  <Kbd variant="tui">j</Kbd>
                  <Kbd variant="tui">k</Kbd>
                </KbdGroup>
              </>
            }
          >
            navigate
          </Hint>
          <Hint hint="detail" keys={<Kbd variant="tui">Enter</Kbd>}>
            detail
          </Hint>
        </>
      )}
      <Hint
        hint="exit"
        keys={
          <>
            <Kbd variant="tui">q</Kbd> /{" "}
            <KbdGroup>
              <Kbd variant="tui">Ctrl</Kbd>
              <Kbd variant="tui">C</Kbd>
            </KbdGroup>
          </>
        }
      >
        exit
      </Hint>
      {!isDetail && <span>click to select, again to inspect</span>}
    </div>
  );
}
