import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * axe-core accessibility scans on the public surfaces. These pages must be
 * usable with assistive tech and meet WCAG 2.1 AA at minimum.
 *
 * The check focuses on critical/serious impact — minor issues in marketing
 * surfaces are allowed but logged to the Playwright report for triage.
 */

test.describe("a11y · public", () => {
  test("/ track index has no critical violations", async ({ page }) => {
    await page.goto("/track")
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()

    const critical = results.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? "")
    )

    if (critical.length > 0) {
      console.log(
        "axe critical violations:",
        JSON.stringify(critical, null, 2)
      )
    }
    expect(critical, "no critical/serious axe violations").toEqual([])
  })

  test("/ track booking form has no critical violations", async ({ page }) => {
    await page.goto("/track")
    await page.getByRole("tab", { name: /book/i }).click()

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze()

    const critical = results.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? "")
    )
    expect(critical, "no critical/serious axe violations").toEqual([])
  })
})
