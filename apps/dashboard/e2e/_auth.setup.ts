import { test as setup, expect } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"

/**
 * Setup that runs before every project. Two responsibilities:
 *
 *   1. Force the app into LIGHT theme (the Warm Linen palette we designed
 *      a11y against). next-themes' defaultTheme is "dark" in providers.tsx,
 *      so without this seed every Playwright run audits the dark palette,
 *      which is correct-but-different from the surface operators see by
 *      default after picking "C" on the C/M/S toggle.
 *
 *   2. If E2E_USER_EMAIL + E2E_USER_PASSWORD are set, sign in via the
 *      sign-in form so subsequent specs reuse the authenticated session.
 *      If not set, writes a "theme-only" storage state — protected-route
 *      specs detect that and skip.
 */
const STORAGE = path.join(process.cwd(), "e2e/.auth/operator.json")

setup("authenticate + seed light theme", async ({ page, context }) => {
  // Seed the localStorage key before any page navigation so the first SSR
  // hydration sees "light" and doesn't flash dark.
  await context.addInitScript(() => {
    try {
      window.localStorage.setItem("theme", "light")
    } catch {
      /* localStorage unavailable — ignore */
    }
  })

  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD

  if (!email || !password) {
    console.warn(
      "[e2e/_auth.setup] E2E_USER_EMAIL / E2E_USER_PASSWORD not set — " +
        "skipping sign-in. Protected-route tests will be skipped.",
    )
    // Still navigate once so the addInitScript fires and the cookie/storage
    // state captures the theme preference for downstream tests.
    await page.goto("/sign-in")
    await page.evaluate(() => window.localStorage.setItem("theme", "light"))
    fs.mkdirSync(path.dirname(STORAGE), { recursive: true })
    await page.context().storageState({ path: STORAGE })
    return
  }

  await page.goto("/sign-in")
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole("button", { name: /sign in/i }).click()
  await page.waitForURL(/\/ops-console/, { timeout: 15000 })
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 10000,
  })
  await page.context().storageState({ path: STORAGE })
})
