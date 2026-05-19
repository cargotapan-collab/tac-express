# TAC Express — MASTER LAUNCH PLAN

> **Authority:** this file is the single, reconciled launch plan. It supersedes the *scope* of [`docs/launch/definition-of-done.md`](definition-of-done.md) (engineering) and [`docs/launch/product-launch-readiness.md`](product-launch-readiness.md) (product) AND the customer-facing slice of [`docs/launch/CUSTOMER-FACING-PLAN.md`](CUSTOMER-FACING-PLAN.md) as the **unified** burn-down. Those three files remain the per-workstream detail; this file is the rollup + ordering.

**Version:** 1.2 — customer-facing reconciliation (LB-5 + LB-6 added), 2026-05-19.
**Previous versions:** 1.1 — LB-3 closed (2026-05-19, PR #179). 1.0 — initial master reconciliation (2026-05-18, PR #178).
**Authority chain:** [`AGENTS.md` § 0](../../AGENTS.md) → THIS FILE → `definition-of-done.md` + `product-launch-readiness.md` + `CUSTOMER-FACING-PLAN.md` → [`docs/backlog/production-readiness.md`](../backlog/production-readiness.md).
**Main HEAD at v1.2 reconciliation:** `c21e56b` (`fix(a11y): close LB-3 / #173 — Option B class-redirect for WCAG AA contrast (#179)`).

---

## 0. LAUNCH VERDICT (evidenced)

> # **NOT READY**

The verdict is BOOLEAN — `engineering_ready AND product_ready AND customer_facing_ready`. **Five** launch-blockers remain. v1.1 closed LB-3 (contrast / #173). v1.2 added LB-5 + LB-6 from the customer-facing workstream — **both agent-actionable**, gated only on a 2-min owner env-var input. The agent-actionable launch-blocker queue is no longer empty. PI-1, LB-1, LB-2, LB-4 stay owner-blocked.

**Evidence trail (re-verified 2026-05-19):**

| Claim | Verified via | Result |
|---|---|---|
| `/api/contact` would 500 in production | Supabase MCP `list_tables` against project `mdvnphbucrpspntrezmj` | ❌ `contact_leads` ABSENT; `whatsapp_sends` ABSENT — unchanged from 2026-05-18 |
| SB-2 has been run end-to-end | Sentry MCP `search_issues` for `api/diagnostics` in `tapan-cargo-az/javascript-nextjs` | ❌ Zero `api/diagnostics` issues across project lifetime — unchanged |
| Production has active error signal | Sentry MCP `search_issues is:unresolved lastSeen:-7d` | ✅ No unresolved errors last 7d (separate from SB-2 — the LACK of alert-rule plumbing means a real incident wouldn't notify the owner) |
| **Carve color-contrast (#173 / LB-3)** | `apps/web/e2e/carve.a11y.spec.ts` × 3 viewports × 9 pages = 27 tests against production build, locally on this branch | ✅ **0 serious/critical color-contrast violations.** `AXE_FAIL_ON_VIOLATIONS=1` flipped to gate regressions. |
| WastelandLanding "deprecated" claim from a prior Run | grep + `product-launch-readiness.md § B.1 / § C.2` | ❌ Brief misread. Implementation uses current Violet Grid tokens; rename is cosmetic POST-LAUNCH-POLISH. **Acceptable to ship.** |
| Run-series outputs | gh PR audit of #163–#178 | ✅ Run 4 supersedes #176 with a complete fix; #176 closed as superseded |

---

## 1. Reconciliation — every issue / PR vs current main

Audited via `gh issue/PR view` against main `180b93a`. Three workstreams reconciled into ONE list below.

### 1.1 Open PRs (0)

Run 4's PR (`feat/lb3-contrast-option-b`) supersedes #176 with the owner-chosen Option B (class-redirect, typography preserved) applied across all 4 contrast sites the wider carve scan surfaced. #176 closed as superseded.

### 1.2 Open issues (13)

| # | Title | True state vs main | Bucket |
|---|---|---|---|
| [#174](https://github.com/cargotapan-collab/tac-express/issues/174) | Deploy 4 un-deployed migrations | OPEN; verified 2026-05-19: `contact_leads` + `whatsapp_sends` still absent from remote `mdvnphbucrpspntrezmj`. Migration-deploy pipeline shipped in PR #175 but DORMANT (`vars.MIGRATION_DEPLOY_ENABLED` defaults `false`). | **🚨 PRODUCTION-INCIDENT** |
| [#173](https://github.com/cargotapan-collab/tac-express/issues/173) | Landing color-contrast WCAG AA | **✅ FIXED 2026-05-19** by the Run-4 PR (Option B class-redirect). All 4 surfaced sites (landing-desktop/tablet AWB-emphasis, landing-mobile testimonial, pricing "Most popular" badge, /track/[awb] AWB number + helper text) now AA-pass. CI gated via `AXE_FAIL_ON_VIOLATIONS=1`. Closing on merge. | LAUNCH-BLOCKER — **closing on merge** |
| [#169](https://github.com/cargotapan-collab/tac-express/issues/169) | POST-LAUNCH: LOCATE tracking-[0.3em] → token | OPEN. Pre-existing inconsistency. POST-LAUNCH per its own title. | POST-LAUNCH |
| [#167](https://github.com/cargotapan-collab/tac-express/issues/167) | Autonomous launch-readiness run — 2026-05-18 | OPEN; meta tracking issue for Run 1/2/3. Not launch-gating. Close after launch-ready. | META (not launch-gating) |
| [#158](https://github.com/cargotapan-collab/tac-express/issues/158) | POST-LAUNCH: request-signing sweep | OPEN; security-sensitive. | POST-LAUNCH-SECURITY (Tier 3) |
| [#157](https://github.com/cargotapan-collab/tac-express/issues/157) | POST-LAUNCH: TOCTOU in retryWhatsappSend | OPEN; security-sensitive. | POST-LAUNCH-SECURITY (Tier 3) |
| [#154](https://github.com/cargotapan-collab/tac-express/issues/154) | RBAC auth-error handling sweep | OPEN; lean POST-LAUNCH per OD-1. Security-sensitive. | POST-LAUNCH-SECURITY (Tier 3; promotable if OD-1 = ship-blocker) |
| [#151](https://github.com/cargotapan-collab/tac-express/issues/151) | `as unknown as` cleanup in apps/web/proxy.ts | OPEN; 30-min hygiene. | POST-LAUNCH |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | Immutability sentinel for whatsapp_sends | OPEN; defense-in-depth. | POST-LAUNCH |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery-callback webhook | OPEN; adds `delivered`/`read` status. | POST-LAUNCH |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated WhatsApp retry job | OPEN; operator-triggered retry is the floor. | POST-LAUNCH |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | ServiceLevel branded type | OPEN; structural. | POST-LAUNCH |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | regex-alternation LAW gate | OPEN; tooling. | POST-LAUNCH |

### 1.3 Recently-closed / merged (the Run-series, for context)

All 14 PRs in the #162–#177 range are CLOSED or MERGED, except #176 (deliberately held). Key contributions to launch state:

- **#175** shipped `.github/workflows/migration-deploy.yml` — the **automation that fixes #174 once activated**. Dormant by default; opt-in via `vars.MIGRATION_DEPLOY_ENABLED=true` + two secrets.
- **#177** shipped `.github/workflows/e2e-web.yml` — gates apps/web smoke+a11y on every PR. `AXE_FAIL_ON_VIOLATIONS=0` until #173 lands.
- **#168** merged the `contact_leads` migration file + `/api/contact` route + service — code-complete; **infrastructure-blocked** by #174.
- **#170, #171, #172** completed PL-1/PL-3/PL-4 (rendered + axe-verified).
- **#139, #140, #142** closed as FIXED on tracker.
- **#94** (SB-2's tracker) remains CLOSED but the owner-runnable work still exists as a tracker-less DoD gate.

### 1.4 Workstream reconciliation

Four workstreams now exist (v1.2 added the customer-facing one):

| Workstream | Authority file | Outstanding items |
|---|---|---|
| Engineering DoD | `definition-of-done.md` | SB-2 only; SB-3 P1–P4 prereqs |
| Product-launch readiness | `product-launch-readiness.md` | PL-2b live-activation; visual-snapshot baselines (contrast closed) |
| Run-series (#167–#179) | — (tracked via #167 + retros) | #173, #174 surfaced; #175 + #177 + #179 shipped (#179 closes #173); #176 superseded by #179 |
| **Customer-facing (v1.2)** | [`CUSTOMER-FACING-PLAN.md`](CUSTOMER-FACING-PLAN.md) | **WS-1** (LB-5 + LB-6 — added to § 2.2); WS-2 / WS-3 / WS-4 (POST-LAUNCH; tracked in the customer-facing plan, not duplicated here) |

**The reconciliation:** every Run-series finding maps onto a row in the unified list below. Specifically:
- #174 promotes to **PRODUCTION-INCIDENT** — NOT previously accounted for in either authority file.
- The migration-deploy pipeline (PR #175) is the closeout mechanism for #174 — NOT previously accounted for in DoD.
- #173 escalates to **LAUNCH-BLOCKER** — WCAG AA is a launch-credibility gate for enterprise B2B, not a polish item.

---

## 2. The unified classified list (FINITE)

### 2.1 PRODUCTION-INCIDENT — 1

| ID | Item | Done criterion (testable) | Owner / Agent | Estimate |
|---|---|---|---|---|
| **PI-1** | **Activate the migration-deploy pipeline + run the one-time backfill (#174)** | `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('contact_leads','whatsapp_sends')` returns BOTH rows on remote `mdvnphbucrpspntrezmj`. Verified via Supabase MCP `list_tables` post-deploy. | **OWNER** (irreversible production write; secret-bearing) | ~10 min after secrets set |

### 2.2 LAUNCH-BLOCKER — 5 (finite, closeable; LB-3 closed 2026-05-19; LB-5 + LB-6 added 2026-05-19 v1.2)

| ID | Item | Done criterion (testable) | Owner / Agent | Estimate | Depends on |
|---|---|---|---|---|---|
| **LB-1** | **SB-2 — Sentry alert provisioning** | `scripts/sentry/create-alert-rules.mjs` run with `project:write` token; at least one rule fires end-to-end; an `api/diagnostics`-tagged synthetic event visible via Sentry MCP `search_issues` for `tapan-cargo-az/javascript-nextjs` | **OWNER** (owner-only credential per handoff do-NOT list #4) | ~20 min |
| **LB-2** | **PL-2b activation — live lead notification end-to-end** | Submit `/contact` on production. `contact_leads` row lands with `notification_status='sent'`; recipient phone receives the WhatsApp template message; the row's `whatsapp_send_id` resolves to a `whatsapp_sends` row with `status='sent'` | **OWNER** (template approval + WPBOX env + production submit; bundled because all three are owner-only inputs feeding the same e2e verification) | ~30 min after PI-1 + template approval lands | PI-1; Meta template approval |
| ~~**LB-3**~~ | ~~#173 — design call on contrast approach + apply to remaining sites~~ | ✅ DONE 2026-05-19 — Option B class-redirect applied across 4 sites; `AXE_FAIL_ON_VIOLATIONS=1` flipped; all 9 carve pages × 3 viewports = 0 serious/critical | AGENT (Run 4 → PR #179) | closed | — |
| **LB-4** | **SB-3 P1–P4 owner-prerequisites — verify in Supabase dashboard** | The 4 fill-in blocks in [`DATABASE-RESTORE.md § 2`](../runbooks/DATABASE-RESTORE.md#2-prerequisites-owner-confirmed--verify-before-launch) all checked: P1 Pro plan, P2 PITR enabled + retention, P3 daily backups, P4 Owner role | **OWNER** | ~10 min in Supabase dashboard | — |
| **LB-5** | **Customer-facing WS-1.1 — replace hardcoded `localhost:3001` dashboard link in PublicNav with `NEXT_PUBLIC_DASHBOARD_URL`** | Reads from env var with build-time fallback that fails build if unset on production. Unit test asserts non-localhost in `VERCEL_ENV='production'`. Playwright smoke-test confirms working dashboard nav. See [`CUSTOMER-FACING-PLAN.md § 2.1`](CUSTOMER-FACING-PLAN.md). | **AGENT** | ~30 min agent session | Owner sets `NEXT_PUBLIC_DASHBOARD_URL` on apps/web Vercel project — see § 4.6 |
| **LB-6** | **Customer-facing WS-1.2 — wire 11 dead in-page anchors (`#features` / `#how-it-works` / `#tracking`) to real sections** | All 11 anchor links resolve. Playwright `landing.spec.ts` asserts navigation to each anchor produces `scrollTop > 100`. Owner-decided naming/IDs documented in PR. See [`CUSTOMER-FACING-PLAN.md § 2.2`](CUSTOMER-FACING-PLAN.md). | **AGENT** (bundled with LB-5 in one PR) | ~15 min agent session | — |

**Total finite launch surface:** 1 production-incident + 5 launch-blockers = **6 closeable items.** Three are owner-only credential/permission acts (PI-1, LB-1, LB-4); one is owner-only template approval bundled with a production e2e (LB-2); **two are agent-only with a trivial owner env-var input (LB-5, LB-6)**. The agent now has an actionable launch-blocker queue.

### 2.3 POST-LAUNCH — 7

Real work; not launch-gating. Per Convention A, follow-up issues default here; promotion requires explicit owner decision matching the hard test.

| # | Item |
|---|---|
| [#169](https://github.com/cargotapan-collab/tac-express/issues/169) | LOCATE tracking-[0.3em] → token |
| [#151](https://github.com/cargotapan-collab/tac-express/issues/151) | `as unknown as` cleanup in apps/web/proxy.ts |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | App-layer immutability sentinel for whatsapp_sends |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery-callback webhook |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated WhatsApp retry job |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | ServiceLevel branded type at data-layer |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | regex-alternation LAW gate |

Plus the visual-snapshot baselines for apps/web (deferred follow-up to PR #172 + #177).

### 2.4 POST-LAUNCH-SECURITY — 3 (Tier 3, leave OPEN for human review)

Per the autonomous-run policy: security-sensitive sweeps get their own PRs, kept OPEN for human security review, never auto-merged.

| # | Item |
|---|---|
| [#158](https://github.com/cargotapan-collab/tac-express/issues/158) | request-signing sweep across state-changing dashboard API routes |
| [#157](https://github.com/cargotapan-collab/tac-express/issues/157) | TOCTOU race in retryWhatsappSend |
| [#154](https://github.com/cargotapan-collab/tac-express/issues/154) | RBAC auth-error handling sweep (OD-1: promotable to LB if owner reclassifies) |

### 2.5 WONTFIX-WATCH — 2

| ID | Item | Re-evaluate |
|---|---|---|
| X1 | Form variant canonical pick | 2026-08-16 |
| X2 | On-call schedule + escalation policy | 2026-08-16 |

---

## 3. Burn-down sequence (dependency-ordered)

```
PI-1 ──┬──> LB-2 (depends on PI-1's tables existing + template approval + WPBOX env)
       │
LB-1 ──┘  (independent — owner can run in parallel with PI-1)

LB-4 (independent — owner-only Supabase-dashboard verification)

LB-5 + LB-6 (independent — single agent PR; only owner input is the NEXT_PUBLIC_DASHBOARD_URL env-var setting on Vercel)
```

LB-3 closed 2026-05-19 (PR #179 supersedes #176).

**Critical-path estimate:** ~1 hour of owner work + Meta template-approval latency (external, typically 24–48h) + ~45 min agent session for WS-1 (LB-5 + LB-6 together). The launch verdict flips to READY once all 5 remaining items pass their done-criteria.

---

## 4. OWNER TASK list (consolidated; the only thing the owner needs to act on)

Numbered + copy-pasteable. Most urgent first.

### 4.1 🚨 PI-1 — Activate migration-deploy pipeline + run backfill (production-incident)

```text
# Step 1 — Generate a Supabase personal-access token:
https://supabase.com/dashboard/account/tokens  (scope: project:write)

# Step 2 — Set GitHub Actions secrets + variable:
Repository → Settings → Secrets and variables → Actions

  Secrets (new):
    SUPABASE_ACCESS_TOKEN = <the PAT>
    SUPABASE_DB_PASSWORD  = <production DB password from Supabase Dashboard → Project Settings → Database>

  Variables (new):
    MIGRATION_DEPLOY_ENABLED = true

# Step 3 — Trigger the one-time backfill:
gh workflow run migration-deploy.yml

# Step 4 — Verify in Supabase SQL editor (or Supabase MCP):
SELECT table_name FROM information_schema.tables
WHERE table_schema='public'
AND table_name IN ('contact_leads','whatsapp_sends');
-- BOTH rows must appear.
```

### 4.2 🚀 LB-1 — Run SB-2 Sentry alert provisioning (~20 min)

```text
# Step 1 — Generate a Sentry user-auth token at
https://de.sentry.io/settings/account/api/auth-tokens/
(scope: project:write — a `sntryu_…` token covers this.)

# Step 2 — Run the canonical alert-rule script:
SENTRY_AUTH_TOKEN=sntryu_xxx node scripts/sentry/create-alert-rules.mjs

# Step 3 — Verify one rule fires end-to-end by tripping the synthetic event:
curl -X POST https://<deploy>/api/diagnostics/sentry
# Then check Sentry MCP:
mcp__sentry__search_issues organizationSlug=tapan-cargo-az projectSlugOrId=javascript-nextjs query="api/diagnostics"
# A new issue must appear in the result.

# Step 4 — Update docs/runbooks/sentry-alert-rules.md § 5.3 with the
# actual notification channel used (email or Slack).
```

### 4.3 🚀 LB-2 — Activate PL-2b live notifications (after PI-1)

```text
# Step 1 — Set production env vars (Vercel / hosting provider):
SUPABASE_SERVICE_ROLE_KEY=<from Supabase Dashboard>
WPBOX_API_TOKEN=<from WPBox account>
WPBOX_USER_ID=<from WPBox account>
WPBOX_LEAD_NOTIFICATION_PHONE=918765432100   # team WhatsApp inbox, E.164 digits
# Optional overrides:
WPBOX_LEAD_TEMPLATE_NAME=lead_notification
WPBOX_LEAD_TEMPLATE_LANGUAGE=en

# Step 2 — Submit `lead_notification` WhatsApp template for Meta approval
# via WhatsApp Business Manager / WPBox / LeminAi UI. Template body:
#
#   New {{1}} lead — {{2}} ({{3}}).
#
#   Message: {{4}}
#
# Parameter mapping (positional):
#   {{1}} reason label, {{2}} name, {{3}} email, {{4}} first 200 chars of message body.
#
# Meta approval typically 24–48h.

# Step 3 — End-to-end verification (after PI-1 + steps 1–2):
# Submit /contact on production. Confirm:
#   - contact_leads row exists with notification_status='sent'
#   - WhatsApp message arrives on the configured number
#   - whatsapp_send_id resolves to whatsapp_sends row with status='sent'
```

### 4.4 ✅ LB-3 — CLOSED 2026-05-19

Run 4 applied the owner-chosen Option B (class-redirect + typography-preserved) across all 4 sites:
- pricing "Most popular" badge → `tac-mono-label-base` + `text-primary-foreground`
- /track/[awb] AWB number + not-found echo + helper text → `text-foreground` family
- landing-mobile testimonial "TAC Express" → inherit parent `text-foreground`
- footer region chips → `tac-mono-label` (inherits the brighter `--primary-mono-label`)
- wasteland-landing TH avatar + metric-card id badges → typography-only variant

`AXE_FAIL_ON_VIOLATIONS=1` in `.github/workflows/e2e-web.yml` gates regressions. No owner action remaining.

### 4.5 🛠️ LB-4 — Verify SB-3 prerequisites in Supabase dashboard

```text
# Open Supabase Dashboard → Project mdvnphbucrpspntrezmj.
# Confirm + tick the 4 fill-in blocks in
# docs/runbooks/DATABASE-RESTORE.md § 2:
#   P1 — Pro plan or higher (PITR requires Pro+)
#   P2 — PITR enabled + retention window confirmed
#   P3 — Daily backups visible in dashboard
#   P4 — Owner role on the project (recovery requires Owner)
```

### 4.6 🚀 LB-5 — Set `NEXT_PUBLIC_DASHBOARD_URL` on apps/web Vercel project (~2 min)

```text
# This single env-var set is the only owner input needed for LB-5.
# Without it, the agent's WS-1 PR cannot ship — the build-time fallback
# fails the build deliberately to prevent another localhost regression.

Vercel → Project: apps/web → Settings → Environment Variables → Add:

  Key:    NEXT_PUBLIC_DASHBOARD_URL
  Value:  https://dashboard.tacexpress.com         # production
          (or the verified production dashboard hostname)
  Env:    Production + Preview + Development (all 3)

# After setting: trigger a redeploy to pick the value up, OR let the
# next WS-1 PR's CI build verify the env is visible.
```

LB-6 has no owner action — it ships in the same PR as LB-5 and only needs the agent's section-id assignments + Playwright assertions.

### 4.7 📋 Housekeeping (not launch-gating, but tidies the tracker)

```text
# Per prior-session audits + this reconciliation:

# Reopen #94 OR accept as tracker-less DoD item — issue closed prematurely
# 2026-05-15; owner-runnable work still remains (LB-1 above).
gh issue reopen 94
# OR — record in DoD: "SB-2 surfaces as tracker-less DoD item by owner choice."

# Close #167 (autonomous-run tracking issue) once launch-ready.
# (Leave OPEN for now — it's the ledger.)

# OD-1 — Reclassify #154 (RBAC sweep)?  Lean: POST-LAUNCH-SECURITY.
# OD-2 — Reclassify the other 4 E1 flows?  Lean: payment-only sufficient.

# CodeRabbit billing — if relevant; previously flagged in PRs as a
# "payment past 72h" warning. Update payment method.
```

---

## 5. AGENT TASK list (sequenced)

| Order | Item | Pre-requisite | Estimate |
|---|---|---|---|
| 1 | **LB-5 + LB-6 — WS-1 customer-facing launch-blockers (single PR)**: replace `localhost:3001` hardcode with `NEXT_PUBLIC_DASHBOARD_URL` + wire 11 dead in-page anchors | Owner sets `NEXT_PUBLIC_DASHBOARD_URL` on apps/web Vercel project (§ 4.6) — ~2 min owner action | ~45 min agent session |
| 2 | ~~LB-3 follow-through~~ | ✅ DONE 2026-05-19 (PR #179) | — |
| 3 | Visual-snapshot baselines for apps/web (PL-4 follow-up) | Carve is contrast-stable as of 2026-05-19 (PR #179) — snapshots can be captured against current main | ~1 session |
| 4 | POST-LAUNCH burn-down (one PR per item: #130, #131, #143, #144, #145, #151, #169) | Launch DONE | per-item |
| 5 | Customer-facing WS-2 / WS-3 / WS-4 (POST-LAUNCH; see [`CUSTOMER-FACING-PLAN.md`](CUSTOMER-FACING-PLAN.md)) | Per-WS dependencies; mostly launch-DONE | per-WS |
| — | POST-LAUNCH-SECURITY (#154, #157, #158) | Launch DONE; leave OPEN for human review | n/a |

**The agent's launch-blocker queue now has order 1 (WS-1) as an actionable task.** LB-1 / LB-2 / LB-4 / PI-1 remain owner-only credential/permission work. See § 7.

---

## 6. Maintenance contract

This file is the rollup. Per-bar detail stays in `definition-of-done.md` and `product-launch-readiness.md`; they remain authoritative for the SB-N / PL-N / OD-P-N nomenclature and the per-item testable-done criteria.

When the unified picture changes (a launch-blocker promotes/demotes, a new production-incident surfaces, the verdict flips), update **this file's § 0–§ 4** first; the per-bar files cross-reference here.

The CI `Backlog references drift check` gate continues to guard `docs/backlog/production-readiness.md` reference integrity — that file remains the open-item ledger and is unchanged by this reconciliation.

---

## 7. PHASE 2 evaluation (last updated v1.2, 2026-05-19)

Brief: "If the first agent-task is small, self-contained, low-risk, and does NOT touch a money-flow or production-incident surface — execute it as a second PR this session. Otherwise STOP. Default to STOP."

**v1.0 (2026-05-18):** First agent-task was LB-3 follow-through, owner-gated on PR #176 review. PHASE 2 stopped.
**v1.1 (2026-05-19, Run 4 / PR #179):** LB-3 closed; remaining § 5 items were all owner-gated or POST-LAUNCH. PHASE 2 stopped.
**v1.2 (2026-05-19, this session):** Customer-facing reconciliation added LB-5 + LB-6 as agent-actionable. They are small (~45 min combined), self-contained (apps/web only), low-risk (UI fixes; no money-flow, no production-incident surface, no DB writes). **PHASE 2 candidate exists for the next session** — the WS-1 build session. This session (the playbook + plan session) does NOT execute the WS-1 build, because the brief explicitly restricts this session to playbook + plan + scan, no feature code. See [`CUSTOMER-FACING-PLAN.md`](CUSTOMER-FACING-PLAN.md).

**Next session's task:** WS-1 (LB-5 + LB-6 — one PR). [`docs/NEXT-SESSION-HANDOFF.md § 6`](../NEXT-SESSION-HANDOFF.md) names this.
