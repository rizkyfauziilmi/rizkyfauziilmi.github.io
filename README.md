# Rizky Fauzi Ilmi — Terminal Portfolio

An interactive, terminal-style portfolio built with React, TypeScript, and Vite. The whole site behaves like a shell: commands render text or components, themes switch at runtime, and a simulated reboot/shutdown lifecycle adds a bit of personality.

## Getting started

Requirements: Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite. Production output goes to `dist/`.

## Scripts

| Script            | Description                                    |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Start the Vite dev server                      |
| `pnpm build`      | Type-check with `tsc -b`, then build with Vite |
| `pnpm preview`    | Preview the production build locally           |
| `pnpm lint`       | Run Oxlint                                     |
| `pnpm test`       | Run the Vitest suite once                      |
| `pnpm test:watch` | Run Vitest in watch mode                       |

## Commands

| Command                         | Description                                                 |
| ------------------------------- | ----------------------------------------------------------- |
| `about`                         | Show the avatar, role, and short bio                        |
| `clear`                         | Clear the screen (command history survives)                 |
| `echo [text...]`                | Print text; `"quoted text"` stays in one argument           |
| `help`                          | List every public command and show usage tips               |
| `reboot`                        | Print a reboot message, then reload the page after 1 second |
| `shutdown <now\|+N\|HH:MM\|-c>` | Power off immediately, schedule a shutdown, or cancel one   |
| `theme <dark\|light\|system>`   | Switch the color theme                                      |

Run `help` or `<command> -h` for details. Bare `shutdown` also prints its own format help.

### Shutdown formats

```bash
shutdown now      # closes the tab while the Enter keypress is still active
shutdown +5       # five minutes from now
shutdown 23:30    # 24-hour local time; rolls to tomorrow if already past
shutdown -c       # cancel a pending shutdown
```

Browsers only allow a script to close a tab during a fresh user interaction. Scheduled shutdowns therefore end at the `System halted` screen instead of closing the tab; this is called out in the command output.

### Easter eggs

`sudo`, `rm`, and `whoami` are hidden commands. They are deliberately excluded from `help` and do not respond to `-h`/`--help`.

## Project structure

```text
src/
├── components/
│   ├── terminal/
│   │   ├── commands/   # registry, parser, help builders, shutdown parser
│   │   ├── data/       # portfolio content
│   │   ├── input/      # prompt textarea and fake caret
│   │   ├── output/     # text lines, about/theme views, halted screen
│   │   └── window/     # title bar and decorative controls
│   ├── theme-provider.tsx
│   └── ui/             # shadcn/Base UI primitives
├── hooks/              # focus, caret, command history, terminal history
├── lib/utils.ts        # single `cn` re-export
└── test/setup.ts       # jsdom helpers
```

Command results are plain data (`output`, `component`, `theme`, `reboot`, `shutdown`, `clear`, `blank`). The history hook turns them into terminal entries and owns the lifecycle timers; component views are resolved through `TERMINAL_VIEWS` so history never stores JSX.

## CI and deployment

`.github/workflows/main.yml` deploys to GitHub Pages on every push to `main`. It uses pnpm 12 and Node 22, and runs **Lint → Test → Build** before uploading the artifact.

## Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- shadcn/Base UI
- Vitest
- Oxlint
