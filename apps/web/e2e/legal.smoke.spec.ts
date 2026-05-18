import { test, expect } from "@playwright/test"

/**
 * Smoke tests for the three legal pages (PL-4 carve coverage).
 * /legal/cookies · /legal/privacy · /legal/terms — all share the same
 * marketing-prose shape.
 */

const LEGAL_PAGES = [
  { path: "/legal/cookies", heading: /cookie/i },
  { path: "/legal/privacy", heading: /privacy/i },
  { path: "/legal/terms", heading: /terms/i },
] as const

for (const { path, heading } of LEGAL_PAGES) {
  test.describe(path, () => {
    test("renders the page with a top-level heading", async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
      // The heading copy mentions the legal-page topic.
      await expect(page.getByRole("heading").first()).toContainText(heading)
    })

  })
}
