import { Kbd, KbdGroup } from "@/components/ui/kbd";

import { buildHelpModel, type HelpTipPart } from "../commands/help";
import { COMMAND_DEFINITIONS } from "../commands/registry";

type TipGroup =
  | { type: "keys"; values: string[] }
  | { type: "text"; value: string };

function groupTipParts(parts: HelpTipPart[]): TipGroup[] {
  return parts.reduce<TipGroup[]>((groups, part) => {
    if (part.type === "key") {
      const last = groups.at(-1);
      if (last?.type === "keys") last.values.push(part.value);
      else groups.push({ type: "keys", values: [part.value] });
    } else {
      groups.push({ type: "text", value: part.value });
    }
    return groups;
  }, []);
}

function TipLine({ parts }: { parts: HelpTipPart[] }) {
  return (
    <div className="flex items-start gap-2">
      <span aria-hidden>💡</span>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {groupTipParts(parts).map((group, index) =>
          group.type === "keys" ? (
            <KbdGroup key={`keys-${index}`}>
              {group.values.map((value, keyIndex) => (
                <Kbd key={`${value}-${keyIndex}`} variant="tui">
                  {value}
                </Kbd>
              ))}
            </KbdGroup>
          ) : (
            <span key={`text-${index}`}>{group.value}</span>
          ),
        )}
      </div>
    </div>
  );
}

export function HelpOutput() {
  const help = buildHelpModel(COMMAND_DEFINITIONS);
  const commandWidth =
    Math.max(10, ...help.commands.map((command) => command.label.length)) + 2;
  const commandColumns = {
    gridTemplateColumns: `minmax(0, ${commandWidth}ch) minmax(0, 1fr)`,
  };

  return (
    <div className="flex flex-col gap-3 pb-2 text-sm leading-5">
      <p className="font-mono">
        Portfolio Terminal ({help.version}) - interactive command prompt.
      </p>

      <section className="flex flex-col gap-1">
        <h3 className="font-mono text-muted-foreground">Usage:</h3>
        <p className="pl-4 font-mono">&lt;command&gt; [...flags] [...args]</p>
      </section>

      <section className="flex flex-col gap-1">
        <h3 className="font-mono text-muted-foreground">Commands:</h3>
        <div className="grid gap-1 pl-4">
          {help.commands.map((command) => (
            <div key={command.name} className="grid gap-2" style={commandColumns}>
              <span className="min-w-0 break-words font-mono">
                {command.label}
              </span>
              <span>{command.description}</span>
            </div>
          ))}
          <div className="grid gap-2" style={commandColumns}>
            <span className="min-w-0 break-words font-mono">
              &lt;command&gt; -h
            </span>
            <span>Print help text for a command</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-1">
        <h3 className="font-mono text-muted-foreground">Flags:</h3>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4">
          <span className="font-mono">-h, --help</span>
          <span>Display this menu and exit</span>
        </div>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="font-mono text-muted-foreground">Tips:</h3>
        <div className="flex flex-col gap-1.5 pl-4">
          {help.tips.map((parts, index) => (
            <TipLine key={`tip-${index}`} parts={parts} />
          ))}
        </div>
      </section>
    </div>
  );
}
