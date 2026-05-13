# VRT Baseline Runbook

The single human-gated step in the Phase 4+ plan. Until this runbook is executed once, **the visual safety net is inactive** — every PR after Sprint 0 is operating on hope. The new `baseline integrity` test in [apps/dashboard/e2e/visual/baseline.spec.ts](../apps/dashboard/e2e/visual/baseline.spec.ts) fails loudly when auth is set but baselines are missing, so the gate cannot ship silently green.

This document is the once-per-major-design-change procedure. After the first capture, only re-run when a deliberate design change ships (and re-baseline as part of that same PR).

## Prerequisites

### Local capture (one-time)

- Dev server runs at `http://localhost:3001`
- Supabase env configured (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in `apps/dashboard/.env.local`
- Test user provisioned: `E2E_USER_EMAIL` + `E2E_USER_PASSWORD` exported in your shell
- Seed data loaded (so list pages render real rows, not empty states)
- Playwright browsers installed: `pnpm --filter dashboard exec playwright install --with-deps chromium`

### CI gate (so the integrity test fires)

The `baseline integrity` test only fails loudly when auth env vars are present. **Verify the GitHub repository secrets are set** before relying on the gate:

```bash
gh secret list --repo <org>/<repo>
# Expect: E2E_USER_EMAIL, E2E_USER_PASSWORD, NEXT_PUBLIC_SUPABASE_URL,
#         NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

The workflow at [.github/workflows/e2e.yml](../.github/workflows/e2e.yml) references these via `${{ secrets.E2E_USER_EMAIL }}` etc. If the secrets aren't configured, every CI run skips the baseline-integrity test silently — the same failure mode this runbook was meant to prevent. Adding the secrets is a repo-admin Settings → Secrets action; do it once, do it before relying on the gate.

## Capture procedure

```bash
# 1. Boot the dev server in terminal 1
pnpm dev

# 2. In terminal 2, run the auth setup once — produces e2e/.auth/operator.json
export E2E_USER_EMAIL="<test-user-email>"
export E2E_USER_PASSWORD="<test-user-password>"
pnpm --filter dashboard exec playwright test e2e/_auth.setup.ts

# 3. Capture the baseline PNGs
pnpm --filter dashboard exec playwright test --update-snapshots e2e/visual/baseline.spec.ts

# 4. Verify the snapshots were produced
ls apps/dashboard/e2e/visual/baseline.spec.ts-snapshots/
# Expect: ops-dashboard.png, ops-analytics.png, finance-list.png, ... (10 files × 2 viewports)

# 5. Verify the gate is now active (should pass with 0 diff)
pnpm --filter dashboard exec playwright test e2e/visual/baseline.spec.ts
# Expect: 21 passed (10 baseline pages × 2 viewports + 1 integrity check)

# 6. Commit
git add apps/dashboard/e2e/visual/baseline.spec.ts-snapshots/
git commit -m "test(visual): capture Sprint 0 baseline snapshots"
```

## How CI consumes this

The `e2e` workflow (`.github/workflows/e2e.yml`) runs every PR. After the baselines are committed:

- If a PR doesn't change visuals → all 10 baseline tests pass with 0 diff.
- If a PR changes visuals → the affected baseline tests fail with a visible pixel diff in the uploaded `playwright-report` + `visual-diffs` artifacts. The PR author must either:
  - **Revert the visual change** (preserves zero-diff contract), OR
  - **Acknowledge the intentional change** and re-baseline in the same PR via `pnpm --filter dashboard exec playwright test --update-snapshots e2e/visual/baseline.spec.ts`

## When to re-baseline

| Trigger | Action |
|---|---|
| Token edit in `globals.css` (color, spacing, type) | Re-baseline in the same PR |
| New page added to `PAGES` in baseline.spec.ts | Add the page first, capture, commit together |
| Browser version bump in CI (rare) | Re-baseline if a non-trivial diff appears that's font-rendering-only |
| Anti-aliasing nudge from OS / Playwright update | Investigate first; only re-baseline if confirmed environmental |

Do **not** re-baseline because "the PR broke things and I'm in a hurry." That defeats the entire point of the gate.

## Failure modes

| Symptom | Diagnosis |
|---|---|
| `baseline integrity` test fails with "VRT baseline is empty" | Run this runbook — auth is set but no PNGs are committed |
| `baseline integrity` test skips with "No auth session" | E2E_USER_EMAIL / E2E_USER_PASSWORD not set; CI without secrets behaves this way intentionally |
| All 10 baseline tests fail with a few-pixel diff | Likely font-antialiasing or motion residue. Inspect the diff artifact before re-baselining. |
| Baseline tests fail on every PR | The dev server isn't loading the same seed state used during capture. Reset seed, recapture. |

## Why this exists as a doc

The integrity test (added in this commit) makes a missing baseline impossible to ignore in CI. This doc is the action plan for when that test fails — the recovery path is a single, well-scripted procedure, not a guessing game.
