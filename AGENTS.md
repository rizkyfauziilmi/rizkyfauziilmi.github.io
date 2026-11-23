# Project instructions

## Before finishing any task

- Run `pnpm test`, `pnpm lint`, and `pnpm build`; all must pass.
- Add or update tests whenever behavior changes; every new command, flag, or parser rule must have a matching test case.
- Update `version` in `package.json` only when the change is user-visible:
  - patch: fixes, tests, CI, docs, or other internal changes
  - minor: a new command or feature
  - major: breaking changes
- Do not edit `README.md` unless explicitly asked (it is maintained manually).
- Report the final version and verification results.
