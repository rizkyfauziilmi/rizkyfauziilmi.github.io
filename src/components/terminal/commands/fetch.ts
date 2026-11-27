import { APP_HOST, APP_USER } from "../shared";
import { PORTFOLIO } from "../data/portfolio";
import { createInitialFileSystem, HOME_PATH } from "../filesystem";
import type { CommandContext } from "./types";

const ASCII_ART = [
  " /$$$$$$$  /$$$$$$$$ /$$$$$$",
  "| $$__  $$| $$_____/|_  $$_/",
  "| $$  \\ $$| $$        | $$",
  "| $$$$$$$/| $$$$$     | $$",
  "| $$__  $$| $$__/     | $$",
  "| $$  \\ $$| $$        | $$",
  "| $$  | $$| $$       /$$$$$$",
  "|__/  |__/|__/      |______/",
];
const ART_WIDTH = 28;
const ART_GAP = "  ";
const LABEL_WIDTH = 12;
const STACK = "React, TypeScript, Tailwind CSS";

function browserName(userAgent: string) {
  if (/Edg\//.test(userAgent)) return "Edge";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Safari\//.test(userAgent)) return "Safari";
  return "Browser";
}

function formatUptime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return [
    hours ? `${hours}h` : null,
    minutes ? `${minutes}m` : null,
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatTime(date: Date) {
  return `${date.toISOString().slice(11, 19)} UTC`;
}

export function createDefaultCommandContext(): CommandContext {
  return {
    theme: "system",
    now: new Date("2026-01-01T00:00:00.000Z"),
    viewport: { width: 1280, height: 720 },
    platform: "Browser",
    userAgent: "",
    uptimeMs: 0,
    filesystem: createInitialFileSystem(),
    cwd: HOME_PATH,
  };
}

export function buildFetchOutput(context: CommandContext): string {
  const rows: Array<[string, string]> = [
    ["User:", `${APP_USER}@${APP_HOST}`],
    ["Role:", PORTFOLIO.role],
    ["OS:", `Browser / ${context.platform || "Unknown"}`],
    ["Browser:", browserName(context.userAgent)],
    ["Shell:", `portfolio-terminal ${__APP_VERSION__}`],
    ["Theme:", context.theme],
    ["Resolution:", `${context.viewport.width}x${context.viewport.height}`],
    ["Uptime:", formatUptime(context.uptimeMs)],
    ["Time:", formatTime(context.now)],
    ["Stack:", STACK],
  ];

  // Center the shorter logo block against the info rows, then leave a fixed
  // gap so the two columns never touch.
  const artOffset = Math.max(
    0,
    Math.floor((rows.length - ASCII_ART.length) / 2),
  );
  const lines = rows.map(([label, value], index) => {
    const art = (ASCII_ART[index - artOffset] ?? "").padEnd(ART_WIDTH);
    return `${art}${ART_GAP}${label.padEnd(LABEL_WIDTH)}${value}`;
  });

  return `${lines.join("\n")}`;
}
