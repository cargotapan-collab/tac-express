#!/usr/bin/env node
// Lint the canonical Sentry alert rules — CI gate. Runs WITHOUT a
// SENTRY_AUTH_TOKEN and makes NO network calls.
//
// Why this exists:
//   The runner (create-alert-rules.mjs) is owner-runnable only because
//   it needs a write-scoped token. That means a typo in
//   canonical-rules.mjs wouldn't be caught until someone tries to run
//   the script — possibly weeks after the typo merged. This lint job
//   asserts the rule shape on every PR that touches scripts/sentry/.
//
// What it checks:
//   - validateAllRules(CANONICAL_RULES) passes (see canonical-rules.mjs
//     for the exact field-by-field contract)
//   - no duplicate rule names
//
// What it does NOT check:
//   - whether the Sentry API would accept the rule (that requires a
//     network call + a token — owner runs the runner to verify)
//   - whether the tags / keys reference real codebase emission points
//     (covered by the owner-runnable synthetic-event step in the runbook)
//
// Exit codes: 0 = clean, 1 = validation errors.

import { CANONICAL_RULES, validateAllRules } from "./canonical-rules.mjs"

const errors = validateAllRules(CANONICAL_RULES)

if (errors.length > 0) {
  console.error(`✗ canonical-rules.mjs has ${errors.length} validation error(s):\n`)
  for (const e of errors) console.error(`  - ${e}`)
  console.error("\nFix the issues in scripts/sentry/canonical-rules.mjs, then re-run.")
  process.exit(1)
}

console.log(`✓ canonical-rules.mjs is valid (${CANONICAL_RULES.length} rule${CANONICAL_RULES.length === 1 ? "" : "s"}).`)
for (const rule of CANONICAL_RULES) {
  console.log(`  • ${rule.name}`)
}
