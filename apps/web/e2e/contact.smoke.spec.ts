import { test, expect } from "@playwright/test"

/**
 * Smoke tests for /contact (PL-4).
 *
 * Validates the customer-journey terminator for sales-led B2B (OD-P1) —
 * the form renders, the honeypot is offscreen-hidden, the submit button
 * is reachable. Submission validation lives in the service unit tests
 * (packages/services/src/__tests__/contact-lead.service.test.ts).
 */

test.describe("/contact", () => {
  test("renders the contact form with all required fields", async ({ page }) => {
    await page.goto("/contact")

    await expect(page.getByRole("heading", { name: /talk to a human/i })).toBeVisible()
    await expect(page.getByLabel(/your name/i)).toBeVisible()
    await expect(page.getByLabel(/work email/i)).toBeVisible()
    await expect(page.getByLabel(/message/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /send message/i })).toBeVisible()
  })

  test("the honeypot input is rendered but visually hidden (sr-only)", async ({ page }) => {
    await page.goto("/contact")

    // The honeypot field exists in the DOM (so bots populate it) but is
    // wrapped in sr-only — invisible to humans + screen-readers as a
    // visible field. The wrapping div carries aria-hidden=true.
    const honeypot = page.locator('input[name="website"]')
    await expect(honeypot).toHaveCount(1)
    // Not visible to sighted users:
    await expect(honeypot).not.toBeInViewport()
  })

  test("public contact info (phone, email, HQ) is shown", async ({ page }) => {
    await page.goto("/contact")

    await expect(page.getByText(/\+91 385 244 6500/)).toBeVisible()
    await expect(page.getByText(/hello@tacexpress\.com/)).toBeVisible()
    await expect(page.getByText(/Imphal, Manipur, India/)).toBeVisible()
  })
})
