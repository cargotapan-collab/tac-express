import { describe, expect, it } from "vitest"

import { RBAC_DENIAL_TAG_KEYS } from "@workspace/auth"
import { SUPABASE_RPC_TAG_KEYS } from "@workspace/services"

import {
  CANONICAL_RULES,
  EMITTED_TAG_KEYS,
  PARAMETERIZED_ACTION_SENTINEL,
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

  it("canonical rule 6 — Production errors (owner-targeted) — uses the parameterized-action sentinel", () => {
    // #94's load-bearing rule. The action MUST be the sentinel so the
    // runner late-binds it from SENTRY_ALERT_NOTIFICATION_ACTION at
    // provision time. If a future edit replaces the sentinel with a
    // concrete action, the env-var workflow + runbook § 5.3 break
    // silently — owner re-runs the script expecting their channel and
    // gets the hardcoded one instead.
    type Action = { id: string }
    type Rule = { name: string; actions: readonly Action[]; environment: string }
    const rules = CANONICAL_RULES as readonly Rule[]
    const rule = rules.find(
      (r) => r.name === "Production errors (owner-targeted) — javascript-nextjs",
    )
    expect(rule, "rule 6 is missing from CANONICAL_RULES").toBeDefined()
    expect(rule!.environment).toBe("production")
    expect(rule!.actions).toHaveLength(1)
    expect(rule!.actions[0]!.id).toBe(PARAMETERIZED_ACTION_SENTINEL)
  })

  it("PARAMETERIZED_ACTION_SENTINEL is a non-empty string (lint contract)", () => {
    // The lint validator only checks action.id is a non-empty string;
    // anything stranger here (number, object, undefined) would fail the
    // structural lint AND fail at runtime when the runner tries to
    // string-compare. Pinning the type contract belt-and-braces.
    expect(typeof PARAMETERIZED_ACTION_SENTINEL).toBe("string")
    expect((PARAMETERIZED_ACTION_SENTINEL as string).length).toBeGreaterThan(0)
  })

  it("only rule 6 uses the sentinel action — rules 1–5 ship concrete actions", () => {
    type Action = { id: string }
    type Rule = { name: string; actions: readonly Action[] }
    const rules = CANONICAL_RULES as readonly Rule[]
    const sentinelRules = rules.filter((r) =>
      r.actions.some((a) => a.id === PARAMETERIZED_ACTION_SENTINEL),
    )
    expect(sentinelRules.map((r) => r.name)).toEqual([
      "Production errors (owner-targeted) — javascript-nextjs",
    ])
  })

  it("PARAMETERIZED_ACTION_SENTINEL has the pinned literal value the runner expects", () => {
    // The runner imports this constant for string compare; renaming the
    // sentinel without updating both sides + the docs would break the
    // late-binding silently. Pinned literal forces conscious intent.
    expect(PARAMETERIZED_ACTION_SENTINEL).toBe("PARAMETERIZED_NOTIFICATION_ACTION")
  })

  it("rule 6 trigger shape — first-seen OR regression at level >= error", () => {
    type Condition = { id: string }
    type Filter = { id: string; match?: string; level?: string }
    type Rule = {
      name: string
      conditions: readonly Condition[]
      filters: readonly Filter[]
      frequency: number
    }
    const rules = CANONICAL_RULES as readonly Rule[]
    const rule = rules.find(
      (r) => r.name === "Production errors (owner-targeted) — javascript-nextjs",
    )!

    const conditionIds = rule.conditions.map((c) => c.id)
    expect(conditionIds).toContain(
      "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition",
    )
    expect(conditionIds).toContain(
      "sentry.rules.conditions.regression_event.RegressionEventCondition",
    )

    const levelFilter = rule.filters.find(
      (f) => f.id === "sentry.rules.filters.level.LevelFilter",
    )
    expect(levelFilter).toBeDefined()
    expect(levelFilter!.match).toBe("gte")
    expect(levelFilter!.level).toBe("40") // 40 == error in Sentry's encoding

    // Frequency throttle — at most once per 30 min/group. Without this,
    // a noisy issue could flood the chosen channel.
    expect(rule.frequency).toBe(30)
  })
})
