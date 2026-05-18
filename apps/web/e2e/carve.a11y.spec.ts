import { test, expect, type Page } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * Accessibility audit — axe-core scan per page against WCAG 2.1 AA.
 *
 * Mirrors the apps/dashboard/e2e/a11y.spec.ts pattern: reports any
 * serious/critical violation. Fail-on-violation is OFF by default — first
 * runs typically surface pre-existing issues that the team triages before
 * gating. Set AXE_FAIL_ON_VIOLATIONS=1 to make them blocking.
 *
 * Runs at a11y-desktop / a11y-mobile / a11y-tablet (see playwright.config.ts).
 */

const SHOULD_FAIL =
  process.env.AXE_FAIL_ON_VIOLATIONS === "1" ||
  process.env.AXE_FAIL_ON_VIOLATIONS === "true"

function axe(page: Page) {
  return new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
    "best-practice",
  ])
}

async function auditPage(page: Page, url: string, label: string) {
  await page.goto(url)
  // domcontentloaded is enough — networkidle can hang on dev-server HMR.
  await page.waitForLoadState("domcontentloaded")
  const results = await axe(page).analyze()
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  )
  console.log(
    `[a11y] ${label} → ${results.violations.length} total violations (${blocking.length} serious/critical)`,
  )
  for (const v of blocking) {
    console.log(
      `  · [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"})`,
    )
    for (const node of v.nodes.slice(0, 4)) {
      console.log(`      target: ${node.target.join(" ")}`)
      console.log(
        `      summary: ${node.failureSummary?.replace(/\s+/g, " ").slice(0, 200) ?? "—"}`,
      )
    }
  }
  if (SHOULD_FAIL && blocking.length > 0) {
    expect(blocking, `A11y violations on ${label}`).toEqual([])
  }
}

/**
 * The 9-page MVP carve per OD-P5:
 *   landing · about · pricing · contact · quote · legal × 3 · track-as-static-shape.
 *
 * `/track/[awb]` is dynamic-only — there is no static index page in
 * apps/web. We seed an AWB form value to exercise the route shape;
 * the lookup may 404 against an unknown AWB but the page-level a11y
 * scan still runs against the rendered error/not-found surface.
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

test.describe("MVP carve — a11y (WCAG 2.1 AA + best-practice)", () => {
  for (const { path, label } of CARVE) {
    test(`${label} (${path})`, async ({ page }) => {
      await auditPage(page, path, label)
    })
  }
})
