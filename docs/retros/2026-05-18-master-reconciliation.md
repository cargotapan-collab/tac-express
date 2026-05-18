# Retro — Master reconciliation (2026-05-18)

**PR:** TBD (this session — the master-plan PR).
**Type:** META — single PHASE-1 audit + reconciliation. Zero production code.
**Role:** PM + CTO + Full-Stack + UI/UX, simultaneously. PM/CTO primary.
**Branch:** `chore/master-reconciliation` from main `180b93a`.

---

## 1. TL;DR

The project's task picture had drifted across three parallel workstreams:

- **Engineering DoD** (`definition-of-done.md` v1.3) — said "SB-2 is the only gate; 1 of 4 remaining."
- **Product-launch readiness** (`product-launch-readiness.md`) — said "PL-1/2a DONE; PL-2b code-complete but infrastructure-blocked; PL-3/PL-4 verified."
- **Run-series outputs (#163–#177)** — surfaced **#174 (production-breakage)** + **#173 (WCAG AA fail on landing)**, both un-accounted in either authority file.

This session **reconciled all three into `docs/launch/MASTER-LAUNCH-PLAN.md`** — the new launch authority. The unified picture has **1 PRODUCTION-INCIDENT + 4 LAUNCH-BLOCKERS** = **5 finite, closeable items** between current state and launch. The agent-task burn-down queue is **empty** until owner inputs land — every Tier-1 item is gated on owner credentials, owner template approval, or an owner design call. **PHASE 2 STOPPED** by policy.

---

## 2. The reconciliation findings

### 2.1 #174 — production-incident verified (not previously in DoD)

Supabase MCP `list_tables` against `mdvnphbucrpspntrezmj` (region `ap-northeast-1`) returned 13 tables in `public`. Neither `contact_leads` NOR `whatsapp_sends` appeared. Both migrations were merged to main (in #168 and the earlier whatsapp-sends migration respectively) but never deployed to remote.

Consequence: `/api/contact` (the PL-2b customer-journey terminator) would 500 on first real submission. PL-2b was previously classified "code-complete; infrastructure-blocked" but the infrastructure gap was below the surface of either authority file.

**Reclassified:** PRODUCTION-INCIDENT (highest priority). The root-fix automation (`.github/workflows/migration-deploy.yml`) shipped in PR #175 and is now in main, but dormant — `vars.MIGRATION_DEPLOY_ENABLED` defaults `false` and the two required secrets aren't set. Activation is purely owner-side: 2 secrets + 1 variable + 1 `gh workflow run`.

### 2.2 #173 — WCAG AA landing-page contrast (escalated to LAUNCH-BLOCKER)

PR #176 (deliberately held OPEN for design review) demonstrates a token-scoped fix that brings landing-desktop + landing-tablet from 1 serious finding (9 nodes) → 0 serious. A wider scan during PR #176's verification surfaced 3 remaining serious nodes (landing-mobile, pricing badge, /track/[awb] AWB number). All same root cause family: violet-on-dark below 4.5:1.

**Reclassified:** LAUNCH-BLOCKER. WCAG AA non-compliance on the landing page is a credible-launch gate for enterprise B2B (OD-P1) — accessibility scanners are part of standard procurement.

### 2.3 SB-2 status (verified, unchanged)

Sentry MCP `search_issues organizationSlug=tapan-cargo-az projectSlugOrId=javascript-nextjs query="api/diagnostics"` returned **zero issues across project lifetime**. `is:unresolved lastSeen:-7d` returned **zero unresolved issues**. The synthetic event from the verification procedure has never fired. SB-2 remains the canonical "owner-runnable ~20 min" gate — verified, not assumed.

### 2.4 No new production breakages

The unresolved-issue scan returned empty. No active production error signal beyond the latent #174. Reassuring; also a reminder that without SB-2's alert plumbing in place, a real incident wouldn't notify the owner. SB-2 + the migration-deploy activation should both happen before live traffic hits the landing.

### 2.5 Workstream reconciliation outcome

| Source workstream | Outstanding items pre-reconciliation | Mapped to in master plan |
|---|---|---|
| Engineering DoD | SB-2 only | LB-1 |
| Product-launch readiness | PL-2b live-activation, contrast fix follow-up, visual snapshots | LB-2, LB-3, agent-task #2 |
| Run-series outputs | #174 production-breakage, #173 contrast scan, migration-deploy pipeline activation | PI-1, LB-3, OWNER ACTIONS § 4.1 |
| SB-3 P1–P4 prereqs (carry-forward) | Owner dashboard verification | LB-4 |

No workstream left unaccounted. Every open issue ranked. The launch surface is FINITE.

---

## 3. The 5 finite items

| ID | Item | Bucket | Owner / Agent | Est. |
|---|---|---|---|---|
| PI-1 | Activate migration-deploy pipeline + backfill 4 migrations | PRODUCTION-INCIDENT | OWNER | ~10 min |
| LB-1 | SB-2 Sentry alert provisioning | LAUNCH-BLOCKER (engineering) | OWNER | ~20 min |
| LB-2 | PL-2b live notification end-to-end | LAUNCH-BLOCKER (product) | OWNER | ~30 min after PI-1 + template approval |
| LB-3 | #173 contrast: design call + apply to 3 sites | LAUNCH-BLOCKER (product) | OWNER decides → AGENT executes | 1 owner session + 1 agent session |
| LB-4 | SB-3 P1–P4 prerequisites in Supabase dashboard | LAUNCH-BLOCKER (engineering) | OWNER | ~10 min |

Plus 7 POST-LAUNCH issues + 3 POST-LAUNCH-SECURITY (kept OPEN for human review) + 2 WONTFIX-WATCH — all documented in MASTER-LAUNCH-PLAN.md § 2.3–§ 2.5.

---

## 4. Bucket counts

| Bucket | Count |
|---|---|
| PRODUCTION-INCIDENT | 1 |
| LAUNCH-BLOCKER | 4 |
| POST-LAUNCH | 7 |
| POST-LAUNCH-SECURITY (Tier 3, leave OPEN) | 3 |
| WONTFIX-WATCH | 2 |
| META (#167 tracking issue) | 1 |
| **TOTAL OPEN** | **18 (13 issues + 1 PR + 4 not-yet-issue items: LB-4, OD-1, OD-2, visual snapshots)** |

The LAUNCH-BLOCKER list is **closeable** — a reader can count 5 items and know exactly what stands between here and launch.

---

## 5. PHASE 2 — STOPPED

The brief's PHASE 2 trigger requires "the first agent-task on the burn-down sequence ... small, self-contained, low-risk ... NOT touching money-flow or a production-incident surface."

The first agent-task is **LB-3 follow-through** (apply owner-chosen contrast approach to 3 sites + flip `AXE_FAIL_ON_VIOLATIONS=1`). It is **owner-gated** on PR #176 review. The agent cannot start it.

No alternative trivial first agent-task exists on the LAUNCH burn-down. Tier 2/POST-LAUNCH items are explicitly **not** on the launch burn-down per the brief.

**Default-STOP fires.** This session ships PHASE 1 only.

---

## 6. Discipline observations

### 6.1 The brief's anti-pattern catalog held

The brief warned about four temptations:
1. **Start building during PHASE 1** — resisted; no production code touched.
2. **Open-ended wish-list** — resisted; the LAUNCH-BLOCKER list is finite (5 items) and each has a testable done-criterion.
3. **Declare launch-ready without evidence** — resisted; verdict is BOOLEAN NOT READY, with Sentry-MCP + Supabase-MCP evidence on the verifiable claims.
4. **Bundle unrelated fixes** — resisted; this PR ships the plan + 4 doc files (master plan, AGENTS.md update, 2 per-bar cross-references, retro, handoff). No source code.

### 6.2 The bailout clause didn't fire

The reconciliation was clean: 3 workstreams, 14 PRs, 13 issues — all reconciled into a single list. No "these N areas need owner clarification" caveat needed. The audit was complete.

### 6.3 Surprising-but-not-bailout finding

The DoD said "1 gate remaining — SB-2." That was true *for the engineering bar in isolation*. With the product bar + the Run-series outputs reconciled in, the gate count is 5. The DoD's "1 gate remaining" framing was structurally honest (it scopes to engineering) but had drifted out of sync with the actual launch picture once #174 surfaced. **The fix isn't to expand DoD — it's to have a higher-level rollup that knows about all three workstreams.** Hence MASTER-LAUNCH-PLAN.md.

### 6.4 "The offer is the smell" — applied to expansion temptations

Tempting expansions during PHASE 1 (rejected each time):
- "While I'm here, also close #169" — that's POST-LAUNCH; not a launch-blocker; opening it expands scope.
- "While I'm here, fix #154 RBAC" — security-sensitive; explicit Tier 3 per policy; would auto-merge by mistake.
- "While I'm here, ship visual snapshots" — heavy infra, owner verification needed.
- "While I'm here, run SB-2" — owner-only per do-NOT list #4 of the handoff.

Each "while I'm here" was specifically the smell. None acted on.

---

## 7. Files changed

```
NEW   docs/launch/MASTER-LAUNCH-PLAN.md     # the reconciled launch authority
NEW   docs/retros/2026-05-18-master-reconciliation.md  # this file
EDIT  AGENTS.md                              # register master plan as launch authority
EDIT  docs/launch/definition-of-done.md      # cross-reference to master plan
EDIT  docs/launch/product-launch-readiness.md  # cross-reference to master plan
EDIT  docs/NEXT-SESSION-HANDOFF.md           # replaced with master-plan-rooted version
```

Zero application source touched. Zero migration touched. Zero CI workflow touched.

---

## 8. OWNER ACTIONS — before next session

Per Convention B. Numbered. Copy-pasteable. Most-urgent first.

**1. 🚨 PI-1 — Activate migration-deploy + backfill 4 migrations (production-incident, ~10 min):**

```bash
# Tokens
# - PAT from https://supabase.com/dashboard/account/tokens (scope: project:write)
# - DB password from Supabase Dashboard → Project Settings → Database

# GitHub Actions → Settings → Secrets and variables → Actions
# Secrets:    SUPABASE_ACCESS_TOKEN, SUPABASE_DB_PASSWORD
# Variables:  MIGRATION_DEPLOY_ENABLED = true

gh workflow run migration-deploy.yml
# Then verify both tables exist on remote:
mcp__supabase__list_tables project_id=mdvnphbucrpspntrezmj schemas=["public"]
```

**2. 🚀 LB-1 — Run SB-2 Sentry alert provisioning (~20 min):**

```bash
# Sentry user-auth token from https://de.sentry.io/settings/account/api/auth-tokens/
SENTRY_AUTH_TOKEN=sntryu_xxx node scripts/sentry/create-alert-rules.mjs
# Trip the synthetic event:
curl -X POST https://<deploy>/api/diagnostics/sentry
# Confirm via Sentry MCP: search_issues query="api/diagnostics" must return a new issue.
# Update docs/runbooks/sentry-alert-rules.md § 5.3 with the channel used.
```

**3. 🚀 LB-2 — Activate PL-2b live notifications (after PI-1 + Meta template approval):**

```text
# Set production env vars: SUPABASE_SERVICE_ROLE_KEY, WPBOX_API_TOKEN,
# WPBOX_USER_ID, WPBOX_LEAD_NOTIFICATION_PHONE (E.164 digits).
# Optional: WPBOX_LEAD_TEMPLATE_NAME, WPBOX_LEAD_TEMPLATE_LANGUAGE.

# Submit `lead_notification` WhatsApp template for Meta approval.
# Body template + parameter mapping in MASTER-LAUNCH-PLAN.md § 4.3 + product-launch-readiness.md § J.6.

# After approval: submit a test lead on production /contact.
# Confirm contact_leads row + WhatsApp delivery + status='sent'.
```

**4. 🛠️ LB-3 — Decide on #173 contrast approach (review PR #176):**

```text
# Read PR #176 demo. Decide between:
#   A) Token-scoped (extend --primary-mono-label)
#   B) Class redirect (drop tac-mono-label from bg-primary contexts)
#   C) Per-site shim (inline brighter color on 3 selectors)
# Comment on PR #176 with the decision; agent applies in a follow-up session.
```

**5. 🛠️ LB-4 — Verify SB-3 P1–P4 prerequisites in Supabase dashboard:**

```text
# Tick the 4 fill-in blocks in DATABASE-RESTORE.md § 2:
#   P1 Pro plan · P2 PITR enabled + retention · P3 daily backups · P4 Owner role
```

**6. Housekeeping (not launch-gating):**

```text
# - Reopen #94 OR record SB-2 as a tracker-less DoD item.
# - Decide OD-1 (#154 promote to SHIP-BLOCKER? lean POST-LAUNCH-SECURITY).
# - Decide OD-2 (other 4 E1 flows promote? lean payment-only sufficient).
# - Close #167 (autonomous-run tracking issue) once launch-ready.
# - CodeRabbit billing — pay pending invoices if any.
```

**6 owner actions.** Items 1–5 are the FINITE launch surface; item 6 is tracker tidying. After 1–5, the launch verdict in MASTER-LAUNCH-PLAN.md § 0 flips to **READY**.
