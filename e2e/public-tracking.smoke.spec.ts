import { test, expect } from "@playwright/test"

/**
 * Smoke tests for the public tracking flow. These rely only on routes that
 * don't require authentication, so they can run against preview deploys
 * before any auth seeding.
 */

test.describe("Public tracking", () => {
  test("renders the search form with valid CN", async ({ page }) => {
    await page.goto("/track")
    await expect(
      page.getByRole("heading", { name: /track or book/i })
    ).toBeVisible()

    const input = page.getByLabel(/cn number/i)
    await input.fill("TAC1234567890")

    const submit = page.getByRole("button", { name: /track/i })
    await expect(submit).toBeEnabled()
  })

  test("rejects invalid CN format", async ({ page }) => {
    await page.goto("/track")
    const input = page.getByLabel(/cn number/i)
    await input.fill("INVALID")

    const submit = page.getByRole("button", { name: /track/i })
    await expect(submit).toBeDisabled()
  })

  test("opens the booking tab", async ({ page }) => {
    await page.goto("/track")
    await page.getByRole("tab", { name: /book/i }).click()
    await expect(
      page.getByLabel(/whatsapp number/i)
    ).toBeVisible()
  })
})
