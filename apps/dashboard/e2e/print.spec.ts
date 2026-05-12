import { test, expect } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"

/**
 * Visual regression baselines for the four print routes (issue #17).
 *
 * Print views were explicitly called out in PR #8 as a layout-risk
 * surface: a 3am Tailwind upgrade or a globals.css token rename can
 * silently break a label that scans correctly today. Manual checkboxes
 * miss that class of regression — pixel diffs catch it.
 *
 * Routes covered:
 *   - /print/invoice/<id>        — full invoice document
 *   - /print/invoice-label/<id>  — combined invoice + label (the new
 *                                  variant from PR #45)
 *   - /print/label/<awb>         — shipping label with real Code 128 +
 *                                  Data Matrix barcodes
 *   - /print/manifest/<id>       — manifest cover sheet + line items
 *
 * All four routes are authenticated (server services use the cookie
 * store) and the seed file does NOT pre-create invoices/manifests, so
 * the spec is parameterized by env vars and skips when they're unset:
 *
 *   E2E_INVOICE_ID         UUID of a seeded invoice
 *   E2E_AWB                AWB string of a seeded shipment (e.g. TAC0123456789)
 *   E2E_MANIFEST_ID        UUID of a seeded manifest
 *
 * Once these are set on a CI environment (or locally), the snapshots
 * regenerate via `pnpm test:visual:update` and become the baseline.
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

const INVOICE_ID = process.env.E2E_INVOICE_ID
const AWB = process.env.E2E_AWB
const MANIFEST_ID = process.env.E2E_MANIFEST_ID

test.describe("Print routes — visual baselines (issue #17)", () => {
  test.skip(
    !hasAuthSession(),
    "No auth session — set E2E_USER_EMAIL + E2E_USER_PASSWORD",
  )

  test("invoice print view", async ({ page }) => {
    test.skip(!INVOICE_ID, "E2E_INVOICE_ID not set — skipping invoice print baseline")
    await page.goto(`/print/invoice/${INVOICE_ID}?print=1`)
    await page.waitForLoadState("networkidle")
    // Wait for any barcode SVGs to render so the snapshot is stable.
    await page.waitForSelector("[data-print-target]", { timeout: 5000 }).catch(() => {})
    await expect(page).toHaveScreenshot("print-invoice.png", {
      fullPage: true,
      // Print fidelity demands tighter tolerance than dashboard surfaces.
      maxDiffPixelRatio: 0.001,
    })
  })

  test("invoice-label combined print view", async ({ page }) => {
    test.skip(!INVOICE_ID, "E2E_INVOICE_ID not set — skipping invoice-label baseline")
    await page.goto(`/print/invoice-label/${INVOICE_ID}?print=1`)
    await page.waitForLoadState("networkidle")
    await page.waitForSelector("[data-print-target]", { timeout: 5000 }).catch(() => {})
    await expect(page).toHaveScreenshot("print-invoice-label.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.001,
    })
  })

  test("shipping label print view", async ({ page }) => {
    test.skip(!AWB, "E2E_AWB not set — skipping label print baseline")
    await page.goto(`/print/label/${AWB}?print=1`)
    await page.waitForLoadState("networkidle")
    await page.waitForSelector("[data-print-target]", { timeout: 5000 }).catch(() => {})
    await expect(page).toHaveScreenshot("print-label.png", {
      fullPage: true,
      // Barcode rendering is the most fragile part — keep this tight.
      maxDiffPixelRatio: 0.001,
    })
  })

  test("manifest print view", async ({ page }) => {
    test.skip(!MANIFEST_ID, "E2E_MANIFEST_ID not set — skipping manifest print baseline")
    await page.goto(`/print/manifest/${MANIFEST_ID}?print=1`)
    await page.waitForLoadState("networkidle")
    await page.waitForSelector("[data-print-target]", { timeout: 5000 }).catch(() => {})
    await expect(page).toHaveScreenshot("print-manifest.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.001,
    })
  })
})
