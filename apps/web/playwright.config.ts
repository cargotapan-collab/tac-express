import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright config for apps/web (PL-4).
 *
 * The root playwright.config.ts targets apps/dashboard on port 3001. This
 * config is the parallel surface for apps/web (port 3000) — the public
 * marketing + customer-journey site. It runs the same three suite shape
 * (smoke / a11y / visual) at both desktop AND mobile viewports per
 * OD-P6 (375w + 768w).
 *
 * The split keeps the two app surfaces independently deployable + the
 * CI workflows independently scope-able. CI integration for this config
 * is filed as a follow-up; locally runnable via
 *
 *   pnpm --filter web e2e
 *
 * Test files live in `apps/web/e2e/` matching `*.smoke.spec.ts`,
 * `*.a11y.spec.ts`, or `*.visual.spec.ts` so the existing testMatch
 * patterns from the dashboard config carry over verbatim.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60 * 1000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
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
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    actionTimeout: 0,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  // Six projects — three suites × two viewport classes. The mobile project
  // catches PL-3-class regressions (overflow / unclickable CTAs at 375w);
  // the desktop project catches the everyday wide-screen layout.
  projects: [
    {
      name: "smoke-desktop",
      testMatch: /.*\.smoke\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "smoke-mobile",
      testMatch: /.*\.smoke\.spec\.ts$/,
      use: {
        ...devices["Pixel 7"],
        // Pixel 7's device profile is 412×915. OD-P6 = 375w + 768w;
        // explicit viewport overrides the device default so this project
        // actually exercises the small-phone breakpoint.
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: "smoke-tablet",
      testMatch: /.*\.smoke\.spec\.ts$/,
      use: {
        ...devices["iPad (gen 7)"],
        // OD-P6's tablet breakpoint is 768w. Same override pattern as
        // mobile so the tablet project pins the launch-critical width.
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "a11y-desktop",
      testMatch: /.*\.a11y\.spec\.ts$/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "a11y-mobile",
      testMatch: /.*\.a11y\.spec\.ts$/,
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 375, height: 812 },
      },
    },
    {
      name: "a11y-tablet",
      testMatch: /.*\.a11y\.spec\.ts$/,
      use: {
        ...devices["iPad (gen 7)"],
        viewport: { width: 768, height: 1024 },
      },
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

  // Boot the web dev server when no PLAYWRIGHT_BASE_URL is set (i.e. local
  // run). CI is expected to deploy to a preview URL and set the env var,
  // skipping the webServer block.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm --filter web dev",
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
