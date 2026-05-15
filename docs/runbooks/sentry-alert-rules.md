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

| # | Name | Trigger | Tag filter | Action |
|---|---|---|---|---|
| 1 | Production errors — javascript-nextjs | first-seen / regression, level ≥ error, throttled 30min | (none — level filter only) | IssueOwners email |
| 2 | Payment-response-lost — javascript-nextjs | first-seen / regression / reappeared | `kind:payment_response_lost` | IssueOwners email |
| 3 | Production error volume spike — javascript-nextjs | event-frequency >5 in 1m, level ≥ error, throttled 5min | (none — level filter only) | IssueOwners email |
| 4 | Supabase RPC failures — javascript-nextjs | first-seen / regression, level ≥ error, throttled 10min | `supabase.rpc:true` | IssueOwners email |
| 5 | RBAC denial spike — javascript-nextjs | event-frequency >20 in 1m, throttled 5min | `rbac.denial:true` | IssueOwners email |

Rule 3 closes issue #22 acceptance criterion (a). Rules 4 and 5 close (b) and (c) respectively, and are the deliverables of issue #110.

### Tag-emission contract

Rules 4 + 5 fire only when the codebase actively emits the tags they filter on. The emission lives in:

| Rule | Emitting module | Helper | Tag-key constant |
|---|---|---|---|
| 2 (`kind:payment_response_lost`) | `apps/dashboard/app/(dashboard)/finance/[id]/invoice-detail-client.tsx` | direct `Sentry.captureException` | (inlined) |
| 4 (`supabase.rpc:true`) | `packages/services/src/shared/with-rpc.ts` | `captureSupabaseRpcError(rpcName, err)` or `withRpc(rpcName, exec)` | `SUPABASE_RPC_TAG_KEYS` |
| 5 (`rbac.denial:true`) | `packages/auth/src/rbac-instrumentation.ts` | `captureRbacDenial(input)` | `RBAC_DENIAL_TAG_KEYS` |

The `scripts/sentry/canonical-rules.mjs` linter (`alert-rule-lint` CI gate) enforces that every `TaggedEventFilter.key` in `CANONICAL_RULES` appears in `EMITTED_TAG_KEYS`. A cross-package vitest sentinel (`apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts`) enforces that those keys match the package's exported tag-key constants. So the three artifacts — package emits, canonical rule, EMITTED_TAG_KEYS — cannot silently drift.

### Adoption status (call-site coverage)

| Surface | Adoption | Notes |
|---|---|---|
| `packages/services/src/payment.service.ts` — `record_invoice_payment` RPC | ✅ Adopted (PR #113) | First canonical call site; emits on real RPC failure, NOT on the issue-#9 "RPC missing" fallback. |
| `packages/services/src/exception.service.ts` — `resolve_exception` RPC | ✅ Adopted (PR α, #112) | DIRECT-WRAP via `withRpc()` |
| `packages/services/src/manifest.service.ts` — `close_manifest_atomic` RPC | ✅ Adopted (PR α, #112) | DIRECT-WRAP via `withRpc()` |
| `packages/services/src/rate-card.service.ts` — `get_rate_card` RPC | ✅ Adopted (PR α, #112) | DIRECT-WRAP via `withRpc()` |
| `packages/services/src/shipment.service.ts` — `generate_awb_number` RPC | ✅ Adopted (PR α, #112) | DIRECT-WRAP via `withRpc()` |
| `packages/services/src/booking.service.ts` — `convert_booking_to_shipment` RPC | ✅ Adopted (PR α, #112) | SELECTIVE — real-error branch only; issue-#19 fallback stays silent |
| `packages/services/src/manifest.service.ts` — `add_shipment_to_manifest` RPC | ✅ Adopted (PR α, #112) | SELECTIVE — real-error branch only |
| `packages/services/src/shipment.service.ts` — `bulk_create_shipments` RPC | ✅ Adopted (PR α, #112) | SELECTIVE — real-error branch only |
| `packages/services/src/dashboard.service.ts` — `detect_sla_breaches` RPC | 🔕 Silent by design (decision #115) | See § 4.1 below for full rationale. Marker in source updated from `SENTRY-MIGRATION-DEFERRED` → `SENTRY-SILENT-BY-DESIGN`. |
| `apps/dashboard/app/api/diagnostics/sentry/route.ts` — MANAGER gate | ✅ Adopted (PR α, #112) | BLOCK site — `captureRbacDenial` with surface=`/api/diagnostics/sentry` |
| `apps/dashboard/app/api/whatsapp/send-invoice/route.ts` — MANAGER gate | ✅ Adopted (PR α, #112) | BLOCK site — surface=`/api/whatsapp/send-invoice` |
| `apps/dashboard/app/api/whatsapp/test/route.ts` — MANAGER gate | ✅ Adopted (PR α, #112) | BLOCK site — surface=`/api/whatsapp/test` |
| `packages/ui/*` — `canAccess` / `canAccessModule` GATE callers | 🚫 Not adopted (intentional) | UI conditional rendering — silent UX, not page-worthy. Adopting would saturate rule 5. See audit doc § 2.2. |

Audit doc: [`docs/audits/2026-05-15-rbac-denial-audit.md`](../audits/2026-05-15-rbac-denial-audit.md).

---

## 4.1. Silent-by-design observability gaps (decision #115)

Two call sites in the codebase intentionally do NOT emit to Sentry, even though they're surfaces that COULD be wrapped with `withRpc` or `captureRbacDenial`. Listing them here makes the decision auditable — an on-call engineer reading this knows BEFORE 2 AM that these surfaces are dark by intent, not by oversight.

### `packages/services/src/dashboard.service.ts:getSLABreaches` — `detect_sla_breaches` RPC

**Decision:** keep silent. Source marker: `SENTRY-SILENT-BY-DESIGN`.

**Why:**
- `detect_sla_breaches` powers a non-critical **dashboard widget** that already degrades gracefully (try/catch returns `[]`).
- If the RPC is missing/slow, the SLA-breaches panel renders empty; the rest of the dashboard is unaffected.
- Adopting `withRpc()` here would emit on every dashboard render during a migration window (or any slow-RPC condition). That's hundreds of emissions/hour at normal traffic.
- Outcome of emitting: rule 4 (Supabase RPC failures) saturates → operators mute it → real RPC failures elsewhere lose their paging signal.

**What detection actually happens for this surface:**
- Operator-facing: a missing widget is visible during the user's session — the operator may notice + report.
- KPI-driven: if downstream metrics (SLA-breach counts in management reports) deviate from expectation, that surfaces independently of the widget.
- Sentry: deliberately none.

**Revisit triggers:**
- If we accumulate ≥3 RPC sites that want low-severity emission, build an `emitTaggedInfo` helper that emits at `level: 'info'` with a separate alert rule (or no rule). Then revisit this site.
- If a customer-facing impact is ever traced back to a silent `detect_sla_breaches` failure, escalate to option (c) (emit at error) and accept the alert noise.

### `apps/dashboard/app/api/whatsapp/send-invoice/route.ts:325` — `isAdminOrAbove` sub-gate

**Decision:** leave un-instrumented. Source marker: `RBAC-EMISSION SILENT-BY-DESIGN`.

**Why:**
- This is NOT a canonical RBAC denial — it's part of a **compound condition**: `(phone-mismatch && (!override || !admin))` returns 403.
- A non-admin caller who DOES set `overridePhone: true` still gets denied (lack of ADMIN role). An admin who DOESN'T set `overridePhone: true` also gets denied (missing explicit override flag).
- Emitting `captureRbacDenial` here would mis-attribute non-role denials (admin without override flag) as RBAC events. That's worse than no signal — it's wrong signal.
- The MANAGER block-gate at line 189 is the canonical RBAC adoption site for this route. That's the single source of RBAC truth for `/api/whatsapp/send-invoice`.

**What detection actually happens for this surface:**
- The 403 response itself is the operator-visible signal. If a legitimate caller hits the compound condition repeatedly, the API consumer reports it.
- The MANAGER gate at line 189 covers role-only RBAC.

**Revisit triggers:**
- If we ever want sub-role observability (a separate signal for "admin features were attempted by non-admins"), build a distinct tag (e.g. `rbac.sub_gate` instead of `rbac.denial`) and a separate alert rule. Don't fold sub-gates into rule 5.

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

### 5.1. Verifying rule 4 (Supabase RPC failures)

The wrapper at `packages/services/src/shared/with-rpc.ts` emits on the `record_invoice_payment` adoption site whenever the RPC returns a non-fallback error. In a dev env with a valid DSN, force a real RPC failure via the payment form by triggering a constraint-violating payment (e.g. duplicate UUID), or run the script-side dry-fire:

```bash
# Node REPL — quickest path to a real emit (requires a running Sentry-wired dashboard):
node --input-type=module -e "
  import { registerSentry, captureSupabaseRpcError } from '@workspace/services';
  registerSentry({ captureException: (e, tags) => console.log('emitted', { tags, code: (e as any).code }) });
  captureSupabaseRpcError('record_invoice_payment', { code: '23505', message: 'synthetic test' });
"
# Expected: { tags: { 'supabase.rpc': 'true', 'supabase.rpc_name': 'record_invoice_payment', 'supabase.error_code': '23505' }, code: 'SUPABASE_RPC_FAILED' }
```

In prod, rule 4 fires the first time any RPC error occurs. To pre-validate the rule before a real failure, the owner can temporarily set up a deliberately-broken RPC call in a deploy preview, then revert.

### 5.2. Verifying rule 5 (RBAC denial spike)

Rule 5 is frequency-based — single denials don't fire it. To synthesize a spike, hit a role-gated endpoint with an under-privileged session 21+ times in 60 seconds:

```bash
# Owner runs in a deploy preview with a low-role test account's JWT:
for i in $(seq 1 25); do
  curl -X POST -H "Cookie: <under-privileged-session-cookie>" \
    https://<preview-host>/api/whatsapp/send-invoice \
    -d '{"invoiceId": "synthetic-test"}'
  sleep 2
done
```

After ~60s, rule 5 should fire. Verify the issue contains all four `rbac.*` tags. If only some appear, the call site invoked `captureRbacDenial` with incomplete input — fix at the call site, not in the helper.

> NB: as of PR #113's merge, no production call site adopted `captureRbacDenial`. **PR #114 closed that gap** — three BLOCK sites now invoke the helper. Rule 5 fires when those gates are hit at spike volume.

---

## 5.3. Owner one-time provisioning — #94 closure procedure

This is the 7-step path to close [#94](https://github.com/cargotapan-collab/tac-express/issues/94). Designed to take ≤5 minutes once the channel choice (§ Step 1) is made. The substantive work was shipped in PRs #113, #114, #N (this PR adding rule 6 + the parameterized notification action) — the owner runs the remaining steps in their local env.

### Step 1 — Decide the notification channel

Pick ONE of three options. Document the choice in the PR body or as a follow-up comment on [#94](https://github.com/cargotapan-collab/tac-express/issues/94) so the next responder knows where alerts go:

- **Email to a specific Sentry org member** — fastest path. Requires the member's numeric Sentry id from `https://tapan-cargo-az.sentry.io/settings/members/` (click the member, the URL contains the id).
- **Slack channel** — recommended for team operations. Requires the Slack integration installed at `https://tapan-cargo-az.sentry.io/settings/integrations/slack/`. Capture the workspace id (numeric) and the channel id from Slack's UI (Channel → ⓘ → Channel Details, scroll to bottom).
- **PagerDuty service** — recommended for true on-call rotations. Requires the PagerDuty integration installed. Capture the numeric account id and the alphanumeric service id.

### Step 2 — Export env vars locally

In a terminal at the repo root (or as one line if pasting):

```bash
# Source the persistent token from apps/dashboard/.env.local:
export $(grep SENTRY_AUTH_TOKEN apps/dashboard/.env.local | xargs)

# Channel choice (replace the JSON with the shape matching your Step 1 pick):
export SENTRY_ALERT_NOTIFICATION_ACTION='{"id":"sentry.mail.actions.NotifyEmailAction","targetType":"Member","targetIdentifier":"<your-member-id>","fallthroughType":"ActiveMembers"}'

# Or Slack:
# export SENTRY_ALERT_NOTIFICATION_ACTION='{"id":"sentry.integrations.slack.notify_action.SlackNotifyServiceAction","workspace":"<workspace-id>","channel":"#tac-incidents","channel_id":"<channel-id>","tags":"environment,level,kind"}'

# Or PagerDuty:
# export SENTRY_ALERT_NOTIFICATION_ACTION='{"id":"sentry.integrations.pagerduty.notify_action.PagerDutyNotifyServiceAction","account":"<account-id>","service":"<service-id>"}'
```

NEVER export these into a shell rc file or commit them anywhere. They live only in the owner's current terminal session.

### Step 3 — Dry-run + inspect

```bash
node scripts/sentry/create-alert-rules.mjs --dry-run
```

Expected output: 5 already-exist + 1 would-create (rule 6 "Production errors (owner-targeted)"). If rule 6 shows as "skipped (needs SENTRY_ALERT_NOTIFICATION_ACTION)", the env var isn't being read — re-check Step 2.

If JSON parse fails: the runner aborts with the malformed JSON's first 80 chars and a pointer back to this runbook. Fix the JSON shape, re-run dry-run.

### Step 4 — Apply live

```bash
node scripts/sentry/create-alert-rules.mjs
```

Expected: `1 created, 5 skipped (already existed)`. The created rule prints its Sentry-side id (e.g. `id=12345`). Capture that id for the rollback path in § 6.

### Step 5 — Synthetic event

Fire a real error from the dashboard to trigger rule 6:

```bash
# In a deploy preview or production (curl needs a Manager+ session cookie):
curl -X POST -H "Cookie: <session-cookie>" https://<dashboard-host>/api/diagnostics/sentry
```

The `/api/diagnostics/sentry` route deliberately throws a tagged exception. Expected:
- New issue at `https://tapan-cargo-az.sentry.io/issues/?project=javascript-nextjs` within ~30s.
- Rule 6 fires (first-seen condition matches the new issue).

### Step 6 — Confirm notification

Within ~60s of Step 5, the notification arrives at the Step 1 channel:
- **Email:** check the chosen member's inbox.
- **Slack:** check the chosen channel for a Sentry-branded message.
- **PagerDuty:** check the chosen service for a new incident.

If the issue appears in Sentry but no notification arrives:
- Verify the action JSON at `https://tapan-cargo-az.sentry.io/alerts/rules/javascript-nextjs/` (click the rule → look at the "Then" config).
- Verify the integration is installed AND active (Slack tokens can expire).
- Verify the channel/email exists and the integration has permission to post.

### Step 7 — Close #94

Comment on [#94](https://github.com/cargotapan-collab/tac-express/issues/94):

```
alert rule live, target=<email|#slack-channel|PagerDuty-service>
Synthetic event verified: <Sentry issue URL>
Rule 6 id: <id from Step 4>
```

Close the issue.

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
- [#110](https://github.com/cargotapan-collab/tac-express/issues/110) — Sentry instrumentation for Supabase RPC + RBAC denial tags (this PR closes the helper-side; per-call-site adoption tracked as the follow-up filed alongside this PR)
