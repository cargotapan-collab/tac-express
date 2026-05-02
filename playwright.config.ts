import { defineConfig, devices } from "@playwright/test"

/**
 * TAC Express Playwright config.
 *
 * Two project profiles:
 *  - "smoke" — fast public-route checks + axe-core a11y scans
 *  - "visual" — visual regression snapshots in light + dark themes
 *
 * Visual snapshots live next to the test file in `__screenshots__/`. CI
 * compares pixel diffs at threshold 0.2 — small font-rendering differences
 * are tolerated; structural changes fail.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60 * 1000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      // Allow up to 0.2% pixel mismatch — handles minor font-hinting variance
      // across Linux CI runners and local macOS dev machines.
      maxDiffPixelRatio: 0.002,
      animations: "disabled",
      caret: "hide",
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["html", { open: "never" }], ["github"]]
    : "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001",
    actionTimeout: 0,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "smoke",
      testMatch: /.*\.smoke\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "a11y",
      testMatch: /.*\.a11y\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "visual-light",
      testMatch: /.*\.visual\.spec\.ts$/,
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "light",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "visual-dark",
      testMatch: /.*\.visual\.spec\.ts$/,
      use: {
        ...devices["Desktop Chrome"],
        colorScheme: "dark",
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  // Run the dashboard locally for tests when no PLAYWRIGHT_BASE_URL is set.
  // CI typically deploys to a preview URL and sets PLAYWRIGHT_BASE_URL, in
  // which case this webServer block is skipped.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm --filter dashboard dev",
        port: 3001,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
