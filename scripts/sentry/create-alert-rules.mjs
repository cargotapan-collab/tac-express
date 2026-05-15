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
  PROJECT_SLUG,
  REGION_URL,
  validateAllRules,
} from "./canonical-rules.mjs"

const DRY_RUN = process.argv.includes("--dry-run")

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

  let created = 0
  let skipped = 0
  let plannedDryRun = 0
  for (const rule of CANONICAL_RULES) {
    if (existingNames.has(rule.name)) {
      console.log(`⊘ Skipping "${rule.name}" — already exists`)
      skipped++
      continue
    }
    if (DRY_RUN) {
      console.log(`◻ [DRY-RUN] Would create "${rule.name}"`)
      console.log(`    conditions=${rule.conditions.length} filters=${rule.filters.length} actions=${rule.actions.length} frequency=${rule.frequency}min`)
      plannedDryRun++
      continue
    }
    console.log(`+ Creating "${rule.name}" …`)
    const result = await createRule(rule)
    console.log(`  ✓ Created with id=${result.id}`)
    created++
  }

  if (DRY_RUN) {
    console.log(`\n[DRY-RUN] Summary: ${plannedDryRun} would be created, ${skipped} skipped (already exist).`)
    console.log(`[DRY-RUN] No writes performed. Re-run without --dry-run to apply.`)
    return
  }

  console.log(`\nSummary: ${created} created, ${skipped} skipped (already existed).`)
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
