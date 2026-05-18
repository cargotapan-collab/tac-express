import { test, expect } from "@playwright/test"

/**
 * PL-3 mobile-overflow check — runs across the 9-page MVP carve at every
 * viewport project (smoke-desktop, smoke-mobile=375w, smoke-tablet=768w).
 *
 * Catches the load-bearing PL-3 failure mode: any page that overflows its
 * viewport horizontally at 375w or 768w is unreachable on a phone — the
 * customer hits a horizontal scroll and bounces. This spec is the gate.
 *
 * Existing per-page smoke specs already cover element-level assertions
 * (form fields visible, CTAs reachable). This file is the **single
 * horizontal-overflow check per page** that's the simplest possible
 * mobile-correctness assertion.
 */

const CARVE = [
  { path: "/", label: "landing" },
  { path: "/about", label: "about" },
  { path: "/pricing", label: "pricing" },
  { path: "/contact", label: "contact" },
  { path: "/quote", label: "quote" },
  { path: "/legal/cookies", label: "legal-cookies" },
  { path: "/legal/privacy", label: "legal-privacy" },
  { path: "/legal/terms", label: "legal-terms" },
  { path: "/track/TAC0000000000", label: "track-awb" },
] as const

test.describe("MVP carve — no horizontal overflow at any viewport", () => {
  for (const { path, label } of CARVE) {
    test(`${label} (${path})`, async ({ page }) => {
      await page.goto(path)
      // domcontentloaded is enough — networkidle can hang on dev-server HMR
      // / WebSocket pings that don't actually represent in-progress fetches.
      await page.waitForLoadState("domcontentloaded")

      const documentScrollWidth = await page.evaluate(
        () => document.documentElement.scrollWidth,
      )
      const viewportWidth = page.viewportSize()?.width ?? 1280

      // 1px tolerance for sub-pixel rounding. Anything beyond that is a
      // real overflow.
      expect(
        documentScrollWidth,
        `${label} (${path}) overflows: scrollWidth=${documentScrollWidth}, viewportWidth=${viewportWidth}`,
      ).toBeLessThanOrEqual(viewportWidth + 1)
    })
  }
})
