import { test, expect } from "@playwright/test"

/**
 * Smoke tests for the public landing page (PL-4).
 *
 * Runs in two projects defined in apps/web/playwright.config.ts:
 *   - smoke-desktop: Desktop Chrome default viewport.
 *   - smoke-mobile:  375×812 (the OD-P6 mobile-critical width).
 *
 * The mobile project is the load-bearing one for PL-3 — if the CTA row
 * regresses to overflow / hidden / off-screen at 375w, this spec fails.
 */

test.describe("Landing page", () => {
  test("the AWB tracker form is reachable + has a submit button", async ({ page }) => {
    await page.goto("/")

    // AWB input is the hero's primary action — it must be reachable by
    // both keyboard + screen-reader users (the sr-only label is the
    // accessible name).
    const awbInput = page.getByLabel(/AWB or cargo ID/i)
    await expect(awbInput).toBeVisible()
    await expect(awbInput).toBeEnabled()

    // The LOCATE button is the form's submit.
    const locate = page.getByRole("button", { name: /locate/i })
    await expect(locate).toBeVisible()
  })

  test("the secondary sales CTA row offers GET A QUOTE + CONTACT SALES (PL-2a/PL-3)", async ({
    page,
  }) => {
    await page.goto("/")

    // Both links exist as accessible role="link" elements via Button asChild.
    const quote = page.getByRole("link", { name: /get a quote/i })
    const contact = page.getByRole("link", { name: /contact sales/i })

    await expect(quote).toBeVisible()
    await expect(quote).toHaveAttribute("href", "/quote")

    await expect(contact).toBeVisible()
    await expect(contact).toHaveAttribute("href", "/contact")
  })

  test("the JSON-LD schema.org/Organization payload is present (PL-1 closeout)", async ({
    page,
  }) => {
    await page.goto("/")

    // The landing renders an inline <script type="application/ld+json">
    // with the Organization shape; PR #165 added it. Verify the script
    // exists + parses + has the right @type.
    const script = page.locator('script[type="application/ld+json"]')
    await expect(script).toHaveCount(1)

    const payload = await script.textContent()
    expect(payload).toBeTruthy()
    const parsed = JSON.parse(payload!) as { "@type"?: string; name?: string }
    expect(parsed["@type"]).toBe("Organization")
    expect(parsed.name).toBe("TAC Express")
  })

  test("clicking GET A QUOTE routes to the /quote page", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /get a quote/i }).click()
    await expect(page).toHaveURL(/\/quote/)
  })

  test("clicking CONTACT SALES routes to the /contact page", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /contact sales/i }).click()
    await expect(page).toHaveURL(/\/contact/)
  })
})
