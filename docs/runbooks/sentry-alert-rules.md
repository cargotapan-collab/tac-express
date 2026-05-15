# Runbook — Sentry Alert Rules

> **Audience:** the owner / on-call engineer. Agent sessions should NOT run the live script (the auth token must not enter the agent transcript). Agents can run `--dry-run` only if they have a token already in their local env.
>
> **Project coordinates:** `tapan-cargo-az/javascript-nextjs` on `de.sentry.io`.
>
> **Script source:** [`scripts/sentry/create-alert-rules.mjs`](../../scripts/sentry/create-alert-rules.mjs)
> **Rule definitions:** [`scripts/sentry/canonical-rules.mjs`](../../scripts/sentry/canonical-rules.mjs)
> **CI lint (no token):** [`scripts/sentry/lint-alert-rules.mjs`](../../scripts/sentry/lint-alert-rules.mjs)

---

## 0. TL;DR

```bash
# 1. One-time: token in apps/dashboard/.env.local (scope: project:write)
# 2. Dry run — prints the plan, no writes
SENTRY_AUTH_TOKEN=<token> node scripts/sentry/create-alert-rules.mjs --dry-run

# 3. Apply
SENTRY_AUTH_TOKEN=<token> node scripts/sentry/create-alert-rules.mjs

# 4. Verify in the Sentry UI
#    https://tapan-cargo-az.sentry.io/alerts/rules/javascript-nextjs/

# 5. Fire a synthetic event end-to-end
curl -X POST https://<dashboard-host>/api/diagnostics/sentry
#    Expect: an alert email within ~60s on the owner's address.
```

---

## 1. Required token + scope

| Property | Value |
|---|---|
| Token type | User-auth token (prefix `sntryu_`) **or** internal-integration token |
| Required scope | `project:write` (for `POST .../rules/`) |
| Optional scope | `project:read` (covered transitively by `project:write`) |
| Where to generate | https://sentry.io/settings/account/api/auth-tokens/ |
| Where to store locally | `apps/dashboard/.env.local` (already documented in `.env.example`) |
| Where to store in CI | Nowhere — this script never runs in CI. The CI lint job runs without a token. |

The user-auth (`sntryu_`) tokens have `project:write` by default. If you generate a fine-grained integration token, you must explicitly add the scope.

**The token must NEVER appear in:**
- A committed file (the `.env.example` placeholder is `""`, intentional)
- An agent chat transcript (don't paste it into Claude)
- A CI workflow file (no GitHub Actions step needs it for alert provisioning)

---

## 2. Dry-run flag

```bash
SENTRY_AUTH_TOKEN=<token> node scripts/sentry/create-alert-rules.mjs --dry-run
```

What dry-run does:
- GETs the existing rules from Sentry (read-only)
- Validates `CANONICAL_RULES` shape (same validator the CI lint runs)
- Prints which rules WOULD be created vs which already exist
- Performs **zero** writes

What dry-run does NOT do:
- It does not skip the `SENTRY_AUTH_TOKEN` requirement — the GET also needs auth.
- It does not validate that the tag keys referenced by each rule's filters are actually emitted by the codebase. That's covered by the synthetic-event step (§ 5).

Recommended every time the rule set changes — confirms the diff before committing to a write.

---

## 3. Idempotency guarantee

The script uses each rule's `name` as the idempotency key:

- Existing rule with same name → **skip** (the script never modifies existing rules)
- No existing rule with that name → **create**

This means:
1. Re-running the script after a successful run is a **no-op** — safe to run during recovery.
2. If you manually tweak a rule in the Sentry UI (e.g., add a Slack action), the script will NOT overwrite your edit on the next run.
3. To update a rule's body, **delete it manually in Sentry** (or use the rollback API call in § 6), edit `canonical-rules.mjs`, then re-run. The "manual edit then script overwrites you" footgun does not exist.

Validation runs locally before any POST — a malformed `canonical-rules.mjs` is rejected before touching the API. The CI lint job (see § 7) catches the same class of error on PR.

---

## 4. The rule set (current state)

| # | Name | Trigger | Action |
|---|---|---|---|
| 1 | Production errors — javascript-nextjs | first-seen / regression, level ≥ error, throttled 30min | IssueOwners email |
| 2 | Payment-response-lost — javascript-nextjs | first-seen / regression / reappeared, `kind:payment_response_lost` | IssueOwners email |
| 3 | Production error volume spike — javascript-nextjs | event-frequency >5 in 1m, level ≥ error, throttled 5min | IssueOwners email |

Rule 3 closes issue #22's acceptance criterion (a) — "unhandled exceptions in apps/dashboard with >5 events/min".

### Not yet shipped (tracked separately)

| # | Name (planned) | Required source code | Tracker |
|---|---|---|---|
| 4 | Supabase RPC failures — javascript-nextjs | `packages/services` must `setTag('source', 'supabase_rpc')` on `captureException` for RPC errors | follow-up issue |
| 5 | Auth/RBAC denial spike — javascript-nextjs | `packages/auth` must call `captureException` with `kind: 'rbac_denial'` tag from the role-gate failure path | follow-up issue |

Both depend on adding Sentry instrumentation to the relevant package. Provisioning the alert rule before the instrumentation ships would create a rule that never fires — visible as a "stale config" smell in the Sentry UI. The follow-up PR ships the instrumentation + appends the rules to `canonical-rules.mjs` in the same change.

---

## 5. Verifying end-to-end (synthetic event)

After a successful run, fire a real event to confirm:
1. The DSN is wired,
2. The event reaches the Sentry project,
3. At least one alert rule fires,
4. The notification target receives a message.

```bash
# From the dashboard host (replace with prod URL when verifying prod):
curl -X POST https://localhost:3001/api/diagnostics/sentry

# Or, in a deploy preview / production:
curl -X POST https://<dashboard-host>/api/diagnostics/sentry
```

Expected within ~60s:
- A new issue appears at `https://tapan-cargo-az.sentry.io/issues/?project=javascript-nextjs`
- The "Production errors" alert rule fires (level ≥ error + first-seen condition)
- Email arrives at the owner's address (or the integration target if you swapped to Slack/PagerDuty)

If steps 1–3 succeed but step 4 doesn't:
- Check the rule's `actions[]` in the Sentry UI is targeting a real notification address.
- Check the org-level email/Slack/PagerDuty integration is configured.
- The script ships the rules with `targetType: "IssueOwners"` by default; if no one is assigned to the issue and no project members opted in to default notifications, the email goes nowhere. See § 8 for switching to a fixed channel.

---

## 6. Rollback procedure

### Roll back a single rule (UI)

Settings → Alerts → Rules → click the rule → ⋯ menu → Delete.

### Roll back a single rule (API one-liner)

The runner prints `id=<N>` for each rule it creates. Capture that ID and:

```bash
curl -X DELETE \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://de.sentry.io/api/0/projects/tapan-cargo-az/javascript-nextjs/rules/<RULE_ID>/"
```

### Roll back ALL rules created by this script (last-resort)

```bash
# List rules, filter by names in CANONICAL_RULES, delete each by id.
# Run as a single pipeline — review the rule list before piping to DELETE.

# 1. Fetch + show the matching rules (no deletes):
curl -s -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  "https://de.sentry.io/api/0/projects/tapan-cargo-az/javascript-nextjs/rules/" \
  | node -e '
      const want = new Set([
        "Production errors — javascript-nextjs",
        "Payment-response-lost — javascript-nextjs",
        "Production error volume spike — javascript-nextjs",
      ])
      let s = ""
      process.stdin.on("data", c => s += c).on("end", () => {
        for (const r of JSON.parse(s)) if (want.has(r.name)) console.log(r.id, r.name)
      })'

# 2. Delete each id from step 1 manually (no auto-delete pipe by design —
#    the owner reviews before deleting).
```

The "auto-delete pipe" is intentionally NOT shipped. Bulk-delete of alert rules should be a deliberate, reviewed action.

---

## 7. CI gate (no token, no network)

`.github/workflows/architecture-gates.yml` runs `node scripts/sentry/lint-alert-rules.mjs` on every PR that touches `scripts/sentry/**`. The lint job:

- Imports `CANONICAL_RULES` from `canonical-rules.mjs`
- Calls `validateAllRules()` — same validator the runner uses
- Exits non-zero on any error

The lint job does NOT call the Sentry API. It runs without a token. This is by design — see § 1.

If the lint job fails, the PR description should explain whether the rule was intentionally restructured (in which case fix the validator) or accidentally broken (in which case fix the rule).

---

## 8. Switching the notification target

The default ships email-to-issue-owners. To switch to Slack or PagerDuty:

1. Set up the integration at https://tapan-cargo-az.sentry.io/settings/integrations/
2. Note the integration's workspace / channel / service ID
3. Edit `CANONICAL_RULES[].actions` in `canonical-rules.mjs`:

   **Slack:**
   ```js
   {
     id: "sentry.integrations.slack.notify_action.SlackNotifyServiceAction",
     workspace: "<numeric workspace ID>",
     channel: "#tac-incidents",
     channel_id: "",
     tags: "environment,level,kind,correlation_id",
   }
   ```

   **PagerDuty:** copy the action shape from the integration's "Configure" panel.

4. Delete the existing rule(s) in Sentry (script won't overwrite — § 3)
5. Re-run with `--dry-run` first, then live.

---

## 9. Linked issues

- [#22](https://github.com/cargotapan-collab/tac-express/issues/22) — original verification umbrella (closed)
- [#94](https://github.com/cargotapan-collab/tac-express/issues/94) — alert-rule notification action (open; this runbook closes the script-side, owner-run closes the live-side)
- [#102](https://github.com/cargotapan-collab/tac-express/issues/102) — production-readiness backlog (Observability section)
