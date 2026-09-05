# AGENTS.md

Personal portfolio / GitHub Pages site. React 19 + TS + Vite, Tailwind CSS v4 via `@tailwindcss/vite`, shadcn/ui in the "base-luma" style.

## Commands

- `npm run dev` — Vite dev server (HMR)
- `npm run lint` — ESLint
- `npm run build` — `tsc -b && vite build`; runs the typecheck, so a clean build implies clean types
- `npm run preview` — preview production build
- No test framework or test script exists.

## Deploy

- `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages on every push to `main`.
- `dev` is the work branch; pushing to `main` ships the live site. Deploy-triggering PRs must merge to `main`.
- `vite.config.ts` uses `base: "/"`, correct for a `username.github.io` user site. Do not change to a project subpath.

## Architecture

- Entry flow: `index.html` → `src/main.tsx` → `src/App.tsx`.
- Path alias `@/*` → `src/*` (set in both `vite.config.ts` and `tsconfig.app.json`); always import via `@/`.
- `src/components/ui/*` holds shadcn primitives; `src/components/topbar` and `src/components/dock` are the feature shells; `src/components/theme-provider.tsx` + `mode-toggle.tsx` handle theming.

## Conventions and gotchas

- Tailwind v4: **no `tailwind.config.js`**. Tokens live as CSS variables in `src/index.css` via `@theme inline`. Adding a color/radius = edit CSS vars there, then reference `var(--x)`.
- Shadcn style is "base-luma": primitives are `@base-ui/react` (not Radix) and icons are `@phosphor-icons/react`. New/generated shadcn code will use these, not Radix.
- TS is strict: `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals/Parameters`. Type-only imports require the `type` modifier — the codebase uses inline `type`, e.g. `ButtonPrimitive.Props & VariantProps<typeof buttonVariants>`. No enums/namespaces/parameter-properties.
- `react-refresh/only-export-components` is enforced; extra exports (`useTheme`, `buttonVariants`, etc.) need a `// eslint-disable-next-line react-refresh/only-export-components` comment as the codebase already does.
- Dark mode is class-based: `.dark` on `<html>` via `@custom-variant dark`, driven by `ThemeProvider` (localStorage key `vite-ui-theme`).