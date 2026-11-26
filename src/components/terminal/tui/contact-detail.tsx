import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/toast";
import type { ContactChannel } from "../data";
import { TuiActions } from "./tui-actions";
import { TuiHints } from "./tui-hints";

interface ContactDetailProps {
  channel: ContactChannel;
  onBack: () => void;
}

export function ContactDetail({ channel, onBack }: ContactDetailProps) {
  const Icon = channel.icon;

  const copyValue = () =>
    toast
      .promise(navigator.clipboard.writeText(channel.copyText), {
        loading: { type: "loading", title: "Copying..." },
        success: {
          type: "success",
          title: "Copied to clipboard",
          description: channel.copyText,
          timeout: 2500,
        },
        error: {
          type: "error",
          title: "Copy failed",
          description: "Select the value and copy it manually.",
        },
      })
      // toast.promise already reports the failure in the toast.
      .catch(() => {});

  const actions = [
    {
      id: "copy",
      label: "copy text",
      icon: <Copy aria-hidden />,
      onSelect: copyValue,
    },
    ...(channel.href
      ? [{ id: "open", label: "open in browser ↗", href: channel.href }]
      : []),
  ];

  return (
    <section
      data-slot="contact-tui"
      data-view="detail"
      aria-label={`${channel.label} details`}
      className="flex h-full min-h-0 flex-col gap-3 py-1"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="font-mono text-sm">
            <span className="text-primary">~/contact/</span>
            <span>{channel.id}</span>
          </div>
          <TuiHints variant="detail" />
        </div>
        <Button
          type="button"
          variant="tui"
          size="tui"
          onClick={onBack}
          data-tui-interactive=""
        >
          back to list
        </Button>
      </header>

      <ScrollArea className="min-h-0 flex-1">
        <article
          data-slot="contact-detail"
          className="flex flex-col gap-3 pb-4"
        >
          <div
            aria-hidden
            className="flex size-12 items-center justify-center rounded-none border border-border text-primary"
          >
            <Icon className="size-6" />
          </div>
          <div>
            <h2 className="font-mono text-lg text-foreground">
              {channel.label}
            </h2>
            <p className="mt-2 max-w-prose font-mono text-sm break-all">
              {channel.value}
            </p>
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">
              {channel.description}
            </p>
          </div>
          <TuiActions actions={actions} label={`${channel.label} actions`} />
          {!channel.href && (
            <p className="text-xs text-muted-foreground">
              The open button appears once the real URL is filled in.
            </p>
          )}
        </article>
      </ScrollArea>
    </section>
  );
}
