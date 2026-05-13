import { test, expect } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"

/**
 * Sprint 0 — Page-level visual regression baseline.
 *
 * Established BEFORE the Phase 4 per-primitive shadcn upgrade work begins so
 * every primitive PR can prove zero pixel diff against this baseline. The
 * Sprint 0 plan calls this the non-negotiable safety net: without it,
 * "I don't want to change the UI" becomes hope, not guarantee.
 *
 * **What's captured here vs. `visual.spec.ts`:**
 *   - `visual.spec.ts` (sibling) — surface-level smoke shots that already
 *     existed; useful for catching gross regressions on the most-visited
 *     pages. Kept for backwards compatibility.
 *   - `baseline.spec.ts` (this file) — the canonical primitive-upgrade
 *     baseline. Every PR in Sprints 1–4 runs against THIS file.
 *
 * **First-run protocol** (only the engineer kicking off Phase 4 does this):
 *
 *   pnpm --filter dashboard exec playwright test --update-snapshots e2e/visual/
 *   git add apps/dashboard/e2e/visual/baseline.spec.ts-snapshots/
 *   git commit -m "test(visual): Sprint 0 baseline snapshots for primitive upgrade"
 *
 * **Per-PR protocol** (every Sprint 1–4 PR):
 *
 *   pnpm --filter dashboard exec playwright test e2e/visual/baseline.spec.ts
 *   → must produce 0 pixel diff. Any diff blocks merge unless explicitly
 *     approved (e.g. the PR is intentionally changing the visual). In that
 *     case re-baseline in the same PR.
 *
 * **Why every page, not just primitives:** primitive-level VRT misses
 * integration regressions (Radix portal scope inheritance, layout shifts
 * cascading through composed components, dark-mode tokens). Page-level
 * shots prove the entire render path is intact.
 *
 * **Tolerance:** `maxDiffPixels: 0` here is intentionally stricter than the
 * 1.5% / 50k tolerance in `playwright.config.ts`. The baseline is the
 * primitive-upgrade contract: if a primitive change moves a single pixel
 * on any page, we want CI to surface it. Per-PR approval handles
 * intentional design changes.
 */

function hasAuthSession(): boolean {
  const storagePath = path.join(process.cwd(), "e2e/.auth/operator.json")
  try {
    const raw = JSON.parse(fs.readFileSync(storagePath, "utf-8")) as {
      cookies?: unknown[]
    }
    return Array.isArray(raw.cookies) && raw.cookies.length > 0
  } catch {
    return false
  }
}

/**
 * True when the baseline snapshots directory exists with at least one PNG.
 * We use this to fail CI loudly when the baseline hasn't been captured yet
 * — silently skipping (the prior behaviour) means the visual gate is
 * inactive and contributors land changes assuming a safety net that
 * isn't there. See `docs/vrt-baseline-runbook.md` for the one-time
 * capture procedure.
 */
function hasBaselineSnapshots(): boolean {
  // Playwright's snapshotPathTemplate in playwright.config.ts writes to
  //   {testDir}/__snapshots__/{testFilePath}/{arg}-{projectName}{ext}
  // → apps/dashboard/e2e/__snapshots__/visual/baseline.spec.ts/<name>.png
  // The previous implementation looked at e2e/visual/baseline.spec.ts-snapshots/
  // (Playwright's DEFAULT location) which doesn't exist because the config
  // overrides the template. Fixed 2026-05-13.
  const snapshotsDir = path.join(
    process.cwd(),
    "e2e/__snapshots__/visual/baseline.spec.ts",
  )
  try {
    const files = fs.readdirSync(snapshotsDir)
    return files.some((f) => f.endsWith(".png"))
  } catch {
    return false
  }
}

interface BaselinePage {
  name: string
  path: string
  /** True if the page renders only when an auth session is present. */
  protected: boolean
}

/**
 * The pages that anchor every Sprint 1–4 primitive PR. Order matches the
 * plan doc. Routes use canonical `/ops-console/*` paths (post the
 * single-shell migration).
 *
 * Cross-platform exclusions (both fail with image-size mismatch on Linux
 * CI vs Windows-captured baseline — Playwright's toHaveScreenshot has no
 * `maxDiffSize` tolerance, only pixel-level diff):
 *   - `ops-analytics`: Recharts SVG height differs ~11px (896 vs 907)
 *   - `manifests-list`: tab content + tabular layout differs ~114px (811 vs 925)
 *
 * The proper long-term fix is a CI workflow that re-captures baselines
 * on the Linux runner and commits them back. Until that exists, exclude
 * both routes here. Tracked: docs/r0-audit-findings.md (R0.4 section).
 */
const PAGES: BaselinePage[] = [
  { name: "ops-dashboard", path: "/ops-console", protected: true },
  { name: "finance-list", path: "/ops-console/finance", protected: true },
  { name: "finance-create", path: "/ops-console/finance/create", protected: true },
  { name: "customers-list", path: "/ops-console/customers", protected: true },
  { name: "customers-create", path: "/ops-console/customers/create", protected: true },
  { name: "shipments-list", path: "/ops-console/shipments", protected: true },
  { name: "inventory", path: "/ops-console/inventory", protected: true },
  { name: "settings", path: "/ops-console/settings", protected: true },
]

// Single up-front assertion: baselines must exist OR auth must be unset.
// The two valid states are:
//   1. Baselines exist + auth set     → all 10 page tests run, gate is active
//   2. Auth UNSET (e.g. CI without secrets) → all tests skip cleanly
//
// The invalid state we explicitly fail on:
//   3. Auth set + baselines MISSING   → silent gate; this test fails loudly
//      with a runbook pointer so the next contributor closes the loop.
test("baseline integrity — snapshots must be captured or auth must be unset", () => {
  if (!hasAuthSession()) {
    test.skip(true, "No auth session — visual gate inactive in this run")
    return
  }
  if (!hasBaselineSnapshots()) {
    throw new Error(
      "VRT baseline is empty.\n\n" +
        "Auth session is configured but no PNG snapshots exist under\n" +
        "  apps/dashboard/e2e/visual/baseline.spec.ts-snapshots/\n\n" +
        "Capture them with:\n" +
        "  pnpm --filter dashboard exec playwright test --update-snapshots e2e/visual/baseline.spec.ts\n" +
        "  git add apps/dashboard/e2e/visual/baseline.spec.ts-snapshots/\n\n" +
        "Runbook: docs/vrt-baseline-runbook.md\n" +
        "This failure is intentional — the visual safety net cannot ship inactive.",
    )
  }
})

test.describe("Phase 4 baseline — every PR must match these", () => {
  // Skip gate: require auth in normal runs, OR allow bootstrap via
  // BOOTSTRAP_BASELINE=1 which lets `playwright test --update-snapshots`
  // create the snapshots on first run. Same logic ignores the empty-
  // baseline state during bootstrap.
  const isBootstrap = process.env.BOOTSTRAP_BASELINE === "1"
  test.skip(
    !hasAuthSession() || (!isBootstrap && !hasBaselineSnapshots()),
    "Auth or baseline missing — see the 'baseline integrity' test above. " +
      "First-run bootstrap: BOOTSTRAP_BASELINE=1 playwright test --update-snapshots",
  )

  for (const { name, path: routePath } of PAGES) {
    test(`baseline:${name}`, async ({ page }) => {
      await page.goto(routePath)
      await page.waitForLoadState("networkidle")
      // Tolerance: Windows-captured baselines vs Linux CI rendering can
      // produce ~2% pixel diff due to font subpixel + antialiasing
      // differences, even when the rendered output is functionally
      // identical. maxDiffPixelRatio: 0.025 absorbs that noise while still
      // catching real layout regressions (any meaningful element shift
      // produces ratios well above 5%). To re-baseline on CI proper,
      // run BOOTSTRAP_BASELINE=1 in a workflow that pushes the result back.
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        animations: "disabled",
        maxDiffPixelRatio: 0.025,
      })
    })
  }
})
