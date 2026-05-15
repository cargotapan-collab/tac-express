import { describe, expect, it } from "vitest"

import { RBAC_DENIAL_TAG_KEYS } from "@workspace/auth"
import { SUPABASE_RPC_TAG_KEYS } from "@workspace/services"

import {
  CANONICAL_RULES,
  EMITTED_TAG_KEYS,
} from "../../../scripts/sentry/canonical-rules.mjs"

/**
 * Cross-package tag-contract sentinel.
 *
 * This is the load-bearing test the issue #110 acceptance criteria asks
 * for: "assert that every tag key referenced in canonical-rules.mjs
 * (b)+(c) IS actually emitted by the codebase."
 *
 * Three coupled facts must stay in sync:
 *   1. The package emits a tag with a specific key (e.g. rbac.denial)
 *      via its tag-keys constant (RBAC_DENIAL_TAG_KEYS / SUPABASE_RPC_TAG_KEYS).
 *   2. scripts/sentry/canonical-rules.mjs has a CANONICAL_RULES entry
 *      whose TaggedEventFilter.key references that string.
 *   3. EMITTED_TAG_KEYS in the same file lists the string.
 *
 * If any of the three drifts, the corresponding alert rule becomes
 * dead config in Sentry — it would never fire because the codebase
 * doesn't emit the tag it filters on. This test fails loudly in that
 * case so a developer can re-align all three.
 *
 * Where this test lives: apps/dashboard/__tests__/ rather than in a
 * package, because it crosses both package boundaries AND imports the
 * canonical-rules.mjs script. Living in apps/dashboard means it runs
 * alongside the sentry-init smoke test that already verifies the
 * runtime side of the contract.
 */

describe("canonical-rules.mjs tag-key contract", () => {
  it("every tag key the packages export is listed in EMITTED_TAG_KEYS", () => {
    const exportedTagKeys = [
      ...Object.values(RBAC_DENIAL_TAG_KEYS),
      ...Object.values(SUPABASE_RPC_TAG_KEYS),
    ]
    for (const key of exportedTagKeys) {
      expect(EMITTED_TAG_KEYS, `key "${key}" missing from EMITTED_TAG_KEYS`).toContain(
        key,
      )
    }
  })

  it("every TaggedEventFilter in CANONICAL_RULES references an emitted tag key", () => {
    type Filter = { id: string; key?: string }
    type Rule = { name: string; filters: readonly Filter[] }
    const rules = CANONICAL_RULES as readonly Rule[]

    for (const rule of rules) {
      for (const filter of rule.filters) {
        if (filter.id !== "sentry.rules.filters.tagged_event.TaggedEventFilter") {
          continue
        }
        expect(
          EMITTED_TAG_KEYS,
          `rule "${rule.name}" filters on key "${filter.key}" but no emitter listed in EMITTED_TAG_KEYS`,
        ).toContain(filter.key)
      }
    }
  })

  it("canonical rule (b) — Supabase RPC failures — filters on SUPABASE_RPC_TAG_KEYS.rpc", () => {
    type Filter = { id: string; key?: string; value?: string }
    type Rule = { name: string; filters: readonly Filter[] }
    const rules = CANONICAL_RULES as readonly Rule[]
    const rule = rules.find(
      (r) => r.name === "Supabase RPC failures — javascript-nextjs",
    )
    expect(rule, "rule b is missing from CANONICAL_RULES").toBeDefined()
    const tagFilter = rule!.filters.find(
      (f) => f.id === "sentry.rules.filters.tagged_event.TaggedEventFilter",
    )
    expect(tagFilter).toBeDefined()
    expect(tagFilter!.key).toBe(SUPABASE_RPC_TAG_KEYS.rpc)
    expect(tagFilter!.value).toBe("true")
  })

  it("canonical rule (c) — RBAC denial spike — filters on RBAC_DENIAL_TAG_KEYS.denial", () => {
    type Filter = { id: string; key?: string; value?: string }
    type Rule = { name: string; filters: readonly Filter[] }
    const rules = CANONICAL_RULES as readonly Rule[]
    const rule = rules.find((r) => r.name === "RBAC denial spike — javascript-nextjs")
    expect(rule, "rule c is missing from CANONICAL_RULES").toBeDefined()
    const tagFilter = rule!.filters.find(
      (f) => f.id === "sentry.rules.filters.tagged_event.TaggedEventFilter",
    )
    expect(tagFilter).toBeDefined()
    expect(tagFilter!.key).toBe(RBAC_DENIAL_TAG_KEYS.denial)
    expect(tagFilter!.value).toBe("true")
  })
})
