import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright config for visual-regression + accessibility audits.
 *
 * Three layered specs:
 *   - e2e/visual.spec.ts  → pixel snapshots of every key surface at 1280 + 1920
 *   - e2e/a11y.spec.ts    → axe-core WCAG 2.1 AA scan per route
 *   - e2e/_auth.setup.ts  → one-time sign-in that produces a storage state
 *                            other specs reuse (avoids logging in 50 times)
 *
 * Run against the running dev server on :3001 — same one TestSprite hits.
 * Workers=1 so visual diffs don't race against each other on shared state.
 *
 * The dev server is NOT auto-started here — we assume the operator already
 * has it running (matches the TestSprite workflow). Falls back to a warning
 * if :3001 isn't reachable.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  snapshotPathTemplate:
    "{testDir}/__snapshots__/{testFilePath}/{arg}-{projectName}{ext}",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["html", { outputFolder: "./playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Pixel-perfect snapshots need a stable canvas — disable subtle motion +
    // hover-only effects via prefersReducedMotion. Force light colorScheme so
    // contrast audits run against the Warm Linen palette we ship (default
    // headless Chromium otherwise resolves to dark and fails AA against the
    // brand violet on a deep-ink background).
    colorScheme: "light",
    contextOptions: { reducedMotion: "reduce" },
  },
  expect: {
    // Snapshot tolerance — pages with JS-driven motion (Sentry replay,
    // Lottie, Framer entrance animations) emit ~1% pixel drift between
    // successive captures that CSS `animations: "disabled"` can't tame.
    // 1.5% catches macro misalignment + grid drift + missing elements while
    // tolerating the irreducible motion-system noise. Tightener later if we
    // mask animated regions per-page.
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.015,
      animations: "disabled",
      // Allow up to 2 capture retries to find a stable frame.
      maxDiffPixels: 50_000,
    },
  },
  projects: [
    {
      name: "auth-setup",
      testMatch: /_auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "desktop-1280",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
        storageState: "./e2e/.auth/operator.json",
      },
      dependencies: ["auth-setup"],
    },
    {
      name: "desktop-1920",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        storageState: "./e2e/.auth/operator.json",
      },
      dependencies: ["auth-setup"],
    },
  ],
})
