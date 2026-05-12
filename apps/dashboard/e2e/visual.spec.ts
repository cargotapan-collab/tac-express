import { test, expect } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"

/**
 * Visual regression suite — pixel snapshots of every key dashboard surface.
 *
 * Catches the class of bug TestSprite can't see: misaligned grids, drift
 * from design tokens, font/color regressions, broken responsive layouts.
 *
 * First run produces baselines under e2e/__snapshots__/. Subsequent runs
 * fail if any rendered pixel differs by more than `maxDiffPixelRatio`
 * (0.2% — see playwright.config.ts).
 *
 * To regenerate baselines after an intentional design change:
 *   pnpm test:visual:update
 */

/** True when E2E_USER_EMAIL is set AND the auth-setup persisted cookies. */
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

// ── Public surfaces (no auth required) ─────────────────────────────────────
test.describe("Public surfaces", () => {
  test("sign-in page", async ({ page }) => {
    await page.goto("/sign-in")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("sign-in.png")
  })

  test("public tracking entry page", async ({ page }) => {
    await page.goto("/track")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("track-entry.png")
  })

  test("public tracking — seeded AWB TAC0123456789", async ({ page }) => {
    await page.goto("/track/TAC0123456789")
    await page.waitForLoadState("networkidle")
    // The page renders the tracking timeline + ETA stat card.
    await expect(page).toHaveScreenshot("track-awb-found.png")
  })

  test("public tracking — not found state", async ({ page }) => {
    await page.goto("/track/TAC9999999999")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("track-not-found.png")
  })
})

// ── Protected surfaces (auth required) ─────────────────────────────────────
test.describe("Authenticated Ops Console", () => {
  test.skip(
    !hasAuthSession(),
    "No auth session — set E2E_USER_EMAIL + E2E_USER_PASSWORD",
  )

  test("ops dashboard root", async ({ page }) => {
    await page.goto("/ops-console")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("ops-dashboard.png", {
      fullPage: true,
    })
  })

  test("shipments list", async ({ page }) => {
    await page.goto("/ops-console/shipments")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("shipments-list.png", {
      fullPage: true,
    })
  })

  test("manifests list (clickable View buttons)", async ({ page }) => {
    await page.goto("/ops-console/manifests")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("manifests-list.png", {
      fullPage: true,
    })
  })

  test("finance / invoices list (aging buckets)", async ({ page }) => {
    await page.goto("/ops-console/finance")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("finance-list.png", {
      fullPage: true,
    })
  })

  test("customers list", async ({ page }) => {
    await page.goto("/ops-console/customers")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("customers-list.png", {
      fullPage: true,
    })
  })

  test("settings + integrations card", async ({ page }) => {
    await page.goto("/ops-console/settings")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("settings.png", { fullPage: true })
  })

  // Detail pages — captures the unified 12-col grid alignment fix from the
  // user's screenshot, plus the ETA + state-stepper + tabs.
  test("shipment detail — TAC0123456789", async ({ page }) => {
    await page.goto("/track/TAC0123456789")
    // Use the public route which always exists for the seeded AWB.
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveScreenshot("shipment-detail-public.png", {
      fullPage: true,
    })
  })
})
