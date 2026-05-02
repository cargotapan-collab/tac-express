import { test, expect } from "@playwright/test"

/**
 * Visual regression for the public tracking page. Snapshots are stored under
 * `__screenshots__/` next to this file and committed to the repo. The
 * project profile in `playwright.config.ts` runs this in both light and
 * dark color schemes — diffs surface in the Playwright HTML report.
 */

test.describe("visual · public tracking", () => {
  test("track index", async ({ page }, testInfo) => {
    await page.goto("/track")
    // Wait for fonts + the input field's autoFocus settle so the cursor
    // doesn't introduce subpixel jitter in the snapshot.
    await page.waitForLoadState("networkidle")
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveScreenshot(
      `track-${testInfo.project.name}.png`,
      { fullPage: true }
    )
  })

  test("track index — book tab", async ({ page }, testInfo) => {
    await page.goto("/track")
    await page.getByRole("tab", { name: /book/i }).click()
    await page.waitForLoadState("networkidle")
    await page.evaluate(() => document.fonts.ready)
    await expect(page).toHaveScreenshot(
      `track-book-${testInfo.project.name}.png`,
      { fullPage: true }
    )
  })
})
