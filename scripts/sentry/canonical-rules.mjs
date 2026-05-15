// Canonical Sentry alert rules — the SINGLE SOURCE OF TRUTH for what
// alerts SHOULD exist on the tapan-cargo-az/javascript-nextjs project.
//
// Two consumers import from this file:
//   1. scripts/sentry/create-alert-rules.mjs — owner runs locally with
//      SENTRY_AUTH_TOKEN to provision rules in Sentry (idempotent).
//   2. scripts/sentry/lint-alert-rules.mjs   — CI runs on every PR to
//      assert each rule has the required fields (no Sentry API call).
//
// Why a separate module instead of inlining in the runner:
//   - The CI linter must NEVER call the Sentry API (the workflow runs on
//     every PR; we won't put a write-scoped token in CI). The linter
//     loads ONLY the rule definitions and asserts shape.
//   - Both consumers see the same array, so "the script worked locally
//     but CI says the rule is malformed" is structurally impossible.
//
// Rule schema reference:
//   https://docs.sentry.io/api/alerts/create-an-issue-alert-rule-for-a-project/
//
// Project coordinates (read by the runner; the linter doesn't need them):
export const ORG_SLUG = "tapan-cargo-az"
export const PROJECT_SLUG = "javascript-nextjs"
export const REGION_URL = "https://de.sentry.io"

/**
 * Every rule MUST declare these top-level fields. The linter asserts
 * presence + basic type; semantic correctness (does the filter tag
 * actually fire?) is verified by the owner running the script + firing
 * a synthetic event per the runbook.
 */
export const REQUIRED_FIELDS = /** @type {const} */ ([
  "name",
  "actionMatch",
  "filterMatch",
  "frequency",
  "environment",
  "conditions",
  "filters",
  "actions",
])

/**
 * Tag keys that the codebase actually emits. The linter checks that
 * every `TaggedEventFilter` in CANONICAL_RULES references a key listed
 * here — preventing the "rule filters on a tag that no code ever
 * emits" footgun (the rule would never fire; would look live in Sentry).
 *
 * Cross-package sentinel test (apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts)
 * verifies that each entry here matches a tag-key constant in the
 * relevant package's instrumentation module. Adding a key here without
 * a corresponding code emit will fail that test loudly.
 */
/**
 * Sentinel action id for rules that need an env-parameterized notification
 * target. The runner (create-alert-rules.mjs) detects this sentinel and
 * replaces the action with one built from SENTRY_ALERT_NOTIFICATION_ACTION
 * before POSTing to Sentry. If the env var is missing, the runner refuses
 * to POST with a clear error message.
 *
 * Why a sentinel rather than an empty actions array:
 *   The lint validator requires `actions[]` to be non-empty (a rule with
 *   no action fires silently). The sentinel satisfies the structural lint
 *   while signaling to the runner that the action needs late binding.
 *
 * Why one rule (rule 6) rather than parameterizing all rules:
 *   Rules 1–5 use the org-default IssueOwners email — which routes via
 *   the assignee or project-member email preferences. That's a safe
 *   default for most cases. Rule 6 is the EXPLICITLY-targeted rule the
 *   owner wires for the production-errors top-priority surface — it
 *   exists specifically to close #94's "verify a real notification action
 *   fires" acceptance criterion.
 */
export const PARAMETERIZED_ACTION_SENTINEL = "PARAMETERIZED_NOTIFICATION_ACTION"

export const EMITTED_TAG_KEYS = /** @type {const} */ ([
  // Pre-existing tag (PR #8 — apps/dashboard finance route):
  "kind", // values: "payment_response_lost", and (via rbac-instrumentation):
          //         (nothing — RBAC denial uses rbac.* below, not "kind")
  // packages/services/src/shared/with-rpc.ts:
  "supabase.rpc",
  "supabase.rpc_name",
  "supabase.error_code",
  // packages/auth/src/rbac-instrumentation.ts:
  "rbac.denial",
  "rbac.required_role",
  "rbac.actual_role",
  "rbac.surface",
])

/**
 * Canonical rules. To add a new rule, append to this array and re-run
 * the script. Existing rules with the same `name` are NOT modified —
 * manual delete in Sentry + re-run is required to update an existing
 * rule. This is intentional:
 *   - prevents accidental clobber of operator's hand-tweaked filters
 *   - makes the "rule was modified by hand" state surface obvious
 *
 * Coverage matrix (issue #22 acceptance criteria):
 *   (a) unhandled exceptions in apps/dashboard >5 events/min   →  RULE 3 below
 *   (b) Supabase RPC failures tagged at error level            →  RULE 4 below
 *       (consumes tags emitted by packages/services/src/shared/with-rpc.ts —
 *        see SUPABASE_RPC_TAG_KEYS for the contract)
 *   (c) auth/rbac denial spike >20/min                         →  RULE 5 below
 *       (consumes tags emitted by packages/auth/src/rbac-instrumentation.ts —
 *        see RBAC_DENIAL_TAG_KEYS for the contract)
 *
 * Rules 1 and 2 below predate the #22 verification and remain
 * load-bearing for the payment-response-lost flow PR #8 wired up.
 */
export const CANONICAL_RULES = [
  {
    name: "Production errors — javascript-nextjs",
    actionMatch: "any",
    filterMatch: "all",
    frequency: 30, // throttle: at most once per 30 minutes per group
    environment: "production",
    conditions: [
      // Fire when a NEW issue is created or a resolved issue regresses
      { id: "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition" },
      { id: "sentry.rules.conditions.regression_event.RegressionEventCondition" },
    ],
    filters: [
      // Drop warnings — only error and above page anyone
      {
        id: "sentry.rules.filters.level.LevelFilter",
        match: "gte",
        level: "40", // error
      },
    ],
    actions: [
      // The owner picks ONE notification target by editing this entry
      // before running the script. Default uses the org-default email
      // notification (which goes to the issue's assignee + project
      // members per their notification preferences). See runbook for
      // Slack / PagerDuty alternatives.
      {
        id: "sentry.mail.actions.NotifyEmailAction",
        targetType: "IssueOwners",
        targetIdentifier: "",
      },
    ],
  },
  {
    name: "Payment-response-lost — javascript-nextjs",
    // Higher-priority dedicated rule for the payment race condition the
    // dashboard tags as `kind:payment_response_lost`. Fires immediately
    // on every event (no throttling).
    actionMatch: "any",
    filterMatch: "all",
    frequency: 5,
    environment: "production",
    conditions: [
      { id: "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition" },
      { id: "sentry.rules.conditions.regression_event.RegressionEventCondition" },
      { id: "sentry.rules.conditions.reappeared_event.ReappearedEventCondition" },
    ],
    filters: [
      {
        id: "sentry.rules.filters.tagged_event.TaggedEventFilter",
        key: "kind",
        match: "eq",
        value: "payment_response_lost",
      },
    ],
    actions: [
      {
        id: "sentry.mail.actions.NotifyEmailAction",
        targetType: "IssueOwners",
        targetIdentifier: "",
      },
    ],
  },
  {
    // Issue #22 acceptance criterion (a): "unhandled exceptions in
    // apps/dashboard with >5 events/min". Frequency-based — fires when
    // an existing issue accumulates more than 5 events in any rolling
    // 1-minute window. Distinct from rule 1 (first-seen-only) — this
    // catches a known issue suddenly going hot, which a first-seen rule
    // misses entirely.
    name: "Production error volume spike — javascript-nextjs",
    actionMatch: "any",
    filterMatch: "all",
    frequency: 5, // dedupe: at most once per 5 minutes per group
    environment: "production",
    conditions: [
      {
        id: "sentry.rules.conditions.event_frequency.EventFrequencyCondition",
        // ">5 events in 1 minute" — the spike threshold from #22.
        value: 5,
        interval: "1m",
        comparisonType: "count",
      },
    ],
    filters: [
      {
        id: "sentry.rules.filters.level.LevelFilter",
        match: "gte",
        level: "40", // error and above only
      },
    ],
    actions: [
      {
        id: "sentry.mail.actions.NotifyEmailAction",
        targetType: "IssueOwners",
        targetIdentifier: "",
      },
    ],
  },
  {
    // Issue #22 acceptance criterion (b): "Supabase RPC failures tagged
    // at error level". Fires on every new RPC-failure issue. Filter on
    // `supabase.rpc=true` (the constant tag the wrapper emits) so this
    // rule is scoped strictly to RPC paths and not generic Postgres
    // query errors.
    //
    // Threshold: first-seen + regression (no frequency gate). RPC
    // failures are rare AND high-signal — every one is worth paging
    // on. If volume grows, the throttle (frequency=10min) prevents
    // pager-storm without dropping events.
    //
    // Tags consumed (must match SUPABASE_RPC_TAG_KEYS in
    // packages/services/src/shared/with-rpc.ts):
    //   - supabase.rpc        (constant "true")
    //   - supabase.rpc_name   (which RPC failed — surface in alert)
    //   - supabase.error_code (Postgres / PostgREST error code)
    name: "Supabase RPC failures — javascript-nextjs",
    actionMatch: "any",
    filterMatch: "all",
    frequency: 10,
    environment: "production",
    conditions: [
      { id: "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition" },
      { id: "sentry.rules.conditions.regression_event.RegressionEventCondition" },
    ],
    filters: [
      {
        id: "sentry.rules.filters.tagged_event.TaggedEventFilter",
        key: "supabase.rpc",
        match: "eq",
        value: "true",
      },
      {
        id: "sentry.rules.filters.level.LevelFilter",
        match: "gte",
        level: "40", // error and above
      },
    ],
    actions: [
      {
        id: "sentry.mail.actions.NotifyEmailAction",
        targetType: "IssueOwners",
        targetIdentifier: "",
      },
    ],
  },
  {
    // Issue #22 acceptance criterion (c): "auth/rbac denial spike
    // (>20/min) sourced from the packages/auth instrumentation".
    // Frequency-based — fires when RBAC denials accumulate >20 in any
    // rolling 1-minute window. Distinct from a "first denial" rule
    // (a single denial is not a spike — denials are normal for any
    // role-gated UI) — only the spike (potential probing / brute-force
    // attempt / misrouted automation) is alert-worthy.
    //
    // Tags consumed (must match RBAC_DENIAL_TAG_KEYS in
    // packages/auth/src/rbac-instrumentation.ts):
    //   - rbac.denial         (constant "true")
    //   - rbac.required_role  (surface in alert for triage)
    //   - rbac.actual_role
    //   - rbac.surface        (which route/component denied)
    //
    // Throttle: 5min (frequency=5). Spikes are usually short-lived
    // (deploy-broken role, automated probe); a 5min dedupe keeps the
    // signal honest without spamming.
    name: "RBAC denial spike — javascript-nextjs",
    actionMatch: "any",
    filterMatch: "all",
    frequency: 5,
    environment: "production",
    conditions: [
      {
        id: "sentry.rules.conditions.event_frequency.EventFrequencyCondition",
        value: 20,
        interval: "1m",
        comparisonType: "count",
      },
    ],
    filters: [
      {
        id: "sentry.rules.filters.tagged_event.TaggedEventFilter",
        key: "rbac.denial",
        match: "eq",
        value: "true",
      },
    ],
    actions: [
      {
        id: "sentry.mail.actions.NotifyEmailAction",
        targetType: "IssueOwners",
        targetIdentifier: "",
      },
    ],
  },
  {
    // Issue #94 — explicitly-targeted production-errors alert rule.
    //
    // The canonical "owner gets paged when a new production error fires"
    // rule. Distinct from rule 1 (which uses IssueOwners email default —
    // works only if the issue is auto-assigned and that person has
    // notifications enabled — brittle for solo-operator setups).
    //
    // Triggers: first-seen OR regression event, level ≥ error, environment
    // = production. Frequency throttled at 30 min/group so a single noisy
    // issue can't spam the channel.
    //
    // Notification target is PARAMETERIZED — the action below uses the
    // sentinel id PARAMETERIZED_ACTION_SENTINEL, which the runner
    // (scripts/sentry/create-alert-rules.mjs) replaces with the action
    // JSON read from env var SENTRY_ALERT_NOTIFICATION_ACTION before
    // POSTing. If the env var is missing, the runner refuses to provision
    // this rule with a clear error.
    //
    // See docs/runbooks/sentry-alert-rules.md § "Owner one-time
    // provisioning — #94 closure procedure" for the 7-step owner workflow.
    name: "Production errors (owner-targeted) — javascript-nextjs",
    actionMatch: "any",
    filterMatch: "all",
    frequency: 30,
    environment: "production",
    conditions: [
      { id: "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition" },
      { id: "sentry.rules.conditions.regression_event.RegressionEventCondition" },
    ],
    filters: [
      {
        id: "sentry.rules.filters.level.LevelFilter",
        match: "gte",
        level: "40", // error and above
      },
    ],
    actions: [
      {
        // Runner replaces this entry with the env-derived action.
        // Lint sees id as a non-empty string (passes structural check).
        id: PARAMETERIZED_ACTION_SENTINEL,
      },
    ],
  },
]

/**
 * Validate a single rule object. Returns an array of error strings
 * (empty array = valid). Used by both the runner (defense-in-depth
 * before POSTing to Sentry) and the linter (CI gate).
 *
 * Checks performed:
 *   - every REQUIRED_FIELDS key is present
 *   - `name`, `actionMatch`, `filterMatch`, `environment` are non-empty strings
 *   - `frequency` is a positive number
 *   - `conditions`, `filters`, `actions` are arrays
 *   - `conditions` has at least one entry (a rule with zero conditions
 *     never fires — Sentry accepts it but it's almost certainly a bug)
 *   - `actions` has at least one entry (rule with no actions = silent)
 *   - every condition / filter / action has an `id` string
 *
 * NOT checked (intentionally — these are runtime/semantic):
 *   - whether the `id` strings are real Sentry rule IDs (the API will
 *     reject unknown IDs, and the owner runs the script to verify)
 *   - whether `filters[].key` tag values are actually emitted by the
 *     codebase (covered by the runbook's "fire a synthetic event" step)
 *
 * @param {Record<string, unknown>} rule
 * @param {number} index
 * @returns {string[]} validation errors
 */
export function validateRule(rule, index) {
  /** @type {string[]} */
  const errs = []
  const where = `rule[${index}]${rule && typeof rule.name === "string" ? ` (name=${JSON.stringify(rule.name)})` : ""}`

  if (!rule || typeof rule !== "object") {
    return [`${where}: not an object`]
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in rule)) errs.push(`${where}: missing required field "${field}"`)
  }

  if (typeof rule.name !== "string" || rule.name.length === 0) {
    errs.push(`${where}: "name" must be a non-empty string`)
  }
  for (const k of /** @type {const} */ (["actionMatch", "filterMatch", "environment"])) {
    if (typeof rule[k] !== "string" || rule[k].length === 0) {
      errs.push(`${where}: "${k}" must be a non-empty string`)
    }
  }
  if (typeof rule.frequency !== "number" || !(rule.frequency > 0)) {
    errs.push(`${where}: "frequency" must be a positive number (minutes)`)
  }
  for (const k of /** @type {const} */ (["conditions", "filters", "actions"])) {
    if (!Array.isArray(rule[k])) {
      errs.push(`${where}: "${k}" must be an array`)
    }
  }
  if (Array.isArray(rule.conditions) && rule.conditions.length === 0) {
    errs.push(`${where}: "conditions" is empty — rule will never fire`)
  }
  if (Array.isArray(rule.actions) && rule.actions.length === 0) {
    errs.push(`${where}: "actions" is empty — rule will fire silently with no notification`)
  }
  for (const arrKey of /** @type {const} */ (["conditions", "filters", "actions"])) {
    const arr = rule[arrKey]
    if (!Array.isArray(arr)) continue
    arr.forEach((entry, i) => {
      if (!entry || typeof entry !== "object" || typeof entry.id !== "string" || entry.id.length === 0) {
        errs.push(`${where}: ${arrKey}[${i}] missing string "id"`)
      }
    })
  }

  // Tagged-event filters need a string `key`/`value`/`match`. The base
  // id-check above can't catch e.g. `key: undefined` on a tagged_event
  // filter, which Sentry's API rejects with a confusing 400. We also
  // verify the `key` references EMITTED_TAG_KEYS so a rule can never
  // filter on a tag the codebase doesn't emit (rules 4+5 from PR adding
  // packages/auth + packages/services Sentry instrumentation).
  if (Array.isArray(rule.filters)) {
    rule.filters.forEach((filter, i) => {
      if (filter && filter.id === "sentry.rules.filters.tagged_event.TaggedEventFilter") {
        for (const k of /** @type {const} */ (["key", "match", "value"])) {
          if (typeof filter[k] !== "string" || filter[k].length === 0) {
            errs.push(`${where}: filters[${i}] (TaggedEventFilter) "${k}" must be a non-empty string`)
          }
        }
        if (typeof filter.key === "string" && filter.key.length > 0 && !EMITTED_TAG_KEYS.includes(filter.key)) {
          errs.push(
            `${where}: filters[${i}] (TaggedEventFilter) key=${JSON.stringify(filter.key)} ` +
              `is not in EMITTED_TAG_KEYS — rule would never fire. ` +
              `Either emit this tag in the codebase + add it to EMITTED_TAG_KEYS, ` +
              `or change the rule to filter on a tag that is emitted.`,
          )
        }
      }
    })
  }

  return errs
}

/**
 * Validate every rule in CANONICAL_RULES + check for duplicate names
 * (the runner uses name as the idempotency key — duplicates would mean
 * one rule of the pair never gets created).
 *
 * @param {ReadonlyArray<Record<string, unknown>>} rules
 * @returns {string[]} validation errors (empty = valid)
 */
export function validateAllRules(rules = CANONICAL_RULES) {
  /** @type {string[]} */
  const errs = []
  rules.forEach((rule, i) => {
    errs.push(...validateRule(rule, i))
  })
  const names = rules.map((r) => r && r.name).filter((n) => typeof n === "string")
  const seen = new Set()
  for (const n of names) {
    if (seen.has(n)) errs.push(`duplicate rule name "${n}" — idempotency key collision`)
    seen.add(n)
  }
  return errs
}
