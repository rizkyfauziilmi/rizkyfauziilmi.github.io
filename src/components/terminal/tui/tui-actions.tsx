import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { isTypingTarget } from "./keyboard";

export interface TuiAction {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onSelect?: () => void;
}

interface TuiActionsProps {
  actions: TuiAction[];
  label?: string;
}

export function TuiActions({ actions, label = "Actions" }: TuiActionsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const groupRef = useRef<HTMLDivElement>(null);
  // Derive a valid index instead of resetting state when an action disappears.
  const currentIndex = activeIndex < actions.length ? activeIndex : 0;

  useEffect(() => {
    const getActionElement = (index: number) =>
      groupRef.current?.querySelector<HTMLElement>(
        `[data-tui-action="${index}"]`,
      );

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.isComposing ||
        event.altKey ||
        event.metaKey ||
        event.ctrlKey ||
        isTypingTarget(event.target) ||
        actions.length === 0
      ) {
        return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === "ArrowRight" || key === "l") {
        event.preventDefault();
        setActiveIndex((currentIndex + 1) % actions.length);
        return;
      }

      if (key === "ArrowLeft" || key === "h") {
        event.preventDefault();
        setActiveIndex((currentIndex - 1 + actions.length) % actions.length);
        return;
      }

      if (key === "Enter") {
        event.preventDefault();
        getActionElement(currentIndex)?.click();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [actions.length, currentIndex]);

  useEffect(() => {
    groupRef.current
      ?.querySelector<HTMLElement>(`[data-tui-action="${currentIndex}"]`)
      ?.focus();
  }, [currentIndex, actions.length]);

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label={label}
      data-slot="tui-actions"
      className="flex flex-wrap items-center gap-2"
    >
      {actions.map((action, index) => {
        const active = index === currentIndex;
        const sharedProps = {
          "data-tui-action": index,
          "data-tui-active": active ? "" : undefined,
          "aria-current": active ? ("true" as const) : undefined,
          onFocus: () => setActiveIndex(index),
          onClick: () => setActiveIndex(index),
        };

        return action.href ? (
          <Button
            key={action.id}
            {...sharedProps}
            render={<a href={action.href} target="_blank" rel="noreferrer" />}
            variant="tui-link"
            size="tui-link"
            nativeButton={false}
            className={active ? "text-foreground underline" : undefined}
          >
            {action.icon}
            {action.label}
          </Button>
        ) : (
          <Button
            key={action.id}
            {...sharedProps}
            type="button"
            variant="tui"
            size="tui"
            onClick={() => {
              setActiveIndex(index);
              action.onSelect?.();
            }}
            className={
              active
                ? "border-primary bg-accent text-accent-foreground"
                : undefined
            }
          >
            {action.icon}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
