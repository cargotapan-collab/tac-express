# Playwright E2E — Visual Regression + Accessibility

Two suites that catch the class of bugs functional testing misses: misaligned
grids, drift from design tokens, missing semantic HTML, low color contrast.

## Quick start

```bash
# 1. Start the dev server in another terminal
pnpm --filter dashboard dev

# 2. Run public-surface coverage (no auth required)
pnpm --filter dashboard test:visual          # pixel diffs (fails on drift)
pnpm --filter dashboard test:a11y            # axe-core WCAG 2.1 AA scan
pnpm --filter dashboard test:e2e             # both suites
pnpm --filter dashboard test:e2e:ui          # interactive UI mode
pnpm --filter dashboard test:e2e:report      # open the HTML report

# 3. Regenerate baselines after intentional design changes
pnpm --filter dashboard test:visual:update
```

## Enabling authenticated routes

Visual snapshots + a11y scans for `/ops-console/*` require a signed-in
session. Copy the example env file and fill in real credentials:

```bash
cp apps/dashboard/.env.test.local.example apps/dashboard/.env.test.local
# Edit the file, then:
pnpm dlx dotenv-cli -e apps/dashboard/.env.test.local -- pnpm --filter dashboard test:e2e
```

The `_auth.setup.ts` setup signs in once via the sign-in form and persists
the session under `.auth/operator.json` (gitignored). All authenticated
specs reuse that session — no per-test login.

## File map

| Path | Purpose |
|---|---|
| `playwright.config.ts` | Chromium @ 1280 + 1920, project-namespaced snapshots, light colorScheme, 1.5% pixel tolerance |
| `e2e/_auth.setup.ts` | One-time sign-in + `theme=light` localStorage seed |
| `e2e/visual.spec.ts` | 4 public + 7 protected route snapshots |
| `e2e/a11y.spec.ts` | axe-core scans on the same surfaces |
| `e2e/__snapshots__/` | Baseline images (commit these) |
| `playwright-report/`, `test-results/`, `.auth/` | Run artifacts (gitignored) |

## How violations surface

**Visual regression** — every spec compares the rendered screenshot against
the baseline. Differences greater than 1.5% of total pixels fail. View the
diff via `pnpm test:e2e:report`.

**Accessibility** — every spec runs axe-core with WCAG 2.1 AA tags. By
default findings are *logged but not blocking* (so first run surfaces real
issues without breaking CI). Set `AXE_FAIL_ON_VIOLATIONS=1` to gate.

## Why light theme is enforced

`next-themes` defaults to dark in the app providers. Without overriding,
Playwright would screenshot + audit the dark palette — which is correct
output but different from the C (cream) theme operators use by default.
`_auth.setup.ts` seeds `localStorage.theme = "light"` so subsequent specs
inherit the Warm Linen palette.
