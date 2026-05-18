import { test, expect } from "@playwright/test"

/**
 * Smoke tests for /pricing (PL-4 carve coverage).
 */

test.describe("/pricing", () => {
  test("renders the hero + three plan tiers", async ({ page }) => {
    await page.goto("/pricing")

    await expect(
      page.getByRole("heading", { name: /one rate card/i }),
    ).toBeVisible()
    // Three plan tier names from apps/web/app/(public)/pricing/page.tsx PLANS.
    // Each plan tile renders the name in a tac-mono-label `<p>`. `exact: true`
    // avoids matching adjacent copy like "Pricing scales with throughput".
    await expect(page.getByText("Starter", { exact: true })).toBeVisible()
    await expect(page.getByText("Growth", { exact: true })).toBeVisible()
    await expect(page.getByText("Scale", { exact: true })).toBeVisible()
  })

  test("the Growth plan CTA links to /contact?plan=growth", async ({ page }) => {
    await page.goto("/pricing")
    const trial = page.getByRole("link", { name: /start trial/i })
    await expect(trial).toBeVisible()
    await expect(trial).toHaveAttribute("href", "/contact?plan=growth")
  })
})
