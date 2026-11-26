# Rizky Fauzi Ilmi — Terminal Portfolio

An interactive terminal-style portfolio built with React, TypeScript, and Vite. Commands render text or components, themes switch at runtime, and reboot/shutdown add a bit of personality.

## Getting started

Requires Node.js 22 and pnpm 12.

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite. Production output goes to `dist/`. `pnpm install` also configures the pre-commit hook; commits must pass format, lint, test, and build.

## Scripts

| Script                              | Description                             |
| ----------------------------------- | --------------------------------------- |
| `pnpm dev`                          | Start the Vite dev server               |
| `pnpm build`                        | Type-check and build to `dist/`         |
| `pnpm preview`                      | Preview the production build            |
| `pnpm format` / `pnpm format:check` | Format / check formatting with Prettier |
| `pnpm lint`                         | Run Oxlint                              |
| `pnpm test` / `pnpm test:watch`     | Run Vitest once / in watch mode         |

## Commands

| Command                         | Description                                    |
| ------------------------------- | ---------------------------------------------- |
| `about`                         | Show the avatar, role, and bio                 |
| `clear`                         | Clear the screen (history survives)            |
| `echo [text...]`                | Print text; quotes group words                 |
| `help`                          | List public commands and tips                  |
| `neofetch`                      | Show system and portfolio info                 |
| `projects`                      | Browse projects in an interactive TUI          |
| `contact`                       | Browse contact channels in an interactive TUI  |
| `cv` / `resume`                 | View the CV PDF, or use `--download`           |
| `reboot`                        | Reload the page                                |
| `shutdown <now\|+N\|HH:MM\|-c>` | Close now, schedule (`+5`, `23:30`), or cancel |
| `theme <dark\|light\|system>`   | Switch the color theme                         |

Run `help` or `<command> -h` for details; `echo` and hidden commands are exceptions. Hidden eggs `fastfetch`, `sudo`, `rm`, and `whoami` work but stay out of help.

## Shortcuts

- `Tab` completes commands, flags, and argument values; press again to cycle matches, `Shift+Tab` to go back.
- `Enter` accepts a highlighted match; press again to run it. `Escape` cancels it.
- `Ctrl+?` (or `Ctrl+/`) opens help. `↑`/`↓` browse history; type a prefix then `↑` to filter it.
- In the `projects` and `contact` TUIs: `↑`/`↓` or `j`/`k` move, `Enter` opens detail. In detail, `←`/`→` or `h`/`l` switch actions, `Enter` activates, `Esc`/`q` goes back, and `q` in the list or `Ctrl+C` anywhere exits. Detail actions copy the value (success toast) or open the link. Header buttons go back: detail → list, list → terminal.
- The `cv`/`resume` TUI shows the PDF with a last-updated date: `←`/`→` or `h`/`l` select a button and `Enter` activates it, `F` toggles fullscreen, `D` downloads, `Esc`/`q` returns, and `Ctrl+C` exits. Downloads report progress in a toast; `cv --download` starts one immediately.

## Stack

React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · shadcn/Base UI · Vitest · Oxlint · Prettier
