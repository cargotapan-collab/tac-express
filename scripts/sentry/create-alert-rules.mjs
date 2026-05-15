#!/usr/bin/env node
// Idempotently create the canonical Sentry alert rules for the
// tapan-cargo-az/javascript-nextjs project. Replaces the manual 4-click
// dashboard setup that was tracked in #94.
//
// Usage:
//   1. Ensure SENTRY_AUTH_TOKEN is set in env (it lives in
//      apps/dashboard/.env.local already; the token must have project:write
//      scope — sntryu_ user-auth tokens have this by default).
//   2. node scripts/sentry/create-alert-rules.mjs
//
// What it does:
//   - GETs the project's existing rules
//   - For each canonical rule defined in CANONICAL_RULES below:
//       - if a rule with the same name exists, skips (idempotent)
//       - otherwise, POSTs the rule to Sentry's REST API
//   - Prints a summary of what was created vs skipped
//
// Why a script instead of a Terraform / Pulumi resource:
//   This is a one-off operational setup. The TAC Express project uses
//   click-ops for the rest of its Sentry config (DSN keys, integrations,
//   etc.) — adding IaC just for alerts would be over-engineering for the
//   current scale. Re-evaluate when alert-rule count exceeds ~10.
//
// Why a script instead of doing it from Claude Code's session:
//   Claude's Sentry MCP exposes update_issue / update_project but not
//   create_alert_rule. Direct REST API calls from Claude would require
//   exposing the auth token to the agent context, which we'd rather not
//   do (token-in-transcript risk). Owner runs locally with their own
//   token.
//
// Tracked: issue #94. After this script runs successfully and the rule
// is verified by a test event, comment "alert rule live, target=<channel>"
// on #94 and close it.

const ORG_SLUG = "tapan-cargo-az"
const PROJECT_SLUG = "javascript-nextjs"
const REGION_URL = "https://de.sentry.io"

/**
 * Canonical alert rules. Each entry is the body of a POST to
 *   {REGION_URL}/api/0/projects/{ORG_SLUG}/{PROJECT_SLUG}/rules/
 *
 * Schema reference: https://docs.sentry.io/api/alerts/create-an-issue-alert-rule-for-a-project/
 *
 * To add a rule, append to this array and re-run the script. Existing
 * rules with the same `name` are NOT modified — manual delete in Sentry
 * + re-run is required to update an existing rule. This is intentional:
 *   - prevents accidental clobber of operator's hand-tweaked filters
 *   - makes the "rule was modified by hand" state surface obvious
 */
const CANONICAL_RULES = [
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
      // members per their notification preferences).
      //
      // For Slack: replace with
      //   {
      //     id: "sentry.integrations.slack.notify_action.SlackNotifyServiceAction",
      //     workspace: "<numeric workspace ID from integration page>",
      //     channel: "#tac-incidents",
      //     channel_id: "",
      //     tags: "environment,level,kind,correlation_id",
      //   }
      //
      // For PagerDuty: replace with the integration's notify action.
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
]

const TOKEN = process.env.SENTRY_AUTH_TOKEN
if (!TOKEN) {
  console.error(
    "FATAL: SENTRY_AUTH_TOKEN env var is not set.\n" +
      "  - Source it from apps/dashboard/.env.local OR\n" +
      "  - Generate a fresh token at https://sentry.io/settings/account/api/auth-tokens/\n" +
      "    (scope: project:write — required for POST /api/0/projects/.../rules/)\n",
  )
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
  console.log(
    `→ Fetching existing alert rules for ${ORG_SLUG}/${PROJECT_SLUG} on ${REGION_URL} …`,
  )
  const existing = await listExistingRules()
  const existingNames = new Set(existing.map((r) => r.name))
  console.log(`  Found ${existing.length} existing rule(s).`)
  if (existing.length > 0) {
    for (const r of existing) console.log(`    • ${r.name} (id=${r.id})`)
  }

  let created = 0
  let skipped = 0
  for (const rule of CANONICAL_RULES) {
    if (existingNames.has(rule.name)) {
      console.log(`⊘ Skipping "${rule.name}" — already exists`)
      skipped++
      continue
    }
    console.log(`+ Creating "${rule.name}" …`)
    const result = await createRule(rule)
    console.log(`  ✓ Created with id=${result.id}`)
    created++
  }

  console.log(`\nSummary: ${created} created, ${skipped} skipped (already existed).`)
  if (created > 0) {
    console.log(
      "\nNext steps:",
      "\n  1. Verify the rules at:",
      `\n     https://${ORG_SLUG}.sentry.io/alerts/rules/${PROJECT_SLUG}/`,
      "\n  2. Fire a test event via /api/diagnostics/sentry to confirm notifications arrive.",
      "\n  3. If you wanted Slack/PagerDuty instead of email-to-issue-owners,",
      "\n     edit CANONICAL_RULES[].actions in this script, delete the rule",
      "\n     in Sentry, and re-run.",
    )
  }
}

main().catch((err) => {
  console.error("\n✗ Script failed:", err.message)
  process.exit(2)
})
