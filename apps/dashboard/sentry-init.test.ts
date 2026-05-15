import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Smoke test for the Sentry SDK initialization wiring. Verifies the
 * three things issue #22 asked us to verify:
 *   1. DSN is read from the right env vars (per-runtime contract)
 *   2. `environment` is read from SENTRY_ENV / NEXT_PUBLIC_SENTRY_ENV
 *      with NODE_ENV as a fallback
 *   3. `release` is read from SENTRY_RELEASE / NEXT_PUBLIC_SENTRY_RELEASE
 *
 * Why this test exists at all: the production failure mode is silent.
 * If `Sentry.init` doesn't fire (DSN unset), every `captureException`
 * downstream is a no-op — no error in dev, no error in build, no error
 * at runtime. Issue #22 was opened specifically because the platform
 * was suspected to be in this state in production.
 *
 * Mocked at @sentry/nextjs — no real network. The test asserts the
 * shape of the call to Sentry.init, not Sentry's runtime behaviour.
 *
 * Test scope:
 *   - server config  (SENTRY_DSN | NEXT_PUBLIC_SENTRY_DSN)
 *   - edge config    (same env var contract as server)
 *   - client config  (NEXT_PUBLIC_SENTRY_DSN only — server-only var
 *                     would never reach the browser bundle)
 */

const SENTRY_ENV_KEYS = [
  "SENTRY_DSN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "SENTRY_ENV",
  "NEXT_PUBLIC_SENTRY_ENV",
  "SENTRY_RELEASE",
  "NEXT_PUBLIC_SENTRY_RELEASE",
  "NODE_ENV",
] as const

// Snapshot the original values of just the keys we mutate, so afterEach
// can restore them individually. We cannot replace `process.env`
// wholesale — Node's special env object is referenced (and read) by the
// modules under test; reassigning `process.env = {...}` would orphan
// any helper that captured the original reference.
const ORIGINAL_VALUES = Object.fromEntries(
  SENTRY_ENV_KEYS.map((k) => [k, process.env[k]]),
) as Record<(typeof SENTRY_ENV_KEYS)[number], string | undefined>

vi.mock("@sentry/nextjs", () => ({
  init: vi.fn(),
  replayIntegration: vi.fn(() => ({ name: "Replay" })),
}))

import * as Sentry from "@sentry/nextjs"

const initMock = Sentry.init as unknown as ReturnType<typeof vi.fn>

// `process.env.NODE_ENV` is `readonly` in @types/node; mutating via a
// Record cast widens the type without changing runtime behaviour.
const envBag = process.env as Record<string, string | undefined>

/** Read the only call's args — fails loudly if init wasn't called. */
function initCallArgs(): Record<string, unknown> {
  const call = initMock.mock.calls[0]
  if (!call) throw new Error("Sentry.init was not called")
  return call[0] as Record<string, unknown>
}

beforeEach(() => {
  vi.resetModules()
  initMock.mockClear()
  vi.mocked(Sentry.replayIntegration).mockClear()
  // Wipe Sentry-relevant env vars so each test sets its own contract.
  for (const k of SENTRY_ENV_KEYS) {
    delete envBag[k]
  }
})

afterEach(() => {
  // Restore in place — never reassign `process.env` (see ORIGINAL_VALUES comment).
  for (const k of SENTRY_ENV_KEYS) {
    if (ORIGINAL_VALUES[k] === undefined) delete envBag[k]
    else envBag[k] = ORIGINAL_VALUES[k]
  }
})

describe("sentry.server.config", () => {
  it("calls Sentry.init when SENTRY_DSN is set", async () => {
    envBag.SENTRY_DSN = "https://public@o123.ingest.de.sentry.io/456"
    envBag.SENTRY_ENV = "production"
    envBag.SENTRY_RELEASE = "abc1234"
    await import("./sentry.server.config")
    expect(initMock).toHaveBeenCalledTimes(1)
    const args = initCallArgs()
    expect(args.dsn).toBe("https://public@o123.ingest.de.sentry.io/456")
    expect(args.environment).toBe("production")
    expect(args.release).toBe("abc1234")
  })

  it("falls back to NEXT_PUBLIC_SENTRY_DSN when SENTRY_DSN is unset", async () => {
    envBag.NEXT_PUBLIC_SENTRY_DSN =
      "https://public@o123.ingest.de.sentry.io/456"
    await import("./sentry.server.config")
    expect(initMock).toHaveBeenCalledTimes(1)
    expect(initCallArgs().dsn).toBe(
      "https://public@o123.ingest.de.sentry.io/456",
    )
  })

  it("falls back to NODE_ENV when SENTRY_ENV is unset", async () => {
    envBag.SENTRY_DSN = "https://public@o123.ingest.de.sentry.io/456"
    envBag.NODE_ENV = "production"
    await import("./sentry.server.config")
    expect(initMock).toHaveBeenCalledTimes(1)
    expect(initCallArgs().environment).toBe("production")
  })

  it("falls back to NEXT_PUBLIC_SENTRY_RELEASE when SENTRY_RELEASE is unset", async () => {
    envBag.SENTRY_DSN = "https://public@o123.ingest.de.sentry.io/456"
    envBag.NEXT_PUBLIC_SENTRY_RELEASE = "client-release-xyz"
    await import("./sentry.server.config")
    expect(initMock).toHaveBeenCalledTimes(1)
    expect(initCallArgs().release).toBe("client-release-xyz")
  })

  it("is a no-op when no DSN is set (silent — no init call)", async () => {
    // The intentional fail-quiet behaviour. We don't want unconfigured
    // local dev or unit-test runs to crash on missing DSN, but we also
    // don't want Sentry initialised pointing at nothing. Verify the
    // module loads cleanly AND skips Sentry.init.
    await import("./sentry.server.config")
    expect(initMock).not.toHaveBeenCalled()
  })

  it("sets sendDefaultPii: false (privacy posture is non-negotiable)", async () => {
    envBag.SENTRY_DSN = "https://public@o123.ingest.de.sentry.io/456"
    await import("./sentry.server.config")
    expect(initMock).toHaveBeenCalledTimes(1)
    expect(initCallArgs().sendDefaultPii).toBe(false)
  })
})

describe("sentry.edge.config", () => {
  it("calls Sentry.init when SENTRY_DSN is set", async () => {
    envBag.SENTRY_DSN = "https://public@o123.ingest.de.sentry.io/456"
    envBag.SENTRY_ENV = "production"
    envBag.SENTRY_RELEASE = "edge-rel-1"
    await import("./sentry.edge.config")
    expect(initMock).toHaveBeenCalledTimes(1)
    const args = initCallArgs()
    expect(args.dsn).toBe("https://public@o123.ingest.de.sentry.io/456")
    expect(args.environment).toBe("production")
    expect(args.release).toBe("edge-rel-1")
    expect(args.sendDefaultPii).toBe(false)
  })

  it("is a no-op when no DSN is set", async () => {
    await import("./sentry.edge.config")
    expect(initMock).not.toHaveBeenCalled()
  })
})

describe("sentry.client.config", () => {
  it("calls Sentry.init when NEXT_PUBLIC_SENTRY_DSN is set", async () => {
    envBag.NEXT_PUBLIC_SENTRY_DSN =
      "https://public@o123.ingest.de.sentry.io/456"
    envBag.NEXT_PUBLIC_SENTRY_ENV = "production"
    envBag.NEXT_PUBLIC_SENTRY_RELEASE = "client-rel-1"
    await import("./sentry.client.config")
    expect(initMock).toHaveBeenCalledTimes(1)
    const args = initCallArgs()
    expect(args.dsn).toBe("https://public@o123.ingest.de.sentry.io/456")
    expect(args.environment).toBe("production")
    expect(args.release).toBe("client-rel-1")
  })

  it("does NOT initialise from server-only SENTRY_DSN", async () => {
    // The client bundle must never read SENTRY_DSN (it's not exposed
    // to the browser). If a future refactor accidentally swapped the
    // env-var name, the client would silently break.
    envBag.SENTRY_DSN = "https://public@o123.ingest.de.sentry.io/456"
    await import("./sentry.client.config")
    expect(initMock).not.toHaveBeenCalled()
  })

  it("falls back to NODE_ENV when NEXT_PUBLIC_SENTRY_ENV is unset", async () => {
    envBag.NEXT_PUBLIC_SENTRY_DSN =
      "https://public@o123.ingest.de.sentry.io/456"
    envBag.NODE_ENV = "development"
    await import("./sentry.client.config")
    expect(initMock).toHaveBeenCalledTimes(1)
    expect(initCallArgs().environment).toBe("development")
  })

  it("masks all replay text + blocks all replay media (privacy posture)", async () => {
    envBag.NEXT_PUBLIC_SENTRY_DSN =
      "https://public@o123.ingest.de.sentry.io/456"
    await import("./sentry.client.config")
    expect(initMock).toHaveBeenCalledTimes(1)
    expect(initCallArgs().sendDefaultPii).toBe(false)
    // replayIntegration is a mocked factory; assert it was invoked with
    // mask/block defaults that the privacy contract depends on.
    const replayFactory = vi.mocked(Sentry.replayIntegration)
    expect(replayFactory).toHaveBeenCalledTimes(1)
    const replayOpts = replayFactory.mock.calls[0]?.[0]
    expect(replayOpts?.maskAllText).toBe(true)
    expect(replayOpts?.blockAllMedia).toBe(true)
  })
})
