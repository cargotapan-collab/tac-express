import { test, expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"
import fs from "node:fs"
import path from "node:path"

/**
 * Accessibility audit — axe-core scan per route against WCAG 2.1 AA.
 *
 * Reports any violation with severity ≥ serious (i.e. ignores "minor" which
 * is opinion/best-practice rather than a real accessibility failure).
 *
 * Fail-on-violation is OFF by default — first runs typically surface
 * pre-existing issues we want to triage before gating. Set
 * AXE_FAIL_ON_VIOLATIONS=1 in CI to make them blocking.
 */

const SHOULD_FAIL =
  process.env.AXE_FAIL_ON_VIOLATIONS === "1" ||
  process.env.AXE_FAIL_ON_VIOLATIONS === "true"

function hasAuthSession(): boolean {
  const storagePath = path.join(process.cwd(), "e2e/.auth/operator.json")
  try {
    const raw = JSON.parse(fs.readFileSync(storagePath, "utf-8")) as {
      cookies?: unknown[]
    }
    return Array.isArray(raw.cookies) && raw.cookies.length > 0
  } catch {
    return false
  }
}

/** Build the axe runner for a page. WCAG 2.1 AA + best-practices. */
function axe(page: import("@playwright/test").Page) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    // Disable rules that fight our zero-radius / hairline-border design system.
    // None of these compromise WCAG compliance — they only flag visual style
    // preferences (e.g. "interactive elements should have hover styles").
    .disableRules([])
}

async function auditPage(
  page: import("@playwright/test").Page,
  url: string,
  label: string,
) {
  await page.goto(url)
  await page.waitForLoadState("networkidle")
  const results = await axe(page).analyze()
  // serious + critical are real WCAG failures; minor + moderate are advisory.
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  )
  console.log(
    `[a11y] ${label} → ${results.violations.length} total violations (${blocking.length} serious/critical)`,
  )
  for (const v of blocking) {
    console.log(`  · [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? "" : "s"})`)
    // Surface the actual offending selector + summary so we can fix it.
    for (const node of v.nodes.slice(0, 4)) {
      console.log(`      target: ${node.target.join(" ")}`)
      console.log(`      summary: ${node.failureSummary?.replace(/\s+/g, " ").slice(0, 200) ?? "—"}`)
    }
  }
  if (SHOULD_FAIL && blocking.length > 0) {
    expect(blocking, `A11y violations on ${label}`).toEqual([])
  }
}

test.describe("Public surfaces — a11y", () => {
  test("sign-in page", async ({ page }) => {
    await auditPage(page, "/sign-in", "sign-in")
  })
  test("track entry", async ({ page }) => {
    await auditPage(page, "/track", "track-entry")
  })
  test("track AWB result", async ({ page }) => {
    await auditPage(page, "/track/TAC0123456789", "track-awb")
  })
})

test.describe("Authenticated Ops Console — a11y", () => {
  test.skip(
    !hasAuthSession(),
    "No auth session — set E2E_USER_EMAIL + E2E_USER_PASSWORD",
  )

  test("ops dashboard root", async ({ page }) => {
    await auditPage(page, "/ops-console", "ops-dashboard")
  })
  test("shipments list", async ({ page }) => {
    await auditPage(page, "/ops-console/shipments", "shipments-list")
  })
  test("manifests list", async ({ page }) => {
    await auditPage(page, "/ops-console/manifests", "manifests-list")
  })
  test("finance list", async ({ page }) => {
    await auditPage(page, "/ops-console/finance", "finance-list")
  })
  test("customers list", async ({ page }) => {
    await auditPage(page, "/ops-console/customers", "customers-list")
  })
  test("settings", async ({ page }) => {
    await auditPage(page, "/ops-console/settings", "settings")
  })
})
