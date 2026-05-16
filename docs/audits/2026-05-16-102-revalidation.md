# Re-Validation of #102 Against Current Main

**Date:** 2026-05-16
**Validating against:** main at `c49e6b6` (post-PR #135 audit_logs adoption)
**#102 last edited:** 2026-05-15 (PR #101 filed it)
**Drift surface:** ~35 PRs merged since #102 was filed; the parent issue's checkboxes have not been edited in-place; tick state is therefore a snapshot from 2026-05-15 supplemented by 6 progress comments.
**Authors prior:** PR #126 maximum-sweep + PR #133 audit_logs PHASE-0 both surfaced #102 staleness in passing. This document is the systematic pass.
**Out of scope this document:** doing any open #102 item. Re-validation only.

---

## 0. TL;DR

| Verdict bucket | Count | % of 32 checkboxes |
|---|---|---|
| DONE-AND-TICKED (accurate) | 1 | 3% |
| DONE-BUT-UNTICKED (shipped; owner must tick) | 16 | 50% |
| GENUINELY-OPEN-AND-REAL (carry forward, re-rank) | 11 | 34% |
| STALE-RENOUNCE (references non-existent / superseded) | 2 | 6% |
| WONTFIX-STILL-VALID (per CLAUDE.md § 6) | 2 | 6% |

**Tick-state accuracy:** 1/17 (6%) of items whose work has actually shipped are currently ticked. The other 16 require owner tick.

**Stale lines:** 2 (both already renounced in the 2026-05-16 PR #126 comment on #102; this document re-confirms and adds a third partial: the "as unknown as casts" item names 4 files, 3 of which are cleaned; the 4th remains).

**WONTFIX deferrals:** both still valid; trigger conditions unchanged.

**Out-of-scope items:** all 5 still hold; no design/policy change since 2026-05-15 makes any of them relevant.

**Bailout did not fire.** All 37 items (32 checkboxes + 5 out-of-scope, of which 2 of the checkboxes are also WONTFIX) verdicted.

---

## 1. Verdict table — Immediate (4 items)

| # | Item (abbreviated) | Verdict | Evidence (stable refs) |
|---|---|---|---|
| 1 | Update PRODUCTION-RUNBOOK.md | DONE-AND-TICKED | PR #101 |
| 2 | Add `/api/health` endpoint | DONE-BUT-UNTICKED | `apps/dashboard/app/api/health/route.ts` exists. PR #103. |
| 3 | Fix 5 production bugs Sentry surfaced (#93) | DONE-BUT-UNTICKED | Issue #93 CLOSED. |
| 4 | `INVOICE_PDF_SIGNING_SECRET` hex-format validation | DONE-BUT-UNTICKED | `packages/services/src/pdf/invoice-pdf-token.ts` :: regex `/^[0-9a-f]{64}$/i`. Code shipped pre-arc. |

---

## 2. Verdict table — Sprint 1 (11 items)

### Test coverage floor

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 5 | Unit tests for `payment.service.ts` | DONE-BUT-UNTICKED | `packages/services/src/__tests__/payment.service.test.ts` (29+ cases, expanded in PR #135). PR #118. |
| 6 | Unit tests for `record_invoice_payment` RPC (JS-side) | DONE-BUT-UNTICKED | Same file — covered via PaymentMethod sentinel + RPC decision-tree cases. PR #118. RPC SQL-semantics out of scope (Sprint 2; not promised). |
| 7 | Unit tests for `invoice.service.ts` | DONE-BUT-UNTICKED | `packages/services/src/__tests__/invoice.service.test.ts` (40+ cases, expanded in PR #135). PR #123. |
| 8 | Unit tests for `packages/auth/*` (session, withRole, RBAC) | DONE-BUT-UNTICKED | `packages/auth/src/rbac.test.ts`, `rbac-instrumentation.test.ts`, `sign-out-reason.test.ts`. PR #106. |

### Observability

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 9 | Wire Sentry alert rules (#94) | GENUINELY-OPEN-AND-REAL (PARTIAL — script-side done, owner-runnable provisioning remains) | Script-side complete: `scripts/sentry/canonical-rules.mjs` ships 6 rules; `scripts/sentry/lint-alert-rules.mjs` gates structure. Owner-runnable provisioning: `docs/runbooks/sentry-alert-rules.md § 5.3` (7-step procedure). Issue #94 still OPEN by design (owner task). |
| 10 | WhatsApp delivery audit table + retry path (`whatsapp_sends`) | GENUINELY-OPEN-AND-REAL | NO `whatsapp_sends` table in `supabase/migrations/`. NO references in `packages/`. Genuinely unaddressed. |
| 11 | Replace `console.*` with pino in 3 named routes | DONE-BUT-UNTICKED | All 3 routes (`send-invoice`, `diagnostics/sentry`, `public/invoice-pdf`) import logger; `grep -c "console\." = 0` in all 3. Sentinel at `apps/dashboard/__tests__/api-routes-no-console.test.ts`. PR #117. |

### CI/CD hardening

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 12 | `pnpm audit --production` job in architecture-gates.yml | DONE-BUT-UNTICKED | `.github/workflows/architecture-gates.yml :: npm-audit` job. PR #105 + #108 (load-bearing). |
| 13 | Enable Dependabot | DONE-BUT-UNTICKED | `.github/dependabot.yml` exists. PR #105. |

### Code health

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 14 | Cleanup `as unknown as` casts (4 sites named) | DONE-BUT-UNTICKED-PARTIAL → recommend SPLIT-TICK | 3 of 4 sites cleaned by PR #128: `ops-console/finance/create/ops-create-invoice-live.tsx`, `proxy.ts`, `track/[awb]/page.tsx` (the latter shipped a `serviceLevel?: string` widening; the proper branded type is tracked separately as [#131](https://github.com/cargotapan-collab/issues/131)). 1 cast remains: `apps/dashboard/app/api/public/invoice-pdf/route.ts` :: `headerBuffer as unknown as string`. Recommend: re-issue the 4-item list as a 4-checkbox group in the rewrite — 3 ticked, 1 open. |
| 15 | Document or archive orphaned UI components | DONE-BUT-UNTICKED + RENOUNCED-SUB-ITEM | 4 of 5 named components archived: `packages/ui/src/components/composed/_archive/2026-05-16/{dashboard-header,lottie-hero,marquee,text-matrix-rain}.tsx` + README documenting the archive. PR #127. The fifth sub-bullet — "7 dashboard cards" — RENOUNCED in PR #126 comment on #102: cards are LIVE behind the `tac-design` v7 flag; archive README documents the exclusion. |

---

## 3. Verdict table — Sprint 2 (9 items)

### E2E coverage for critical flows

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 16 | E2E happy path for payment recording (POST + assert) | GENUINELY-OPEN-AND-REAL | `find e2e apps/dashboard/e2e -name "*.spec.ts"` returns 7 specs; none cover payment. Only `public-tracking.{a11y,smoke,visual}.spec.ts` + dashboard's `a11y`, `print`, `visual/baseline`, `regression/phase-r0`. |
| 17 | E2E for full shipment creation wizard (steps 2-4) | GENUINELY-OPEN-AND-REAL | No spec named for shipment wizard. |
| 18 | E2E for full manifest creation with bulk shipment select | GENUINELY-OPEN-AND-REAL | No spec named for manifest wizard. |
| 19 | E2E for role-based RLS isolation (warehouse cross-hub) | GENUINELY-OPEN-AND-REAL | No multi-user RLS E2E spec exists. |
| 20 | E2E for exception lifecycle (create / escalate / resolve) | GENUINELY-OPEN-AND-REAL | No exception spec. |

### Service layer test coverage

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 21 | Unit tests for `shipment.service.ts` | DONE-BUT-UNTICKED | `packages/services/src/__tests__/shipment.service.test.ts` (50 cases). PR #132. |
| 22 | Unit tests for `manifest.service.ts` | GENUINELY-OPEN-AND-REAL (PARTIAL — narrow audit surface only) | `packages/services/src/__tests__/manifest.service.test.ts` exists (PR #135) — 179 LoC covering ONLY the `removeShipmentFromManifest` audit surface (6 cases). The full surface (~9 other methods: getManifests, getManifestById, getManifestShipments, createManifest, addShipmentToManifest RPC-or-fallback decision tree, closeManifest, departManifest, arriveManifest, reconcileManifest) is UNCOVERED. |
| 23 | Unit tests for `whatsapp.service.ts` | GENUINELY-OPEN-AND-REAL | `packages/services/src/whatsapp.service.ts` exists (532 LoC); NO test file. Zero coverage on an 18KB external-integration service. |

### Form pattern alignment

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 24 | Pick canonical form variant per domain | WONTFIX-STILL-VALID (per CLAUDE.md § 6.1) | Trigger conditions (design freeze, blocked wizard PR, roadmap target, brainstorming spec) all unfired. Last reviewed 2026-05-16; re-evaluate 2026-08-16. |

---

## 4. Verdict table — Backlog (8 items)

### Runbook gaps

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 25 | PITR / database restore playbook | GENUINELY-OPEN-AND-REAL | `docs/PRODUCTION-RUNBOOK.md` mentions PITR as a checklist item (line ~86) but no procedure. `docs/PRODUCTION-READINESS-REPORT-2026-05-15.md § 174` confirms "No `DATABASE-RESTORE.md` for PITR scenarios." No `DATABASE-RESTORE.md` in `docs/runbooks/`. |
| 26 | Upstash Redis outage runbook entry | GENUINELY-OPEN-AND-REAL | No `docs/runbooks/redis-outage.md` or equivalent. Existing runbook doesn't address the fails-open scenario. |
| 27 | On-call schedule + escalation policy | WONTFIX-STILL-VALID (per CLAUDE.md § 6.2) | Still solo-owner; no real 24/7 incident; Sentry rule 6 hasn't fired 3× in 30 days. Re-evaluate 2026-08-16. |
| 28 | Live monitoring dashboard links in PRODUCTION-RUNBOOK.md (Sentry, Vercel, Supabase, Upstash) | GENUINELY-OPEN-AND-REAL | `grep "grafana\|monitoring dashboard\|live monitoring"` in runbook returns 0 dashboard URLs. Only `UPSTASH_REDIS_REST_URL=` env var entry. |

### Audit / governance

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 29 | `audit_logs` table for destructive operations | DONE-BUT-UNTICKED | PRs #133 (infrastructure) + #135 (adoption). All 3 destructive ops (`deletePayment`, `cancelInvoice`, `removeShipmentFromManifest`) wired via `withAudit`. Sentinels active. Migration `20260516000001` + `20260516000002`. Risk-rank #1 fully discharged. **Item parenthetical "manifest revert" is STALE — the real op is "manifest shipment-removal"**; the rename was reconciled in migration `20260516000002`. |
| 30 | Document WhatsApp rate-limit bucket scope via JSDoc on each export | GENUINELY-OPEN-AND-REAL | `grep "@bucket\|rate-limit.*bucket"` in `whatsapp.service.ts` returns 0 hits. No JSDoc bucket scope documentation. |

### Documentation hygiene

| # | Item | Verdict | Evidence |
|---|---|---|---|
| 31 | Archive session-scratchpad files (`AUDIT-FIXES-PLAN-2026-05-14.md`, `NEXT-SESSION-HANDOFF.md`, `SESSION-RETRO-2026-05-14.md`) | DONE-BUT-UNTICKED + RENOUNCED-SUB-ITEM | 2 of 3 archived to `docs/_archive/2026-05-14/` (AUDIT-FIXES-PLAN + SESSION-RETRO). PR #127. The third — `NEXT-SESSION-HANDOFF.md` — RENOUNCED in PR #126 comment on #102: promoted to load-bearing cross-session protocol artifact; archive README at `docs/_archive/2026-05-14/README.md` documents the exclusion. |
| 32 | Create `docs/RELEASE-CHECKLIST.md` | GENUINELY-OPEN-AND-REAL | File does not exist. |

---

## 5. Verdict table — Out of scope (5 items)

All 5 STILL-OUT-OF-SCOPE; no in-arc work touches them; the deferral framings hold against current main.

| # | Item | Verdict |
|---|---|---|
| 33 | Performance / Lighthouse audit | OUT-OF-SCOPE-STILL-VALID |
| 34 | Comprehensive WCAG audit | OUT-OF-SCOPE-STILL-VALID (`e2e/a11y.spec.ts` still subset) |
| 35 | i18n infrastructure | OUT-OF-SCOPE-STILL-VALID |
| 36 | Mobile / responsive VRT | OUT-OF-SCOPE-STILL-VALID (VRT still desktop-only) |
| 37 | Cost optimization | OUT-OF-SCOPE-STILL-VALID |

---

## 6. Re-risk-ranking of GENUINELY-OPEN-AND-REAL items

11 open items. Re-ranked against current main, not the 2026-05-15 strategic-plan snapshot. The 2026-05-15 plan had `audit_logs` at rank #1; that is now discharged. The PRs that shipped through the arc have also changed the relative risk landscape (e.g., the service-test-floor pattern is mature; adding the next floor is now a well-understood unit of work, lowering its execution risk while leaving its absence-cost risk intact).

| Rank | Item | Risk-of-decay (one-line) | Effort | Open-cost compounding? |
|---|---|---|---|---|
| **1** | **#23 Unit tests for `whatsapp.service.ts`** | 532 LoC external integration with 0% test coverage; behavior drift in WhatsApp delivery, kill-switch, templates, signing — each business day adds another set of in-flight invoices processed through unverified code. WhatsApp also processes financial-adjacent records (invoice sends). | ~1 session (possibly 2 per the prior handoff — bailout-seam candidate at the natural functional split). | YES |
| **2** | **#10 WhatsApp delivery audit table (`whatsapp_sends`)** | Same shape as the discharged `audit_logs` risk — zero record of delivery attempts means no forensic capability when a WhatsApp send fails (or appears to). Sequencing dependency: best built ON TOP OF whatsapp.service.ts tests (#1 above), because adding audit wiring to an untested 18KB service is harder than to a tested one. | ~1 session. Schema migration + audit hook + tests. | YES |
| **3** | #9 Sentry alert-rule notification action (#94 owner-runnable) | Sentry events arrive but no notification fires until owner runs the 5-min procedure. Each unaddressed-but-tracked Sentry-eligible incident is a delayed-detection cost. **Owner task; not agent-actionable.** | 5 min owner. | YES (asymptotically — Sentry events keep arriving) |
| **4** | #22 `manifest.service.ts` full test floor | 9 currently-uncovered methods on the 7.3KB service; the narrow audit surface is covered. Internal-only service, status-transition-heavy — lower behavior-drift risk than WhatsApp, but PR #132/#135 test-floor pattern makes this a well-understood ~1-session unit of work. | ~1 session. Mirror PR #132 pattern. | LOW — internal status-transition methods change less than external integration code |
| **5** | #14 (sub-item) `as unknown as` cast at `apps/dashboard/app/api/public/invoice-pdf/route.ts` | 1 remaining cast site (3 of 4 cleaned in #128). Hides a type-system gap at a financial / public-tracking boundary. Low ongoing risk; the cast is a workaround for a known boundary in `@react-pdf/renderer`, not a latent bug. | ~30 min standalone, or fold into next PDF-touching PR. | LOW |
| **6** | #25 PITR / database restore playbook | No procedure for "Supabase project lost." Becomes risk-rank #1 the day a DB-loss incident happens; until then, a documentation gap. | ~1-2 hours. | LOW (until incident) |
| **7** | #26 Upstash Redis outage runbook | Rate-limit fails open; no documented response. Becomes risk-rank #1 the day Upstash has an outage. | ~30 min. | LOW (until incident) |
| **8** | #28 Live monitoring dashboard links in runbook | Friction during incident response (operator must hunt for URLs). Becomes risk during oncall, otherwise dormant. | ~15 min. | LOW |
| **9** | #30 WhatsApp rate-limit bucket JSDoc | Documentation gap. No behavior risk; readability / contributor onboarding improvement. | ~30 min. | LOW |
| **10** | #32 Create `docs/RELEASE-CHECKLIST.md` | Documentation gap. Useful if a "release" event happens (currently continuous deploy); the gap matters when a manual release becomes possible. | ~1-2 hours. | LOW (until release event) |
| **11** | #16-#20 E2E flows (5 items, grouped) | High aggregate scope (5 PRs); each individual flow's per-day risk is moderate (the user-visible paths have had no regressions caught in production), but the cumulative open-cost is the biggest unticked-item bucket. Each E2E flow ~1 session. | 5 sessions. | MODERATE |

### Risk-ranking observations

- **Items #1 + #2 are the live financial-adjacent risks remaining.** Audit_logs (just discharged) was the first half of "we record what destructive ops happened." WhatsApp service tests + `whatsapp_sends` audit table is the second half: "we record what external-side-effect-having ops happened." Same risk family.
- **Items #6 + #7 + #10 are conditional risks** — they don't compound daily; they become rank-#1 the day the triggering event happens (DB loss / Upstash outage / release event). They sit low in the ranking by per-day risk, but their tail-risk is high.
- **Items #15 (orphan UI) was DONE-BUT-UNTICKED before this re-validation, but its "7 dashboard cards" sub-bullet is RENOUNCED.** Not a re-rank item; just tick what was actually shipped.

---

## 7. Stale lines — formal renunciations

Two lines were RENOUNCED in the 2026-05-16 PR #126 comment on #102; this document re-confirms both and adds one PARTIAL renunciation.

### 7.1 RE-CONFIRMED (already renounced in PR #126 comment)

| Line | Reason | Anchor reference (stable) |
|---|---|---|
| "Document or archive orphaned UI components" — sub-bullet "7 dashboard cards" | Cards are LIVE behind the `tac-design` v7 flag. Reachable from `apps/dashboard/app/ops-console/ops-dashboard-live.tsx` when the flag resolves to `v7`. The 9 files in `packages/ui/src/components/composed/dashboard/` are the active v7 ops dashboard. | `packages/ui/src/components/composed/_archive/2026-05-16/README.md § "NOT in this archive"` |
| "Archive session-scratchpad files" — sub-bullet "NEXT-SESSION-HANDOFF.md" | Promoted to load-bearing cross-session protocol artifact during the 2026-05-15 → 16 arc. Read at session start; rewritten at session end. Archiving would break the cross-session pickup pattern. | `docs/_archive/2026-05-14/README.md § "What is NOT archived"` |

### 7.2 NEW RENUNCIATION (sub-item, partial)

| Line | Reason | Stable reference |
|---|---|---|
| "audit_logs table for destructive operations (invoice cancellation, payment deletion, **manifest revert**)" | The parenthetical "manifest revert" is STALE. The phantom-method PHASE-0 finding in PR #134/#135 confirmed `revertManifest` does not exist; the real destructive op is `removeShipmentFromManifest` and the CHECK constraint enum was reconciled in migration `20260516000002` to `manifest_shipment_remove`. The item itself is DONE; only the parenthetical needs an annotation. | `docs/decisions/2026-05-16-audit-logs-mechanism.md § 5.1` + `supabase/migrations/20260516000002_audit_logs_check_manifest_shipment_remove.sql` |

### 7.3 Recommended annotation style for the #102 body

Per the date-string-rot lesson from the prior session, annotations use STABLE permalinks to the README files (not date-string markers). Suggested:

> `~~7 dashboard cards~~ (RENOUNCED — see [archive README](packages/ui/src/components/composed/_archive/2026-05-16/README.md#not-in-this-archive); live behind tac-design v7 flag)`

> `~~NEXT-SESSION-HANDOFF.md~~ (RENOUNCED — see [archive README](docs/_archive/2026-05-14/README.md#what-is-not-archived); promoted to load-bearing protocol artifact)`

> `audit_logs table for destructive operations (invoice cancellation, payment deletion, ~~manifest revert~~ manifest shipment-removal) — DONE PRs #133 + #135; "manifest revert" was a placeholder for a method that didn't exist, reconciled to "manifest shipment-removal" per migration 20260516000002`

---

## 8. Next-task recommendation

### 8.1 Recommended next session: WhatsApp service test floor (Option B → now A)

The post-#135 handoff currently names `manifest.service.ts` full test floor as Option A. **This re-validation corrects that to `whatsapp.service.ts` test floor as the risk-correct lead.** Per the PR #132 review process note ("momentum-vs-risk must be a named, auditable decision every session, never a silent default"):

| Factor | manifest.service.ts (handoff's Option A) | whatsapp.service.ts (recommended) |
|---|---|---|
| Source size | 7.3KB | 18KB |
| Current coverage | Narrow audit surface (179 LoC test, 6 cases) | 0% (no test file) |
| External boundary? | NO (internal status transitions, manifest_shipments join, RPC-backed close) | YES (Meta WhatsApp Business API, kill-switch, templates, signing, rate-limit bucket) |
| Behavior-drift risk per day | LOW (status transitions are tight, well-understood, RPC-bounded) | HIGH (external API contract drift, financial-adjacent invoice sends) |
| Open-cost compounding | LOW | YES |
| Pattern precedent | Same as PRs #118/#123/#132 — well-understood | Same pattern; larger surface; may need bailout-seam at functional split |

**Risk verdict:** WhatsApp wins on every load-bearing factor. The handoff's `manifest.service.ts` was MOMENTUM-correct (natural next item after PR #135 created a narrow manifest test file), but RISK-incorrect by the same standard #133 used to override the prior handoff's momentum default.

### 8.2 Sequencing the WhatsApp family

The task brief named the sequencing fork explicitly:
- (A) `whatsapp_sends` audit table (rank #2 candidate)
- (B) `whatsapp.service.ts` test floor (foundation for A; the 18KB service A would wire into is 0%-tested)
- (C) `manifest.service.ts` test floor (momentum, lower risk)

Recommended order: **B → A → C**.

- **B first:** adding audit wiring (`whatsapp_sends`) to an untested 18KB external-integration service is the same shape as the prior session's risk pattern (wiring withAudit into 3 destructive ops would have been higher-risk without test floors first). PR #133/#135 had it easier — the three destructive ops were small and well-understood; WhatsApp is neither. Wait for tests.
- **A second:** with whatsapp.service tests in place, adding `whatsapp_sends` + audit-write becomes a known-shape adoption PR, mirroring PR #135's pattern. Will likely include a new destructive-op-registry entry IF the WhatsApp surface has audit-eligible destructive ops, OR a parallel `whatsapp_event_registry` IF the event types don't fit the destructive-op shape — PHASE-0 call at that PR's time.
- **C third (or skipped if no one screams):** `manifest.service.ts` full test floor is a comfortable known-shape session. Not urgent.

### 8.3 Bailout-seam pre-call for the WhatsApp test floor

The 18KB whatsapp.service.ts is ~3-4x the size of the largest prior service-test floor (`shipment.service.ts` at 9.2KB → 50 cases). The handoff and the task brief both anticipated a possible 2-PR split. Candidate seams (PHASE-A would refine):

- Seam 1: **delivery path** (send-invoice, send-template, retry, idempotency) vs **non-delivery surface** (kill-switch, templates registry, signing, webhook callbacks).
- Seam 2: **happy-path coverage** (all cases assuming the API works) vs **failure-path coverage** (rate-limit, network error, Meta API errors, kill-switch trip, signature mismatch).

Recommend the next session run PHASE-A on day 1, choose seam, and ship PR 1. PR 2 follows in a separate session per the cadence rule.

---

## 9. Forcing-function recommendation

### 9.1 The two options

**(a) Calendarized re-validation ritual** — add a "re-validate the master backlog" rule to CLAUDE.md that fires at every cadence shift (end of Sprint, every Nth merged PR, etc.). The agent (or owner) runs the equivalent of this document on a schedule.

**(b) Repo-mirrored backlog + sentinel** — mirror #102's item list into a tracked file (e.g., `docs/backlog/production-readiness.md`) using the same shape as `docs/audits/2026-05-15-rbac-denial-audit.md`. Extend the `apps/dashboard/__tests__/audit-doc-references.test.ts` sentinel pattern to verify every file/method/component the open items reference actually exists in main. The GitHub issue stays as discussion/tracking surface; the item list becomes sentinel-able. Drift fails CI.

### 9.2 Evaluation

| Criterion | (a) Calendarized | (b) Repo-mirror + sentinel |
|---|---|---|
| Upfront effort | ~30 min CLAUDE.md edit | ~1 focused session (~400-600 LoC sentinel + ~200-300 LoC mirror file + initial population) |
| Marginal per-cadence cost | ~1 session per re-validation (this session) | Zero — CI runs the sentinel on every PR |
| Failure mode if skipped | Same as today: backlog drifts unchecked | CI red, blocks merge |
| Human discipline dependent | YES (skippable; the very session that needs the re-validation is the one most likely to be optimizing for "ship the feature") | NO (mechanical) |
| Catches the failure modes this session corrected | Yes — IF the ritual is executed | Yes — mechanically. The 3 stale-reference failures (phantom revertManifest method, "7 dashboard cards" trap, `manifest_revert` placeholder) all reference named files/methods/components — exactly what the sentinel checks. |
| Catches NEW failure modes the discipline doesn't anticipate | More flexible (humans notice non-mechanical drift) | Limited to mechanical checks; complements rather than replaces the calendarized ritual |
| Precedent in repo | None | YES — `audit-doc-references.test.ts` is the exact pattern (PR #121, "Originating PR" per `docs/patterns/coderabbit-catalog.md § 5/6/7`) |
| Marginal cost to change a tracked item | Low (edit doc) | Low (edit doc; sentinel re-validates on next PR) |

### 9.3 Recommendation: option (b), backed by option (a) as transitional cover

**Implement (b).** The audit-doc-references sentinel is the proven precedent. The marginal effort is bounded by an existing pattern. The forcing function becomes mechanical instead of human-discipline-dependent. The very failure mode this session corrected (3 stale references over 4 sessions, all referencing named files/methods) is exactly what the sentinel would catch on the PR that introduces the drift.

The GitHub issue (#102) stays as the discussion / status surface for owner/contributor visibility. The repo-mirrored file becomes the source-of-truth for what each item references; the sentinel verifies those references against current main. Optionally: a separate sentinel asserts the GitHub issue body's item list is structurally in-sync with the mirror file (via `gh issue view`), so editing one without the other fails.

**During the transition** (between now and when (b) ships): adopt (a) informally. Run this same re-validation methodology at the start of any session that opens with "pick the next #102 item" — until the sentinel exists, the human-discipline ritual is the bridge.

### 9.4 Issue to file (this session, separate from this doc)

A follow-up issue titled "Repo-mirrored production-readiness backlog + drift sentinel (forcing function for #102)" with:
- The full scope (mirror file + extended sentinel pattern from `audit-doc-references.test.ts`)
- The "do not bundle" discipline marker
- The acceptance criteria (every open #102 reference is verifiable; drift fails CI)
- Cross-link to this document
- Estimated effort: 1 focused session (~500 LoC)

---

## 10. Discipline observations

### 10.1 The "re-validate don't fix" rule held

The session opened with the temptation to fix items as they were verified. Most tempting candidates:
- The remaining `as unknown as` cast at `invoice-pdf/route.ts` (30 min, mechanical)
- The missing `docs/RELEASE-CHECKLIST.md` (1-2 hours, doc work)
- The missing live-monitoring URLs in `PRODUCTION-RUNBOOK.md` (15 min, doc edit)

None were touched. The accuracy IS the deliverable; doing the work would have polluted the re-validation with "while I was re-validating I also …" claims that compound the audit-drift problem this session corrects.

### 10.2 The audit-the-audit found the smell at its source

Three stale-reference incidents over four sessions (phantom `revertManifest`, "7 dashboard cards", `manifest_revert` CHECK enum) were the trigger for this session. The re-validation found the underlying pattern: **the parent issue body has not been edited in-place since 2026-05-15**, while ~35 PRs have shipped against it. Progress comments accumulate, but tick state on the body itself stays frozen. The discipline (option-b sentinel) recommended above breaks that pattern by making the source-of-truth a file in the repo, not an immutable-by-convention GitHub issue body.

### 10.3 Two-day cadence rule unchanged

This session does not violate the one-PR-per-substantive-Sprint-2-session rule because this session is META, not substantive. It ships docs (this file + the handoff replacement + the #102 comment) and files one follow-up issue. Same shape as PR #126 (the maximum-sweep doc PR).

### 10.4 The next session's prompt should reference this document

Recommended one-liner: "Pick up the WhatsApp service test floor per `docs/audits/2026-05-16-102-revalidation.md § 8`. ONE PR (possibly 2 per the bailout-seam pre-call in § 8.3). Decline any 'while we're here' expansion."

---

## 11. Carry-forward

- **Owner action:** apply the corrected tick-list from the #102 comment that accompanies this PR. 16 items become DONE-AND-TICKED; 2 lines get strikethrough annotations.
- **Next session:** WhatsApp service test floor (per § 8). Risk-rank #1 of remaining items.
- **Forcing-function issue:** filed as a separate issue this session (per § 9.4); not bundled into any other work.
- **Re-validation cadence:** until the (b) sentinel ships, repeat this methodology at the start of any session whose first task is "pick the next #102 item." Mark the most recent re-validation date in CLAUDE.md so it's visible to the next agent.
