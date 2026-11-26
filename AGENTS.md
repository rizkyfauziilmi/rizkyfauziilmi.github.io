# Project instructions

## Before finishing any task

- Run `pnpm test`, `pnpm lint`, and `pnpm build`; all must pass. Also run `pnpm format:check` when formatting, docs, CI, or configuration change.
- Add or update tests whenever behavior changes; every new command, flag, or parser rule must have a matching test case.
- Update `version` in `package.json` only when the change is user-visible:
  - patch: fixes, tests, CI, docs, or other internal changes
  - minor: a new command or feature
  - major: breaking changes
- Report the final version and verification results.

## Library and framework documentation

- When you need API details or best practices for a library or framework, check the official docs shipped in `node_modules` first (for example `README.md`, `docs/`, and type declarations).
- If the installed package has no usable docs, use the Context7 MCP instead of relying on memory or guessing.

## Documentation

- Keep `README.md` accurate and up to date whenever commands, flags, scripts, tooling, or project structure change. Update it in the same change instead of waiting to be asked.
- Keep `README.md` short and user-facing: setup, scripts, commands and shortcuts, and stack. Do not add internal architecture trees, implementation details, type inventories, exhaustive flag catalogs, long tutorials, or CI/deployment sections; those belong in code, tests, workflows, or AGENTS.md.
- Do not expand `README.md` beyond that scope unless explicitly asked. Tighten or remove stale sections instead of accumulating detail.
- Verify README claims against the actual code and `package.json`; never document behavior that does not exist.

## Commits

When the user asks for a commit:

- Write all commit messages in English.
- Use Conventional Commits: `<type>(optional scope): <imperative subject>`.
- Allowed types: `feat`, `fix`, `docs`, `test`, `ci`, `chore`, `refactor`, `perf`, `build`, `style`.
- Subject line: lowercase, imperative mood, no trailing period, max 72 characters.
- Body: blank line after the subject; explain **what** and **why**, not how. Wrap at 72 characters.
- Breaking changes use `feat!:` / `fix!:` or a `BREAKING CHANGE:` footer.
- Stage only intended files and run `git diff --cached --check` before committing.
- The pre-commit hook runs `pnpm lint`, `pnpm format:check`, `pnpm test`, and `pnpm build`; it must pass. Never use `--no-verify` unless the user explicitly asks.
- Report the commit hash, subject, changed-file count, version, and verification results.

## Pull requests

When the user asks for a pull request:

- Use the `gh` CLI, not the GitHub MCP API (the MCP token may lack write permission).
- Push the head branch first (`git push origin <head>`), and check for an existing open PR for the same head/base.
- Look for `.github/PULL_REQUEST_TEMPLATE.md` or files under `.github/PULL_REQUEST_TEMPLATE/`; follow the template if present.
- Write the PR title and body in English, including all section headings.
- Title: short, descriptive, Conventional Commits style.
- Body: complete and self-contained. Include Summary, Changes, Problem fixed, Impact, a Verification checklist with exact commands and results, a Commit list, and Notes. Mention the version, file paths, and links to relevant issues/PRs.
- For a long body, write the markdown to a temporary file and use `gh pr create --body-file`.
- Add relevant labels, assign the repository owner by default, and request reviewers when known.
- Include head → base, diff scope (files, additions/deletions), and the final PR URL in the report.
- Do not merge unless the user explicitly asks.
