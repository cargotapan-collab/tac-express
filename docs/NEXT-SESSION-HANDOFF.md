# Next-Session Handoff — Start Here

> **You are picking up TAC Express after a META re-validation session.** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** post-PR-#135 merge — `feat(audit): wire withAudit in 3 destructive ops + reconcile CHECK enum (#134)` (`c49e6b6`)
**This handoff written after:** PR #<TBD> (the docs PR shipping the 2026-05-16 #102 re-validation)
**Date this doc was written:** 2026-05-16 (fourth Sprint 2 session — META / consolidation, NOT substantive)
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer + Security-architect
**#102 risk-rank #1 status:** DISCHARGED (audit_logs, PRs #133 + #135)
**Re-validation status:** [`docs/audits/2026-05-16-102-revalidation.md`](audits/2026-05-16-102-revalidation.md) is the authoritative current accounting

---

## 0. REQUIRED PRE-READING

Before writing ANY code in a session, load these:

1. **[`docs/audits/2026-05-16-102-revalidation.md`](audits/2026-05-16-102-revalidation.md)** — the full per-item verdict table for #102 (32 checkboxes + 5 out-of-scope + 2 WONTFIX). §§ 6 (re-risk-ranking), 7 (renounced lines), 8 (next-task recommendation), 9 (forcing-function recommendation) are the load-bearing sections.

2. **[`docs/patterns/coderabbit-catalog.md`](patterns/coderabbit-catalog.md)** — 9 entries × 4 categories. Authoritative count is 9.

3. **[`docs/retros/2026-05-16-audit-logs-pr2-adoption.md`](retros/2026-05-16-audit-logs-pr2-adoption.md)** — PR #135 retro.

4. **[`docs/retros/2026-05-16-audit-logs-pr1-infrastructure.md`](retros/2026-05-16-audit-logs-pr1-infrastructure.md)** — PR #133 retro.

5. **[`docs/decisions/2026-05-16-audit-logs-mechanism.md`](decisions/2026-05-16-audit-logs-mechanism.md)** — the audit-logs PHASE-0 decision doc (Option C: hybrid withAudit + sentinel).

6. **[`docs/retros/2026-05-16-shipment-service-tests.md`](retros/2026-05-16-shipment-service-tests.md)** — PR #132 retro. Test-floor template.

7. **[`docs/retros/2026-05-15-2026-05-16-two-day-arc.md`](retros/2026-05-15-2026-05-16-two-day-arc.md)** — chapter-level retro covering the 16-PR arc.

Plus this file's § 1 (cadence pre-commit, still FIVE substantive PRs old — the META session does not advance the count).

---

## 1. CADENCE PRE-COMMIT (load-bearing — FIVE substantive PRs old)

**Status: HOLDS.** The cadence rule (one PR per substantive Sprint 2 session, no bundling) has survived five real tests (post-#129, PR #132, PR #132's session boundary, PR #133, PR #134/#135). The just-completed META re-validation session does NOT count as substantive Sprint 2 work — it ships docs + files one follow-up issue. Same shape as PR #126 (the maximum-sweep doc PR).

**The re-validation session also held the inverse discipline:** "while I'm re-validating this item I could just fix it" was resisted 3+ times (remaining `as unknown as` cast, missing `docs/RELEASE-CHECKLIST.md`, missing live-monitoring URLs). The accuracy IS the deliverable; doing the work would have polluted the re-validation with "while I was here…" claims that compound the audit-drift problem the session was correcting.

**Carry-forward for the next substantive session:** the re-validation in `docs/audits/2026-05-16-102-revalidation.md § 8` corrected the prior handoff's Option A (manifest.service.ts full test floor) to **`whatsapp.service.ts` test floor** as the risk-correct lead. See § 6 below for the full reasoning.

---

## 2. READ THIS FIRST — six things you must NOT do

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`.

2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been load-bearing since #108.

3. **Do NOT add Sentry tag keys without updating all four artifacts** (the cross-package tag-emission contract — see § 5.2).

4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner runs it locally with the auth token (#94, still pending).

5. **Do NOT regress to `console.*` in the three pino-migrated API routes.** Sentinel at `apps/dashboard/__tests__/api-routes-no-console.test.ts`.

6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 556 tests passing (post-#135)
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

Then in your agent harness:

```
1. Load skill: tac-express-onboarding
2. Open: .claude/skills/RESOLVER.md
3. Match your task to a specialist skill
4. Load that skill BEFORE writing code
```

---

## 4. Current state snapshot

### Open PRs (0)

Clean slate once the META re-validation PR merges.

### Open Issues — short list

| # | Title | Priority | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Verify + wire Sentry alert-rule notification action | P2 | 5-min owner action. Runbook § 5.3. |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta | **Re-validation authoritative: [`docs/audits/2026-05-16-102-revalidation.md`](audits/2026-05-16-102-revalidation.md)**. Owner action: apply the corrected tick-list (16 DONE-BUT-UNTICKED items) from the comment posted by this session's PR. |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | — | Own session. Do NOT bundle with #131. |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` type | — | Own session. Do NOT bundle with #130. |
| [#136](https://github.com/cargotapan-collab/tac-express/issues/136) | Backlog drift sentinel (forcing function for #102) | — | NEW — filed by this session's re-validation. Own session. Do NOT bundle. |

**Resolved during recent sessions:** #134 (audit_logs PR2 = PR #135), #133, #132, #128, #127, #123 (and many earlier).

---

## 5. Critical context (the things that will trip you up)

### 5.1 audit_logs adoption (post-#135) — the post-merge picture

(Unchanged from the prior handoff — see § 5.1 there.) The three destructive ops are wrapped via `withAudit`; the registry-coverage sentinel asserts per-method adoption; the no-update-delete sentinel closes the service_role bypass hole; migration `20260516000002` reconciled the CHECK enum to `manifest_shipment_remove`. `revertManifest` does NOT exist; if product later wants a manifest-wide revert, that's a separate feature issue.

### 5.2 Cross-package tag-emission contract — three-level enforcement (unchanged)

Levels: CI gate (`lint-alert-rules.mjs`), Vitest sentinel (`canonical-rules-tag-contract.test.ts`), runbook (`sentry-alert-rules.md § 4`). Adding any Sentry tag key requires updating all three plus the package-side `EMITTED_TAG_KEYS` constant.

### 5.3 Shared mock-db helpers (unchanged)

`makeDb` + `makeBuilderSpy` (with `range` from #133). Reused verbatim in #135. The audit-wrapped service tests added in PR #135 are a new template for "SELECT-first / audit-first / fail-loud" coverage; mirror them if you wire any new destructive op.

### 5.4 Six CI gates still load-bearing (unchanged)

`registry-check`, `governance`, `migrations-fresh-apply`, `npm-audit`, `alert-rule-lint`, `bundle-size`. Docs-only PRs (like this re-validation PR) may skip some via path filter — that's normal.

### 5.5 CodeRabbit pattern catalog (unchanged — 9 entries)

Authoritative count is 9 (the catalog's own `**Total: 9 entries**` line). Several prior handoffs said "12"; the discrepancy was an artifact-from-prompts not from any source-of-truth file, and is now extinct.

### 5.6 Test-pattern shift for audit-wrapped methods (unchanged from #135)

audit-wrapped methods do SELECT-first. Existing tests using `fromResults: { <table>: { data: null, error: null } }` will short-circuit before reaching the destructive op. Provide a row in the fixture. The `payment.service.test.ts :: throws on generic delete error AFTER the audit row is committed` case shows the per-call `mockImplementation` pattern when SELECT and DESTRUCTIVE need different results from the same table.

### 5.7 NEW: #102 has been re-validated; trust the audit doc, not the issue body's tick state

`docs/audits/2026-05-16-102-revalidation.md` is the authoritative accounting until the forcing function (#136) ships. The GitHub issue body's tick state is a 2026-05-15 snapshot supplemented by 6 progress comments; treating it as fact has caused 3 stale-reference incidents in the past 4 sessions.

---

## 6. Your first task — recommended (REVISED PER RE-VALIDATION)

Per the cadence pre-commit (§ 1) and the re-validation in `docs/audits/2026-05-16-102-revalidation.md § 8`. **The handoff's prior § 6 Option A (manifest.service.ts full test floor) is CORRECTED** to whatsapp.service.ts on risk grounds. Reasoning: see § 8.1 of the re-validation doc — every load-bearing factor (size, current coverage, external boundary, behavior-drift risk, open-cost compounding) puts WhatsApp ahead.

### Option A — `whatsapp.service.ts` test floor (REVISED RECOMMENDATION, risk-rank #1) RECOMMENDED

`packages/services/src/whatsapp.service.ts` is 18KB, 532 LoC, with ZERO test coverage. External integration (Meta WhatsApp Business API, kill-switch, templates, signing, rate-limit bucket). Financial-adjacent (processes invoice WhatsApp sends). Per-day behavior-drift risk is HIGH; the pattern (mirror PRs #118/#123/#132) is well-understood.

**Pre-call:** this service is ~3-4× the largest prior service-test floor. Bailout-seam candidate at the natural functional split (delivery path vs non-delivery surface, OR happy-path vs failure-path coverage). PHASE-A on day 1 chooses the seam; ship PR 1, file PR 2 issue, run PR 2 in a separate session.

Estimate: 1-2 sessions (per the prior handoff's anticipation and confirmed by the size-based re-validation).

### Option B — `whatsapp_sends` audit table (risk-rank #2, SEQUENCING DEPENDENT on Option A)

Same risk shape as the discharged `audit_logs` item — zero record of WhatsApp delivery attempts. Best built AFTER Option A so the audit wiring lands on a tested service. **Do not pick this before Option A.**

### Option C — `manifest.service.ts` full test floor (risk-rank #4 per re-validation, MOMENTUM choice from the prior handoff)

Lower per-day risk than WhatsApp (internal, status-transition-heavy). Comfortable known-shape session. Not urgent. Pick this if WhatsApp is blocked for some reason (it shouldn't be) OR if you need a confidence-building shorter session before tackling the larger whatsapp surface.

### Option D — #136 (backlog drift sentinel — forcing function)

The forcing-function follow-up filed by this session. Substantial scope (~500 LoC). Reduces the per-session re-validation burden for every subsequent session. Pick this if you want to amortize the prevention cost across the rest of Sprint 2; otherwise sequence it after Options A + B.

### Option E — #94 (5-min owner-runnable Sentry provisioning)

Not an agent task.

### Option F — #130 or #131 (small standalone tooling / type-infrastructure)

Each is its own session. Do NOT bundle. Lower aggregate risk than the WhatsApp family but useful when a smaller session window is available.

---

## 7. Cumulative discipline observations (carry-forward — required reading)

Distilled from PRs #105 → #135 plus this re-validation session.

### 7.1. PHASE-A / PHASE-0 docs ARE the load-bearing artifact (unchanged)

### 7.2. Forcing-function sentinel pattern (8 instances; #136 will add the 9th)

### 7.3. Bailout fires at per-line, per-PR, AND per-mechanism granularity (unchanged)

### 7.4. CodeRabbit findings are signal, not friction (unchanged)

### 7.5. Merge-phrase classifier is the system (unchanged)

### 7.6. Shared helpers extract on second use, not first (unchanged)

### 7.7. Cadence rule survives repeated tests (now FIVE substantive PRs old — § 1)

### 7.8. Schema-vs-service drift can be silent for unknown durations (unchanged)

### 7.9. Task prompts naming the bailout seam are a force multiplier (unchanged)

### 7.10. Issue-body-says-X-but-task-brief-overrides (unchanged from #135)

### 7.11. SELECT-first audit pattern shifts test fixtures (unchanged from #135)

### 7.12. NEW: Parent-tracker issue bodies drift unless mechanically gated

#102 demonstrated 50% tick-state inaccuracy after 35 PRs and 4 weeks of work. The GitHub issue body is immutable-by-convention; the codebase changes daily. Without a forcing function, every parent-tracker issue rots at roughly the same rate. The recommended mitigation: repo-mirror the item list + extend the audit-doc-references sentinel pattern. Filed as #136.

### 7.13. NEW: "Re-validate don't fix" is a discipline of its own kind

The META re-validation session resisted 3+ fix temptations (each ~30 min - 2 hours). The temptation IS the smell, in the same shape as the "while we're here" anti-pattern. The accuracy of the re-validation is the deliverable; fixing items mid-validation pollutes the verdict.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm vitest run apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/audit.service.test.ts
pnpm vitest run packages/services/src/__tests__/with-audit.test.ts
pnpm vitest run packages/services/src/__tests__/destructive-op-registry-coverage.test.ts
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts        # narrow audit surface only
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts            # PR #121; precedent for #136
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations

```
# Planning + retros + audits
docs/audits/2026-05-15-rbac-denial-audit.md           # PHASE-A reference (PR #114/#120)
docs/audits/2026-05-16-102-revalidation.md            # this session's deliverable
docs/retros/2026-05-16-shipment-service-tests.md      # PR #132
docs/retros/2026-05-16-audit-logs-pr1-infrastructure.md # PR #133
docs/retros/2026-05-16-audit-logs-pr2-adoption.md     # PR #135 (← prior latest)
docs/decisions/2026-05-16-audit-logs-mechanism.md     # PHASE-0 decision
docs/NEXT-SESSION-HANDOFF.md                          # ← this file
docs/runbooks/sentry-alert-rules.md

# audit_logs (fully wired; see prior handoff § 9)
supabase/migrations/20260516000001_audit_logs_destructive_op_hardening.sql
supabase/migrations/20260516000002_audit_logs_check_manifest_shipment_remove.sql
packages/services/src/shared/with-audit.ts
packages/services/src/shared/destructive-op-registry.ts
packages/services/src/__tests__/with-audit.test.ts
packages/services/src/__tests__/destructive-op-registry-coverage.test.ts
packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
packages/services/src/audit.service.ts
packages/services/src/__tests__/audit.service.test.ts
packages/services/src/__tests__/manifest.service.test.ts                 # narrow audit surface
packages/types/src/audit.types.ts

# Audit-wired service methods
packages/services/src/payment.service.ts          # deletePayment wrapped
packages/services/src/invoice.service.ts          # cancelInvoice wrapped
packages/services/src/manifest.service.ts         # removeShipmentFromManifest wrapped

# Whatsapp surface (TARGET for next session per § 6)
packages/services/src/whatsapp.service.ts         # 532 LoC, 0% tested

# Service test floors (the pattern)
packages/services/src/__tests__/helpers/make-db.ts             # CANONICAL shared mock builder
packages/services/src/__tests__/helpers/make-builder-spy.ts    # CANONICAL recording spy
packages/services/src/__tests__/payment.service.test.ts
packages/services/src/__tests__/invoice.service.test.ts
packages/services/src/__tests__/shipment.service.test.ts

# Sentinels (forcing-function precedents for #136)
apps/dashboard/__tests__/audit-doc-references.test.ts            # the pattern #136 mirrors
apps/dashboard/__tests__/rbac-block-adoption.test.ts
apps/dashboard/__tests__/api-routes-no-console.test.ts
apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts
packages/services/src/__tests__/silent-by-design.test.ts

# Core rules + skills
CLAUDE.md
AGENTS.md
DESIGN_SYSTEM.md
.claude/skills/RESOLVER.md
```

---

## 10. The honest read

The audit-logs arc closed cleanly (PRs #133 + #135; risk-rank #1 discharged). The just-completed META re-validation session corrected a chronic backlog-drift problem — 50% of #102's actually-shipped items were untiicked, and 3+1 lines were stale-referencing non-existent or renamed artifacts. The corrected tick-list is in the #102 comment posted by this PR; owner action is to apply it.

The forcing-function follow-up (#136) is the mechanical fix for the drift class. Until it ships, repeat this re-validation methodology at the start of any session whose first task is "pick the next #102 item."

**Recommended one-line summary for the next session's prompt:** "Pick up the WhatsApp service test floor per `docs/audits/2026-05-16-102-revalidation.md § 8`. ONE PR (bailout-seam-named at the natural functional split per § 8.3). Decline any 'while we're here' expansion."

---

**Load the skills. Re-read § 1 (cadence pre-commit, FIVE substantive PRs old). Pick a task from § 6 (whatsapp is the risk-correct lead). Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
