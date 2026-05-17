# Launch Re-frame Triage — Reconciliation + Bucketing

**Date:** 2026-05-17
**Validating against:** main at `1ff8bd5d` (post-PR #152 merge — WhatsApp failed-sends operator view).
**Supersedes (in framing, not data):** [`docs/audits/2026-05-16-102-revalidation.md`](2026-05-16-102-revalidation.md) — that document re-validated the parent #102 tracker against main; this document re-frames the project from maintenance-loop to launch-run.
**Pairs with:** [`docs/launch/definition-of-done.md`](../launch/definition-of-done.md) — the launch-scope authority synthesized from PHASE 3 below.

---

## 0. TL;DR

- **Tracker open issues:** 11 (verified via `gh issue list --state open --limit 50`).
- **Backlog file open items (no GitHub issue):** 8 — D1 D2 D3 D4 D5, E1 (5 sub-flows grouped), X1 X2 (both WONTFIX).
- **Total open work units triaged:** 19.

**PHASE 1 verdict counts:**

| Verdict | Count | Detail |
|---|---|---|
| FIXED-BUT-OPEN | 2 | #139, #140 — both fixed by PR #148, never closed |
| PARTIALLY-DONE | 1 | #142 — read half shipped in PR #152, retry half tracked as #153 |
| CLOSED-BUT-NOT-DONE | 1 | #94 — issue closed 2026-05-15 but the owner-runnable work remains (backlog O3) |
| INTENTIONALLY-CLOSED + stale-refs-in-backlog | 1 | #102 — closed 2026-05-16 when authority moved to `docs/backlog/production-readiness.md` (per AGENTS.md § 0); backlog file still lists `Tracker: #102` next to several items |
| GENUINELY-OPEN | 14 | 8 tracker issues (#130, #131, #143, #144, #145, #151, #153, #154) + 6 backlog-only (D1, D2, D3, D4, D5, E1) |
| STALE / SUPERSEDED | 0 | — |
| WONTFIX-STILL-VALID | 2 | X1, X2 (per CLAUDE.md § 6) |

**PHASE 2 triage counts (genuinely-open + the FIXED-BUT-OPEN / PARTIAL only carry into PHASE 2 if not closed; the rest carry as owner actions):**

| Bucket | Count | Items |
|---|---|---|
| **SHIP-BLOCKER** | **4** | **#153 (SB-1)**, **O3 / #94 (SB-2)**, **D1 (SB-3)**, **E1 payment-recording carve-out (SB-4)** |
| POST-LAUNCH | 13 | #130, #131, #143, #144, #145, #151, #154, D2, D3, D4, D5, E1 (other 4 flows), and the now-classified-PARTIAL #142 if it isn't closed |
| WONTFIX-WATCH | 2 | X1, X2 |
| OWNER-DECISION-REQUIRED | 2 | OD-1 (#154 promotion), OD-2 (other E1 flows promotion) |

**Bailout did NOT fire.** The tracker is not "far more divergent from main than the three known cases" — it's exactly the three known cases (#139, #140, #142) plus the #94/#102 backlog-pointer hygiene. Documentation alignment, not a re-validation crisis.

---

## 1. PHASE 1 — Reconciliation table

Every open tracker issue + every open backlog item, classified against main at `1ff8bd5d`.

### 1.1 Tracker issues (11 OPEN)

| # | Title (abbreviated) | True state on main | Verdict | Evidence |
|---|---|---|---|---|
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Promote regex-alternation grep (catalog #10) from doc to LAW gate | `scripts/check-regex-alternation.mjs` does NOT exist | GENUINELY-OPEN | `ls scripts/check-regex-alternation*` → no such file |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Brand `ServiceLevel` type at data-layer boundary | Type not branded; scope EXPANDED twice (PR #150 retro § 8.3; PR #152 retro § 9.3) | GENUINELY-OPEN | Issue body intact; scope-expansion notes in handoff |
| [#139](https://github.com/cargotapan-collab/tac-express/issues/139) | WAMID-null silent-rejection triggers redundant form-encoded fetch | FIXED on main — `shouldFallback` correctly includes the `semanticFailure` flag (PR #148) | FIXED-BUT-OPEN | `grep -nE "shouldFallback" packages/services/src/whatsapp.service.ts` → present at line 201, 208 |
| [#140](https://github.com/cargotapan-collab/tac-express/issues/140) | Empty-string `WPBOX_BASE_URL` produces relative fetch URLs | FIXED on main — `(config.baseUrl \|\| "https://chat.leminai.com")` (the `\|\|` coalesce handles empty string AND undefined; PR #148) | FIXED-BUT-OPEN | `packages/services/src/whatsapp.service.ts:162` |
| [#142](https://github.com/cargotapan-collab/tac-express/issues/142) | Operator retry UI for failed WhatsApp sends | PARTIAL — Option A read-half shipped in PR #152 at `/ops-console/whatsapp/failed-sends`; retry-action write-half tracked separately as #153 | PARTIALLY-DONE | Backlog W2 entry; #152 PR body; #153 issue body |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated background retry job for failed WhatsApp sends (W3) | Not started; needs job-runner PHASE-0 (no job-runner infrastructure on main today) | GENUINELY-OPEN | No `vercel-cron`, `inngest`, `pg_cron` references in repo |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta WhatsApp delivery-callback webhook (W4) | Not started; no public webhook endpoint for `delivered`/`read` callbacks | GENUINELY-OPEN | `grep -r "delivered\|whatsapp.*callback" apps/dashboard/app/api/whatsapp/` → none |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | Application-layer immutability sentinel for `whatsapp_sends` (W5) | Not started; pattern precedent at `audit-logs-no-update-delete.test.ts` | GENUINELY-OPEN | `ls packages/services/src/__tests__/whatsapp-sends-allowlist*` → no such file |
| [#151](https://github.com/cargotapan-collab/tac-express/issues/151) | `as unknown as` cleanup in `apps/web/proxy.ts` | Not started; ~30 min task | GENUINELY-OPEN | The 2 casts named in the issue body still present on main |
| [#153](https://github.com/cargotapan-collab/tac-express/issues/153) | W2 PR 2 — failed-sends retry action (filed last session) | Not started | GENUINELY-OPEN | `ls apps/dashboard/app/api/whatsapp/retry-send/` → no such dir |
| [#154](https://github.com/cargotapan-collab/tac-express/issues/154) | RBAC auth-error handling sweep (filed last session) | Not started | GENUINELY-OPEN | The `.catch(() => null)` pattern still present at all 4+ sites named in the issue body |

### 1.2 Backlog-only items (8 — no GitHub issue)

| ID | Title | True state | Verdict |
|---|---|---|---|
| O3 | Sentry alert-rule notification action (owner-runnable) | Script-side done (`scripts/sentry/{canonical,create,lint}-alert-rules.mjs` all exist); owner-runnable provisioning remains | GENUINELY-OPEN (despite tracker #94 being closed) |
| D1 | PITR / database restore playbook | No `docs/runbooks/DATABASE-RESTORE.md` | GENUINELY-OPEN |
| D2 | Upstash Redis outage runbook entry | No outage-response doc | GENUINELY-OPEN |
| D3 | Live monitoring dashboard URLs in `PRODUCTION-RUNBOOK.md` | `grep "grafana\|dashboard.*url" docs/PRODUCTION-RUNBOOK.md` → 0 URLs | GENUINELY-OPEN |
| D4 | WhatsApp rate-limit bucket JSDoc | `grep "@bucket" packages/services/src/whatsapp.service.ts` → 0 hits | GENUINELY-OPEN |
| D5 | `docs/RELEASE-CHECKLIST.md` | File does not exist | GENUINELY-OPEN |
| E1 | E2E flows (5 grouped: payment, shipment wizard, manifest wizard, RBAC RLS isolation, exception lifecycle) | `find apps/dashboard/e2e -name "*.spec.ts"` → existing specs cover only a11y / print / visual baseline / phase-r0 regression; none of the 5 named user flows | GENUINELY-OPEN |
| X1 | Pick canonical form variant per domain | No design freeze trigger fired | WONTFIX-STILL-VALID (CLAUDE.md § 6.1) |
| X2 | On-call schedule + escalation policy | Still solo-owner; no triggers fired | WONTFIX-STILL-VALID (CLAUDE.md § 6.2) |

### 1.3 Tracker-vs-backlog pointer divergence

| Item | Backlog says | Tracker says | Recommendation |
|---|---|---|---|
| O3 | OPEN, `Tracker: #94` | #94 CLOSED 2026-05-15 | Owner reopens #94 (recommended — gives the owner-runnable task a tracker) OR drop the `Tracker: #94` line and rely on backlog-only entry. SB-2 in DoD documents either way. |
| D1, D2, D3, D4, D5, E1, O1, O2 (all DONE), W1 (DONE) | `Tracker: #102` | #102 CLOSED 2026-05-16 (intentionally — moved to backlog file per AGENTS.md § 0) | Annotate backlog header that `Tracker: #102` references are historical pointers (the umbrella tracker is closed; the line item lives in this file). No need to update every per-item line; the per-item refs `block` is the source of truth. |

---

## 2. PHASE 2 — Triage table

The hard test (see [`docs/launch/definition-of-done.md § 1`](../launch/definition-of-done.md#1-the-hard-test-how-an-item-earns-ship-blocker-status)):

> If we launched tomorrow without this, would it cause data loss / security hole / money-flow error / broken core user journey / legal-or-contractual breach?

If the honest answer is NO → POST-LAUNCH (or WONTFIX-WATCH if "no, and only if a trigger fires").

### 2.1 SHIP-BLOCKER (4)

| ID | Item | Hard-test justification | DONE criterion |
|---|---|---|---|
| **SB-1** | [#153](https://github.com/cargotapan-collab/tac-express/issues/153) — failed-send retry action | **Broken core user journey** — operator owns invoice delivery; failed-send recovery without engineer requires the retry button. Read-only visibility (shipped PR #152) is half a journey. | `POST /api/whatsapp/retry-send` route + retry button in `FailedSendsTable`; MANAGER+ click produces new row with `attempt_no = N+1` |
| **SB-2** | [O3 / #94](https://github.com/cargotapan-collab/tac-express/issues/94) — Sentry alert provisioning | **Silent incident shape** — solo-owner production without alerting means money-flow errors fire to Sentry and the owner doesn't learn until a customer complains. | Owner runs `create-alert-rules.mjs`; one rule produces an end-to-end notification verified by deliberate trip |
| **SB-3** | D1 — PITR / database restore playbook | **Data loss recovery** — Supabase has PITR; the procedure to invoke it must be documented BEFORE the incident, not Googled DURING it. | `docs/runbooks/DATABASE-RESTORE.md` exists, names PITR, walks steps for both full-project and single-table restore, names an RTO target, notes a dry-run walkthrough |
| **SB-4** | E1 (payment-recording carve-out) | **Money-flow correctness** — payment recording is the most money-sensitive flow; unit tests cover the service layer but no E2E asserts the full submission → DB → UI round-trip works under auth + RLS + form-state. | `apps/dashboard/e2e/payment-recording.spec.ts` exists, runs in CI, asserts happy path + 1 validation-error path, idempotent cleanup |

### 2.2 POST-LAUNCH (13)

| Item | Why not SHIP-BLOCKER (against the hard test) |
|---|---|
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) regex-alternation LAW gate | Hygiene / tooling; prevents a class of future bug. No launch impact. |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) branded `ServiceLevel` cluster | The user-visible bug (Mode column rendering) is already FIXED in PR #128. Branding prevents future bugs of the same shape. |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) W3 — automated retry job | SB-1 ships operator-triggered retry. Automation is an enhancement when volume/burden makes manual retry painful. |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) W4 — Meta delivery-callback webhook | Current `queued/sent/failed` lifecycle is enough to drive the operator retry path. `delivered/read` is a customer-confirmation enhancement. |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) W5 — immutability sentinel for `whatsapp_sends` | Defense-in-depth; discipline already holds (wrapper never UPDATEs completed rows). Mechanizing this is hygiene. |
| [#151](https://github.com/cargotapan-collab/tac-express/issues/151) proxy.ts cast cleanup | 30-min hygiene; no behavior at risk. |
| [#154](https://github.com/cargotapan-collab/tac-express/issues/154) RBAC auth-error sweep | OWNER DECISION OD-1. Lean: workaround is a page refresh; doesn't meet the broken-irrecoverable-journey bar. |
| D2 — Upstash outage runbook | Rate-limit fails open IS deliberate. Documenting the response is hygiene. Not launch-gating. |
| D3 — monitoring dashboard URLs | 15-min sweep; reduces incident friction but the URLs are findable. Could be folded into SB-3 session as a freebie if convenient. |
| D4 — WhatsApp rate-limit bucket JSDoc | Pure docs; zero behavior risk. |
| D5 — `RELEASE-CHECKLIST.md` | Currently continuous deploy; matters only if manual-release event becomes possible. |
| E1 (the other 4 flows — shipment wizard, manifest wizard, RBAC RLS isolation, exception lifecycle) | OWNER DECISION OD-2. Lean: unit tests + manual QA + SB-2 Sentry alerting is defensible; no production regressions through 13+ PRs. |
| #142 (PARTIAL — recommended close per § 1.3) | If owner keeps it open and lets #153 carry the remainder, it goes POST-LAUNCH; if owner closes it, it disappears. |

### 2.3 WONTFIX-WATCH (2)

Per CLAUDE.md § 6, both still hold; re-evaluate 2026-08-16.

- **X1** — Pick canonical form variant per domain. Triggers: design freeze on v6 or v7; wizard PR blocked ≥ 1 session on variant choice; roadmap names target architecture state; `tac-brainstorming` produces spec.
- **X2** — On-call schedule + escalation policy. Triggers: team size ≥ 2 with shared production responsibility; first 24/7 incident; Sentry rule 6 fires ≥ 3× in 30-day window.

---

## 3. PHASE 3 — Definition of Done synthesis

Already crystalized in [`docs/launch/definition-of-done.md`](../launch/definition-of-done.md). Summary:

- **4 SHIP-BLOCKERS**, ordered: SB-1 (#153) → SB-3 (D1) → SB-4 (E1 payment) → SB-2 (#94, owner-async)
- **Realistic burn-down:** 3-4 sessions total
- **2 owner decisions** that could expand scope: OD-1 (#154), OD-2 (other E1 flows)
- **2 new conventions** added to AGENTS.md to stop the maintenance-loop regeneration:
  - **A** — follow-up issues default to POST-LAUNCH
  - **B** — OWNER ACTIONS block at the end of every handoff and every retro

---

## 4. Method note

This document was produced under the discipline of PHASE-0 → PHASE-1 → PHASE-2 → PHASE-3 with **zero production code** written. The temptation in PHASE 1 to fix #139 / #140 as they were verified (close the issues in this session) was declined per the brief's anti-pattern list — surfacing the closures as OWNER ACTIONS preserves the audit boundary between agent-discovery and owner-decision.

Same pattern precedent as [`docs/audits/2026-05-16-102-revalidation.md § 10.1`](2026-05-16-102-revalidation.md) ("re-validate don't fix" rule).
