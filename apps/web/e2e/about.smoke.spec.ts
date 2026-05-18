import { test, expect } from "@playwright/test"

/**
 * Smoke tests for /about (PL-4 carve coverage).
 * Runs at smoke-desktop / smoke-mobile / smoke-tablet from playwright.config.ts.
 */

test.describe("/about", () => {
  test("renders the hero + principles sections", async ({ page }) => {
    await page.goto("/about")

    await expect(
      page.getByRole("heading", { name: /built for the routes nobody else maps/i }),
    ).toBeVisible()

    // Stats grid is the second section; values come from a static array.
    await expect(page.getByText(/hubs operated/i)).toBeVisible()
    await expect(page.getByText(/avg\. transit/i)).toBeVisible()
  })

})
