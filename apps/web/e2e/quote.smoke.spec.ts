import { test, expect } from "@playwright/test"

/**
 * Smoke tests for /quote (PL-4).
 *
 * The rate calculator is a client-side compute (no POST). Spec verifies
 * the form renders + the calculate button produces an output panel.
 */

test.describe("/quote", () => {
  test("renders the rate-calculator form", async ({ page }) => {
    await page.goto("/quote")

    await expect(page.getByRole("heading", { name: /live freight rates/i })).toBeVisible()
    await expect(page.getByLabel(/origin hub/i)).toBeVisible()
    await expect(page.getByLabel(/destination hub/i)).toBeVisible()
    await expect(page.getByLabel(/chargeable weight/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /calculate rate/i })).toBeVisible()
  })

  test("clicking calculate produces an indicative rate panel", async ({ page }) => {
    await page.goto("/quote")
    // Explicitly fill weight so the test asserts the happy path rather
    // than relying on the form's default value (today: 5kg). Defaults
    // could change; this assertion shouldn't.
    await page.getByLabel(/chargeable weight/i).fill("5")
    await page.getByRole("button", { name: /calculate rate/i }).click()

    // The output panel labels the rate as "Indicative rate" + shows a
    // currency-formatted total. Both must be present.
    await expect(page.getByText(/indicative rate/i)).toBeVisible()
    await expect(page.locator("text=/₹[\\d,]+/").first()).toBeVisible()
  })
})
