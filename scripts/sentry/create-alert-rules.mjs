#!/usr/bin/env node
// Idempotently create the canonical Sentry alert rules for the
// tapan-cargo-az/javascript-nextjs project. Replaces the manual 4-click
// dashboard setup originally tracked in #94.
//
// USAGE
//   node scripts/sentry/create-alert-rules.mjs            # live run
//   node scripts/sentry/create-alert-rules.mjs --dry-run  # no writes; prints the plan
//
// REQUIRED ENV
//   SENTRY_AUTH_TOKEN — scope: `project:write` (POST .../rules/).
//                       A user-auth `sntryu_…` token covers this.
//                       Sourced automatically from apps/dashboard/.env.local
//                       if you run via `node --env-file=...`; otherwise
//                       export it inline.
//   --dry-run also requires SENTRY_AUTH_TOKEN for the GET list-rules
//   step (Sentry's REST API rejects unauthenticated reads). The token
//   is NOT used to write anything in dry-run mode.
//
// WHAT IT DOES (live run)
//   1. GETs the project's existing rules
//   2. For each entry in CANONICAL_RULES (see canonical-rules.mjs):
//      - if a rule with the same name exists, skips (idempotent)
//      - otherwise validates the rule shape, then POSTs to Sentry
//   3. Prints a summary of created / skipped
//
// DRY-RUN MODE
//   Identical to a live run up through validation, but PRINTS each
//   POST that *would* happen and exits 0. Useful in two situations:
//     - first-time owner sanity-check before committing to a write
//     - CI smoke for the runner itself (no token = job skips)
//
// IDEMPOTENCY GUARANTEE
//   `name` is the key. Existing rules with the same name are NEVER
//   modified by this script — to update an existing rule, manually
//   delete it in Sentry (Settings → Alerts → Rules → ⋯) then re-run.
//   The "rule was hand-edited" state remains obvious.
//
// ROLLBACK
//   Each rule lives independently. To roll back a single rule, delete
//   it in the Sentry UI. To roll back ALL rules created by this script,
//   delete every rule whose name matches a CANONICAL_RULES[].name —
//   see docs/runbooks/sentry-alert-rules.md § Rollback for the
//   API-driven version (a one-liner using the rule IDs printed by this
//   script's success output).
//
// WHY A SCRIPT INSTEAD OF TERRAFORM / PULUMI
//   One-off operational setup. Click-ops everywhere else in the Sentry
//   config (DSN keys, integrations). Adding IaC for ~3 rules is
//   over-engineering. Re-evaluate when rule count exceeds ~10.
//
// WHY NOT FROM CLAUDE'S MCP SESSION
//   Sentry MCP exposes update_issue / update_project but NOT
//   create_alert_rule. Direct REST calls from Claude would require
//   exposing the auth token to the agent context (token-in-transcript
//   risk). Owner runs locally with their own token.
//
// Tracked: issue #94 (the alert-rule action) + #22 (closed, the
// verification umbrella). Post-run, comment "alert rule live,
// target=<channel>" on #94 and close it.
//
// See: docs/runbooks/sentry-alert-rules.md for the full owner playbook.

import {
  CANONICAL_RULES,
  ORG_SLUG,
  PARAMETERIZED_ACTION_SENTINEL,
  PROJECT_SLUG,
  REGION_URL,
  validateAllRules,
} from "./canonical-rules.mjs"

const DRY_RUN = process.argv.includes("--dry-run")

/**
 * Parameterized-action resolution.
 *
 * Rules that include an action with id === PARAMETERIZED_ACTION_SENTINEL
 * need late-bound notification config. The owner provides it via the
 * SENTRY_ALERT_NOTIFICATION_ACTION env var — a JSON-encoded action body
 * matching Sentry's REST API shape.
 *
 * Examples:
 *
 *   Email to a specific Sentry org member (requires their member id):
 *     SENTRY_ALERT_NOTIFICATION_ACTION='{"id":"sentry.mail.actions.NotifyEmailAction","targetType":"Member","targetIdentifier":"42","fallthroughType":"ActiveMembers"}'
 *
 *   Slack channel (requires the Slack integration installed):
 *     SENTRY_ALERT_NOTIFICATION_ACTION='{"id":"sentry.integrations.slack.notify_action.SlackNotifyServiceAction","workspace":"12345","channel":"#tac-incidents","channel_id":"C012ABC","tags":"environment,level,kind"}'
 *
 *   PagerDuty service (requires the PagerDuty integration installed):
 *     SENTRY_ALERT_NOTIFICATION_ACTION='{"id":"sentry.integrations.pagerduty.notify_action.PagerDutyNotifyServiceAction","account":"54321","service":"PXYZABC"}'
 *
 * See docs/runbooks/sentry-alert-rules.md § "Owner one-time provisioning"
 * for the full 7-step procedure.
 */
function resolveParameterizedAction() {
  const raw = process.env.SENTRY_ALERT_NOTIFICATION_ACTION
  if (!raw || raw.trim().length === 0) return null
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    throw new Error(
      `SENTRY_ALERT_NOTIFICATION_ACTION is set but is not valid JSON: ${e.message}\n` +
        `  Value (first 80 chars): ${raw.slice(0, 80)}${raw.length > 80 ? "…" : ""}\n` +
        `  See docs/runbooks/sentry-alert-rules.md § "Owner one-time provisioning" for the expected shape.`,
    )
  }
  if (!parsed || typeof parsed !== "object" || typeof parsed.id !== "string" || parsed.id.length === 0) {
    throw new Error(
      `SENTRY_ALERT_NOTIFICATION_ACTION parsed as JSON but is missing string "id".\n` +
        `  Got: ${JSON.stringify(parsed)}\n` +
        `  Expected at minimum: { "id": "sentry.<...>NotifyServiceAction", ... }`,
    )
  }
  return parsed
}

/**
 * Walk a rule and replace any sentinel action with the parameterized
 * action JSON from env. Returns a new rule object — does NOT mutate the
 * input (CANONICAL_RULES is module-level and must stay immutable across
 * the script's lifecycle).
 *
 * If a rule contains a sentinel action but no env-derived action is
 * available, this returns the sentinel marker `{ needsParameterized: true }`
 * so the caller can decide (skip the rule + warn vs hard-error).
 */
function materializeRule(rule, parameterizedAction) {
  const hasSentinel = rule.actions.some(
    (a) => a && a.id === PARAMETERIZED_ACTION_SENTINEL,
  )
  if (!hasSentinel) return { rule, needsParameterized: false }
  if (!parameterizedAction) return { rule: null, needsParameterized: true }
  return {
    rule: {
      ...rule,
      actions: rule.actions.map((a) =>
        a && a.id === PARAMETERIZED_ACTION_SENTINEL ? parameterizedAction : a,
      ),
    },
    needsParameterized: false,
  }
}

const TOKEN = process.env.SENTRY_AUTH_TOKEN
if (!TOKEN) {
  console.error(
    "FATAL: SENTRY_AUTH_TOKEN env var is not set.\n" +
      "  - Source it from apps/dashboard/.env.local OR\n" +
      "  - Generate a fresh token at https://sentry.io/settings/account/api/auth-tokens/\n" +
      "    (scope: project:write — required for POST /api/0/projects/.../rules/)\n" +
      "  - See docs/runbooks/sentry-alert-rules.md for the full setup.\n",
  )
  process.exit(1)
}

// Defense-in-depth: validate locally before any network call. The same
// validator runs as a CI gate (scripts/sentry/lint-alert-rules.mjs),
// so a malformed rule should never reach this point — but if a future
// edit slips past CI, the runner still refuses to POST garbage.
const validationErrors = validateAllRules(CANONICAL_RULES)
if (validationErrors.length > 0) {
  console.error("FATAL: canonical-rules.mjs has validation errors:")
  for (const e of validationErrors) console.error(`  - ${e}`)
  console.error("\nFix canonical-rules.mjs, then re-run.")
  process.exit(1)
}

const baseUrl = `${REGION_URL}/api/0/projects/${ORG_SLUG}/${PROJECT_SLUG}/rules/`
const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
}

async function listExistingRules() {
  const res = await fetch(baseUrl, { headers })
  if (!res.ok) {
    throw new Error(
      `GET ${baseUrl} → ${res.status} ${res.statusText}: ${await res.text()}`,
    )
  }
  return res.json()
}

async function createRule(rule) {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(rule),
  })
  if (!res.ok) {
    throw new Error(
      `POST ${baseUrl} (rule="${rule.name}") → ${res.status} ${res.statusText}: ${await res.text()}`,
    )
  }
  return res.json()
}

async function main() {
  const modeLabel = DRY_RUN ? "DRY-RUN" : "LIVE"
  console.log(
    `→ [${modeLabel}] Fetching existing alert rules for ${ORG_SLUG}/${PROJECT_SLUG} on ${REGION_URL} …`,
  )
  const existing = await listExistingRules()
  const existingNames = new Set(existing.map((r) => r.name))
  console.log(`  Found ${existing.length} existing rule(s).`)
  if (existing.length > 0) {
    for (const r of existing) console.log(`    • ${r.name} (id=${r.id})`)
  }

  // Read the parameterized action ONCE up front. If absent, rules with the
  // sentinel will be skipped + warned (not a fatal error — rules 1–5 are
  // unaffected). Parsing errors ARE fatal because the owner clearly intended
  // to provision rule 6 but the JSON is malformed.
  const parameterizedAction = resolveParameterizedAction()
  if (!parameterizedAction) {
    console.log(
      "\nℹ SENTRY_ALERT_NOTIFICATION_ACTION is not set.\n" +
        "  Rule 6 (production-errors owner-targeted) will be SKIPPED.\n" +
        "  Rules 1–5 use the org-default IssueOwners email and provision normally.\n" +
        "  To provision rule 6, set SENTRY_ALERT_NOTIFICATION_ACTION and re-run.\n" +
        "  See docs/runbooks/sentry-alert-rules.md § \"Owner one-time provisioning\".",
    )
  }

  let created = 0
  let skipped = 0
  let plannedDryRun = 0
  let skippedNeedsParameterized = 0
  for (const rule of CANONICAL_RULES) {
    if (existingNames.has(rule.name)) {
      console.log(`⊘ Skipping "${rule.name}" — already exists`)
      skipped++
      continue
    }

    // Late-bind any sentinel action from env. If a rule needs the env
    // and it's missing, skip with a clear note (do NOT abort — rules
    // 1–5 must still provision).
    const { rule: materialized, needsParameterized } = materializeRule(
      rule,
      parameterizedAction,
    )
    if (needsParameterized) {
      console.log(
        `⊘ Skipping "${rule.name}" — requires SENTRY_ALERT_NOTIFICATION_ACTION (not set)`,
      )
      skippedNeedsParameterized++
      continue
    }
    const ruleToCreate = materialized

    if (DRY_RUN) {
      console.log(`◻ [DRY-RUN] Would create "${ruleToCreate.name}"`)
      console.log(`    conditions=${ruleToCreate.conditions.length} filters=${ruleToCreate.filters.length} actions=${ruleToCreate.actions.length} frequency=${ruleToCreate.frequency}min`)
      plannedDryRun++
      continue
    }
    console.log(`+ Creating "${ruleToCreate.name}" …`)
    const result = await createRule(ruleToCreate)
    console.log(`  ✓ Created with id=${result.id}`)
    created++
  }

  if (DRY_RUN) {
    console.log(`\n[DRY-RUN] Summary: ${plannedDryRun} would be created, ${skipped} skipped (already exist), ${skippedNeedsParameterized} skipped (needs SENTRY_ALERT_NOTIFICATION_ACTION).`)
    console.log(`[DRY-RUN] No writes performed. Re-run without --dry-run to apply.`)
    return
  }

  console.log(`\nSummary: ${created} created, ${skipped} skipped (already existed), ${skippedNeedsParameterized} skipped (needs env var).`)
  if (skippedNeedsParameterized > 0) {
    console.log(
      `\n⚠ ${skippedNeedsParameterized} rule(s) need SENTRY_ALERT_NOTIFICATION_ACTION to provision.`,
      `\n  See docs/runbooks/sentry-alert-rules.md § "Owner one-time provisioning".`,
    )
  }
  if (created > 0) {
    console.log(
      "\nNext steps:",
      "\n  1. Verify the rules at:",
      `\n     https://${ORG_SLUG}.sentry.io/alerts/rules/${PROJECT_SLUG}/`,
      "\n  2. Fire a test event via /api/diagnostics/sentry to confirm notifications arrive.",
      "\n  3. If you wanted Slack/PagerDuty instead of email-to-issue-owners,",
      "\n     edit CANONICAL_RULES[].actions in canonical-rules.mjs, delete the rule",
      "\n     in Sentry, and re-run.",
      "\n  4. See docs/runbooks/sentry-alert-rules.md for the full playbook.",
    )
  }
}

main().catch((err) => {
  console.error("\n✗ Script failed:", err.message)
  process.exit(2)
})
