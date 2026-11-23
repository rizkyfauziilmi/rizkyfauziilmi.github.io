import { addDays, differenceInMilliseconds, format, parse } from "date-fns";

export const SHUTDOWN_ERROR =
  "(error) shutdown: expected 'now', '+5' (minutes), '23:30' (24-hour), or '-c'...";

export type ShutdownPlan =
  | { kind: "now" }
  | { kind: "scheduled"; delayMs: number; text: string }
  | { kind: "cancel" }
  | { kind: "error" };

const MINUTE = 60_000;

export function parseShutdown(args: string[]): ShutdownPlan {
  if (args.length !== 1) return { kind: "error" };

  const [value] = args;
  if (value === "now") return { kind: "now" };
  if (value === "-c") return { kind: "cancel" };

  const relative = /^\+(\d+)$/.exec(value);
  if (relative) {
    const minutes = Number(relative[1]);
    if (!Number.isSafeInteger(minutes)) return { kind: "error" };
    if (minutes === 0) return { kind: "now" };

    const delayMs = minutes * MINUTE;
    const at = new Date(Date.now() + delayMs);
    return {
      kind: "scheduled",
      delayMs,
      text: `Shutdown scheduled in ${minutes} minute${minutes === 1 ? "" : "s"} (${format(at, "HH:mm")}). Browsers only allow closing the tab with 'shutdown now'; this will end at the 'System halted' screen. Run 'shutdown -c' to cancel.`,
    };
  }

  const clock = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (clock) {
    const hours = Number(clock[1]);
    const minutes = Number(clock[2]);
    if (hours > 23 || minutes > 59) return { kind: "error" };

    const now = new Date();
    const time = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    let target = parse(time, "HH:mm", now);
    // A past time means tomorrow, matching the Unix shutdown behaviour.
    if (differenceInMilliseconds(target, now) <= 0) target = addDays(target, 1);

    return {
      kind: "scheduled",
      delayMs: differenceInMilliseconds(target, now),
      text: `Shutdown scheduled at ${format(target, "HH:mm")}. Browsers only allow closing the tab with 'shutdown now'; this will end at the 'System halted' screen. Run 'shutdown -c' to cancel.`,
    };
  }

  return { kind: "error" };
}
