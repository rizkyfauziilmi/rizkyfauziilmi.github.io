import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ContactChannel } from "../data";
import { TuiHints } from "./tui-hints";

interface ContactListProps {
  channels: ContactChannel[];
  selectedIndex: number;
  onSelect: (index: number, id: string) => void;
  onExit: () => void;
}

export function ContactList({
  channels,
  selectedIndex,
  onSelect,
  onExit,
}: ContactListProps) {
  return (
    <section
      data-slot="contact-tui"
      data-view="list"
      aria-label="Contact"
      className="flex h-full min-h-0 flex-col gap-2 py-1"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="font-mono text-sm">
            <span className="text-primary">~/contact</span>
            <span className="text-muted-foreground">
              {" "}
              — {channels.length} entries
            </span>
          </div>
          <TuiHints />
        </div>
        <Button
          type="button"
          variant="tui"
          size="tui"
          onClick={onExit}
          data-tui-interactive=""
        >
          back to terminal
        </Button>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <ItemGroup
          role="listbox"
          aria-label="Contact channels"
          className="gap-1"
        >
          {channels.map((channel, index) => {
            const selected = index === selectedIndex;
            const Icon = channel.icon;

            return (
              <Item
                key={channel.id}
                variant="tui"
                size="tui"
                role="option"
                aria-selected={selected}
                data-selected={selected ? "true" : undefined}
                data-tui-interactive=""
                onClick={() => onSelect(index, channel.id)}
                className="cursor-pointer"
              >
                <span
                  aria-hidden
                  className={
                    selected ? "w-3 text-primary" : "w-3 text-transparent"
                  }
                >
                  ❯
                </span>
                <ItemMedia
                  variant="icon"
                  aria-hidden
                  className="size-8 rounded-none border border-border text-primary"
                >
                  <Icon className="size-4" />
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="font-mono">{channel.label}</ItemTitle>
                </ItemContent>
                <ItemActions className="ml-auto min-w-0 gap-1 font-mono text-[0.65rem] text-muted-foreground">
                  <span className="truncate">{channel.value}</span>
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
      </ScrollArea>

      <p className="shrink-0 border-t border-border pt-2 text-xs text-muted-foreground">
        Press <Kbd variant="tui">Enter</Kbd> to inspect the selected channel.
      </p>
    </section>
  );
}
