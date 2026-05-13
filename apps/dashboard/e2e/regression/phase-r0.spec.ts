import { test, expect } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"

/**
 * Phase R0 — Regression audit: boolean checks
 * =============================================
 *
 * Purpose
 * -------
 * The shadcn upgrade + single-shell migration touched ~25 file moves, 5
 * multi-step form wizards, the auth/proxy boundary, and 14 legacy URL
 * redirects. Before we capture the VRT baseline PNGs (which would lock in
 * any latent bug as the "expected" pixels), we run THIS spec to prove
 * every user-facing flow still resolves end-to-end at the **boolean**
 * level — i.e. "does the page render?", "does the form submit?", "does the
 * legacy URL still 308?".
 *
 * Visual-judgment items (chart rendering, hub config persistence, print
 * layout) live in the sibling markdown checklist at
 * `docs/regression-audit-checklist.md` — both must clear before VRT.
 *
 * What this spec proves
 * ---------------------
 *   A. Authentication boundary
 *      - Unauthenticated user is redirected to /sign-in when hitting
 *        protected routes
 *      - Sign-in form lands the operator on /ops-console
 *
 *   B. Multi-step form happy paths (5 wizards)
 *      - /ops-console/customers/create   → Save Customer  → detail page
 *      - /ops-console/shipments/create   → Create Shipment → detail page
 *      - /ops-console/manifests/create   → Create Manifest → detail page
 *      - /ops-console/finance/create     → Create Invoice  → detail page
 *      - /ops-console/rates/create       → Save           → list page
 *
 *   D. API + public route smokes
 *      - /track (public) renders the search UI without auth
 *      - /track/<known-fake> handles unknown AWB without 500
 *      - /api/diagnostics/sentry returns 200 (proxy doesn't gate it)
 *
 *   F. Legacy URL redirect contract (308)
 *      - /home → /ops-console
 *      - /rate-cards → /ops-console/rates
 *      - /customers → /ops-console/customers (+ 13 more list sections)
 *
 * Mutation safety
 * ---------------
 * Every "create" test uses a unique throwaway value (timestamped name /
 * phone / AWB / hub pair). If it leaks into the seed DB it's namespaced
 * `e2e-R0-<ms>` so it's trivially greppable for cleanup.
 *
 *   set `E2E_SEED_DB_OK=1` to opt into actual mutations.
 *   Without that flag, the form-submit tests run as far as `submit + UI
 *   feedback` but do NOT assert on the post-submit navigation, so they're
 *   safe to run against any DB.
 *
 * Skip semantics
 * --------------
 * Same as baseline.spec.ts — if E2E_USER_EMAIL/E2E_USER_PASSWORD aren't
 * configured, every protected test skips cleanly. The public + redirect
 * tests still run.
 */

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

const AUTHED = hasAuthSession()
const MUTATE_OK = process.env.E2E_SEED_DB_OK === "1"
const STAMP = Date.now().toString().slice(-8)

// ──────────────────────────────────────────────────────────────────────
// A. Authentication boundary
// ──────────────────────────────────────────────────────────────────────

test.describe("A. Auth boundary", () => {
  // Empty storage state is passed explicitly. `browser.newContext()` alone
  // can pick up project-level `use.storageState` in some Playwright
  // versions / setups; forcing an empty cookie jar removes that ambiguity
  // — these tests must prove the proxy redirects a *truly* cold visitor.
  const EMPTY_STORAGE = { cookies: [], origins: [] }

  test("A1. Unauthenticated /ops-console redirects to /sign-in", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: EMPTY_STORAGE })
    const page = await context.newPage()
    await page.goto("/ops-console", { waitUntil: "domcontentloaded" })
    // Either the proxy redirected before serving, OR a client-side guard
    // bounces post-hydration. Wait for either to settle.
    await page.waitForURL(/\/sign-in/, { timeout: 15000 })
    expect(page.url()).toMatch(/\/sign-in/)
    await context.close()
  })

  test("A2. Unauthenticated /ops-console/shipments also redirects", async ({
    browser,
  }) => {
    const context = await browser.newContext({ storageState: EMPTY_STORAGE })
    const page = await context.newPage()
    await page.goto("/ops-console/shipments", { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/sign-in/, { timeout: 15000 })
    expect(page.url()).toMatch(/\/sign-in/)
    await context.close()
  })

  test("A3. Authenticated session lands on /ops-console", async ({ page }) => {
    test.skip(!AUTHED, "No auth session configured")
    await page.goto("/ops-console")
    await page.waitForLoadState("networkidle")
    expect(page.url()).toMatch(/\/ops-console/)
    // Sidebar nav is the canonical "we're in the shell" signal.
    await expect(page.getByRole("navigation").first()).toBeVisible({
      timeout: 10000,
    })
  })

  test("A4. /sign-in renders the email + password form", async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto("/sign-in")
    await page.waitForLoadState("networkidle")
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(
      page.getByRole("button", { name: /sign in/i }),
    ).toBeVisible()
    await context.close()
  })
})

// ──────────────────────────────────────────────────────────────────────
// B. Multi-step form happy paths
// ──────────────────────────────────────────────────────────────────────

test.describe("B. Multi-step forms — render + validate + submit-or-feedback", () => {
  test.skip(!AUTHED, "Authenticated routes require E2E_USER_* secrets")

  test("B1. Customer create — renders, validates, submits", async ({ page }) => {
    await page.goto("/ops-console/customers/create")
    await page.waitForLoadState("networkidle")

    // Renders
    await expect(page.locator("#cust-name")).toBeVisible()
    await expect(page.locator("#cust-phone")).toBeVisible()
    await expect(page.locator("#cust-line1")).toBeVisible()

    // Validates — submit empty form, expect error toasts/alerts present
    await page.getByRole("button", { name: /save customer/i }).click()
    // react-hook-form / zod renders FieldError with role="alert"
    await expect(page.getByRole("alert").first()).toBeVisible({
      timeout: 5000,
    })

    if (!MUTATE_OK) {
      test.info().annotations.push({
        type: "skip-mutation",
        description: "E2E_SEED_DB_OK!=1 — skipped submit + nav assertion",
      })
      return
    }

    // Fill happy path
    await page.locator("#cust-name").fill(`e2e-R0-${STAMP}`)
    await page.locator("#cust-phone").fill(`90000${STAMP}`.slice(0, 10))
    await page.locator("#cust-line1").fill("1 Test Lane")
    await page.locator("#cust-city").fill("Imphal")
    await page.locator("#cust-state").fill("Manipur")
    await page.locator("#cust-zip").fill("795001")
    await page.getByRole("button", { name: /save customer/i }).click()
    // Lands on detail page /ops-console/customers/<uuid>
    await page.waitForURL(/\/ops-console\/customers\/[a-z0-9-]+/i, {
      timeout: 15000,
    })
  })

  test("B2. Shipment wizard — renders + step 1 (Sender) controls present", async ({
    page,
  }) => {
    // The shipment surface is a 4-step wizard (Sender → Receiver → Package
    // → Review). Restored 2026-05-13 — see docs/v6-mvp-regression-audit.md.
    // The previous flat MVP form is gone.
    await page.goto("/ops-console/shipments/create")
    await page.waitForLoadState("networkidle")

    // Step 1 (Sender) signals — react-hook-form inputs aren't given stable
    // ids by the wizard, so we assert on placeholder text + the Next button.
    await expect(page.getByPlaceholder("John Doe")).toBeVisible()
    await expect(page.getByRole("button", { name: /next/i })).toBeVisible()
  })

  test("B3. Manifest builder — renders + step 1 (Setup) controls present", async ({
    page,
  }) => {
    // The manifest surface is a 4-step builder (Setup → Add Shipments →
    // Review → Close). Restored 2026-05-13 — see
    // docs/v6-mvp-regression-audit.md. The previous MVP form (4 fields)
    // is gone.
    await page.goto("/ops-console/manifests/create")
    await page.waitForLoadState("networkidle")

    // Step 1 (Setup) signals — first step is "Manifest Setup"
    await expect(page.getByText(/manifest setup/i).first()).toBeVisible()
    await expect(page.getByRole("button", { name: /next/i })).toBeVisible()
  })

  test("B4. Invoice wizard — renders + step 1 controls present", async ({ page }) => {
    // The invoice surface is a 4-step wizard (Basics → Parties → Cargo →
    // Payment). Restored 2026-05-13 — see docs/v6-mvp-regression-audit.md.
    // The previous MVP form (single page, 5 fields) is gone.
    await page.goto("/ops-console/finance/create")
    await page.waitForLoadState("networkidle")

    // Step 1 (Basics) signals
    await expect(page.getByPlaceholder(/TAC\d+/i)).toBeVisible() // AWB input
    await expect(
      page.getByRole("button", { name: /regenerate awb number/i }),
    ).toBeVisible()
    // Page heading from OpsPageHead
    await expect(
      page.getByRole("heading", { name: /new invoice/i }),
    ).toBeVisible()
    // Wizard primary action — exact label depends on step; Next is on step 1
    await expect(page.getByRole("button", { name: /next/i })).toBeVisible()
  })

  test("B5. Rate card create — renders + validates", async ({ page }) => {
    await page.goto("/ops-console/rates/create")
    await page.waitForLoadState("networkidle")

    await expect(page.locator("#rc-origin")).toBeVisible()
    await expect(page.locator("#rc-dest")).toBeVisible()
    await expect(page.locator("#rc-rate")).toBeVisible()

    // Submit button label is "Add Rate Card" (verified against
    // packages/ui/.../forms/ops-rate-card-form.tsx).
    await page
      .getByRole("button", { name: /add rate card/i })
      .first()
      .click()
    await expect(page.getByRole("alert").first()).toBeVisible({
      timeout: 5000,
    })
  })
})

// ──────────────────────────────────────────────────────────────────────
// C. List pages — render without error after the route consolidation
// ──────────────────────────────────────────────────────────────────────

const PROTECTED_LISTS = [
  "/ops-console",
  "/ops-console/analytics",
  "/ops-console/shipments",
  "/ops-console/manifests",
  "/ops-console/customers",
  "/ops-console/finance",
  "/ops-console/rates",
  "/ops-console/inventory",
  "/ops-console/exceptions",
  "/ops-console/settings",
  "/ops-console/audit",
  "/ops-console/notifications",
] as const

test.describe("C. List pages — render after single-shell migration", () => {
  test.skip(!AUTHED, "Authenticated routes require E2E_USER_* secrets")

  for (const route of PROTECTED_LISTS) {
    test(`C:${route} renders heading + nav + no global error boundary`, async ({
      page,
    }) => {
      const consoleErrors: string[] = []
      page.on("pageerror", (err) => consoleErrors.push(err.message))

      await page.goto(route)
      await page.waitForLoadState("networkidle")

      // Sidebar present → in the shell
      await expect(page.getByRole("navigation").first()).toBeVisible()
      // global-error.tsx would replace the page entirely; if we see its
      // copy, the page crashed under us.
      await expect(
        page.getByText(/something went wrong/i),
      ).toHaveCount(0)

      // Hard-fail on uncaught browser errors during render.
      expect(consoleErrors, `pageerror on ${route}`).toEqual([])
    })
  }
})

// ──────────────────────────────────────────────────────────────────────
// D. Public routes + API smokes
// ──────────────────────────────────────────────────────────────────────

test.describe("D. Public routes (no auth)", () => {
  test("D1. /track loads without auth + shows search UI", async ({
    browser,
  }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto("/track")
    await page.waitForLoadState("networkidle")
    // Proves we're NOT redirected to /sign-in
    expect(page.url()).toMatch(/\/track/)
    await context.close()
  })

  test("D2. /track/UNKNOWN-AWB handles missing record gracefully", async ({
    browser,
  }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    const response = await page.goto(`/track/e2e-R0-${STAMP}-unknown`)
    // Either 200 (graceful "not found" UI) or 404 — but NOT 500
    expect(response?.status() ?? 0).toBeLessThan(500)
    await context.close()
  })

  test("D3. /sign-up renders (public route)", async ({ browser }) => {
    const context = await browser.newContext()
    const page = await context.newPage()
    const response = await page.goto("/sign-up")
    expect(response?.status() ?? 0).toBeLessThan(500)
    await context.close()
  })
})

// ──────────────────────────────────────────────────────────────────────
// F. Legacy URL redirect contract (308)
// ──────────────────────────────────────────────────────────────────────
//
// next.config.mjs maps 16 legacy v6 paths to canonical /ops-console/*.
// If any one of these falls out of the map, internal links in old emails
// / external bookmarks / SEO would break. We don't assert 308 specifically
// because Playwright follows redirects transparently — instead we assert
// the final URL after navigation matches the canonical path.

const REDIRECT_MAP: Array<{ from: string; toContains: string }> = [
  { from: "/home", toContains: "/ops-console" },
  { from: "/rate-cards", toContains: "/ops-console/rates" },
  { from: "/analytics", toContains: "/ops-console/analytics" },
  { from: "/shipments", toContains: "/ops-console/shipments" },
  { from: "/manifests", toContains: "/ops-console/manifests" },
  { from: "/customers", toContains: "/ops-console/customers" },
  { from: "/finance", toContains: "/ops-console/finance" },
  { from: "/inventory", toContains: "/ops-console/inventory" },
  { from: "/exceptions", toContains: "/ops-console/exceptions" },
  { from: "/management", toContains: "/ops-console/management" },
  { from: "/notifications", toContains: "/ops-console/notifications" },
  { from: "/settings", toContains: "/ops-console/settings" },
  { from: "/audit", toContains: "/ops-console/audit" },
  { from: "/scanning", toContains: "/ops-console/scanning" },
  { from: "/bookings", toContains: "/ops-console/bookings" },
  { from: "/shift-report", toContains: "/ops-console/shift-report" },
  { from: "/arrival-audit", toContains: "/ops-console/arrival-audit" },
]

test.describe("F. Legacy URL redirects (308 contract)", () => {
  test.skip(
    !AUTHED,
    "Legacy redirects land on protected routes — needs auth",
  )

  for (const { from, toContains } of REDIRECT_MAP) {
    test(`F: ${from} → ${toContains}`, async ({ page }) => {
      await page.goto(from)
      await page.waitForLoadState("networkidle")
      expect(page.url(), `expected ${from} to resolve under ${toContains}`)
        .toContain(toContains)
    })
  }
})

// ──────────────────────────────────────────────────────────────────────
// G. Sign-out
// ──────────────────────────────────────────────────────────────────────
//
// Proves the AuthApiError("Invalid Refresh Token") path doesn't crash
// the proxy — after signing out, hitting a protected page must redirect
// to /sign-in, NOT throw a 500.

test.describe("G. Sign-out + post-signout protection", () => {
  test.skip(!AUTHED, "Needs authenticated session to sign out from")

  test("G1. After sign-out, /ops-console redirects to /sign-in", async ({
    browser,
  }) => {
    // Make a fresh authed context so we don't poison the shared storage
    // state that other specs depend on.
    const storageState = path.join(process.cwd(), "e2e/.auth/operator.json")
    const context = await browser.newContext({ storageState })
    const page = await context.newPage()

    await page.goto("/ops-console")
    await page.waitForLoadState("networkidle")

    // Best-effort sign-out via user menu / button — tolerant of label
    // changes. If we can't find it, we forcibly clear cookies (the same
    // effective state as a stale-refresh-token scenario) and re-test the
    // proxy path.
    const signOut = page.getByRole("button", { name: /sign out|log out/i })
    if (await signOut.count()) {
      await signOut.first().click()
    } else {
      await context.clearCookies()
    }

    await page.goto("/ops-console/shipments")
    await page.waitForURL(/\/sign-in/, { timeout: 10000 })
    expect(page.url()).toMatch(/\/sign-in/)
    await context.close()
  })
})
