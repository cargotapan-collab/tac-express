# Quality Gates Convention

Cross-cutting rule for ALL TAC Express task skills. The "five must-pass commands"
are not negotiable, not skippable, not "I'll fix it after merge."

## The Five Gates (in order)

```bash
pnpm lint --max-warnings 0   # 1. Zero lint warnings (LAW 1, 2, 3, 8, 9, 10, 11)
pnpm typecheck               # 2. Zero TS errors across the workspace
pnpm test                    # 3. All Vitest unit + Playwright E2E pass
pnpm build                   # 4. Both apps (web, dashboard) build with Turbopack
pnpm audit:all               # 5. governance + auth-boundary + skills + design-spec
```

Any failure ⇒ **stop**, route to `tac-debug`, find the root cause, fix, re-run.
Do NOT use `--no-verify`, do NOT add `// eslint-disable-next-line`,
do NOT comment out the failing test.

## When to run

| Phase | Gates 1–4 | Gate 5 (audit:all) |
|---|---|---|
| Mid-implementation, fast loop | 1 (lint) + 2 (types) only | skip |
| Pre-commit (per task) | All four | required |
| Pre-PR (before opening) | All four | required + manual checklist (`AGENTS.md` §7b) |
| Pre-merge | All four (CI re-runs) | CI runs the audit |

## Why these five

- `lint` enforces LAWs 1, 2, 3, 8, 9, 10, 11 directly via custom ESLint rules.
- `typecheck` catches schema drift after `pnpm db:generate-types` (LAW 6/7/8).
- `test` is the only proof TDD was followed (skill `tac-tdd`).
- `build` is the only proof Turbopack + Next 16 still resolves the import graph.
- `audit:all` runs the four governance scripts:
  - `audit:governance` — package boundary + forbidden-package check
  - `audit:auth-boundary` — `@supabase/*` confined to `packages/database/`
  - `audit:skills` — every skill has valid frontmatter + sections
  - `audit:design-spec` — globals.css ↔ DESIGN_SYSTEM.md drift

## Anti-patterns

- Skipping gate 5 because "it takes too long" — the audit is the only check that
  catches a forbidden-package install or an `@supabase/*` leak into apps.
- Running `pnpm test --run --no-coverage` only — the full `pnpm test` is the gate.
- Treating CI as the first run — by the time CI fails, the diff is in review and
  every reviewer wastes a cycle.
- Bypassing pre-commit hooks with `git commit --no-verify`. NEVER. If the hook
  is wrong, fix the hook (load `update-config` skill).

## Reference

- Skills: `tac-debug`, `tac-tdd`, `tac-code-review`
- Files: `package.json` (scripts), `.husky/`, `pnpm-workspace.yaml`
- Memory: `reference_quality_gates.md`
