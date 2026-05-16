# Next-Session Handoff — Start Here

> **You are picking up TAC Express after PR #133 (audit_logs infrastructure).** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last commit on `main`:** post-PR-#133 merge — `feat(audit): audit_logs destructive-op hardening — PR 1 infrastructure (#102)`
**Date this doc was written:** 2026-05-16 (second substantive Sprint 2 session — PR #133)
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer + Security-architect

---

## 0. REQUIRED PRE-READING

Before writing ANY code in a session, load these:

1. **[`docs/patterns/coderabbit-catalog.md`](patterns/coderabbit-catalog.md)** — 9 entries × 4 categories. The accumulated test-pattern discipline. Several entries are CodeRabbit long-term-memory learnings — writing the pattern correctly first time saves the round-trip. Note: the prior handoff doc said "12 entries" — the actual count on disk is 9.

2. **[`docs/retros/2026-05-16-audit-logs-pr1-infrastructure.md`](retros/2026-05-16-audit-logs-pr1-infrastructure.md)** — PR #133 retro. § 2 (PHASE-0 decision), § 3 (bailout trigger), § 4 (third cadence test), § 9 (honest read) are the load-bearing sections.

3. **[`docs/decisions/2026-05-16-audit-logs-mechanism.md`](decisions/2026-05-16-audit-logs-mechanism.md)** — the audit-logs PHASE-0 decision doc. Required reading for the PR 2 follow-up (issue #134) and for any future audit-pattern work.

4. **[`docs/retros/2026-05-16-shipment-service-tests.md`](retros/2026-05-16-shipment-service-tests.md)** — PR #132 retro (the prior session). Still load-bearing for the test-floor pattern that the Sprint 2 service tests follow.

5. **[`docs/retros/2026-05-15-2026-05-16-two-day-arc.md`](retros/2026-05-15-2026-05-16-two-day-arc.md)** — chapter-level retro covering the 16-PR arc that brought us here. § 5 (cadence shift), § 7.7 (cadence-rule status), § 8 (honest read) are still load-bearing.

Plus this file's § 1 (cadence pre-commit, now four PRs old).

---

## 1. CADENCE PRE-COMMIT (load-bearing — now FOUR PRs old)

**Status: HOLDS.** The cadence rule (one PR per Sprint 2 session, no bundling) has now survived four real tests:

1. **First test (post-#129):** offered to bundle `regex-alternation gate` + `branded ServiceLevel` into the same session as the maximum-sweep analysis → DECLINED. Filed as #130 + #131.
2. **Second test (PR #132):** offered to bundle three "while I'm here" expansions into the shipment.service test floor → DECLINED. All three deferred to their own sessions.
3. **Third test (PR #132's session boundary):** the cadence rule survived the shipment-service-test floor's natural exit.
4. **Fourth test (PR #133):** offered to bundle adoption of `deletePayment` + `cancelInvoice` in this PR alongside the infrastructure → DECLINED. PR 2's full adoption (incl. designing `revertManifest`) deferred to issue #134.

The discipline survives because:
- The handoff doc § 1 reminder fires at every session start
- The feedback memory (`feedback_cadence_discipline_first_test`) fires inside the agent's reasoning loop
- Each PR body's "while we're here" disclosure is empty by construction (the deferred items live in tracked issues, not in the PR)

If a future session attempts to bundle, the failure mode is highly visible (PR body apologizing for "we'll fix [X] in a follow-up"). Audit visible PR bodies for this shape.

**New observation worth codifying (from PR #133):** the bailout clause works best when the task prompt names the seam. When the prompt names the seam, the bailout call is mechanical: "is the work bigger than the cleanly-separable-along-that-seam scope?" → yes → split there. When the seam isn't named, the agent has to invent it AND defend it AND apply the cadence rule — three judgment calls instead of one. Recommend future task prompts continue naming bailout seams explicitly.

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
# Expected: all green; 540 tests passing (post-#133)
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

Clean slate once #133 merges with this handoff write.

### Open Issues — short list

| # | Title | Priority | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Verify + wire Sentry alert-rule notification action | P2 | 5-min owner action. Runbook § 5.3 has the 7-step procedure. |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta | Audit_logs infrastructure ticked by #133. Adoption is deferred to #134. |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | — | Own session. Do NOT bundle with #131. |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` type | — | Own session. Updates PR #132's serviceLevel test assertions when it lands. Do NOT bundle with #130. |
| [#134](https://github.com/cargotapan-collab/tac-express/issues/134) | audit_logs PR 2 — adopt withAudit + design revertManifest | P1 | NEW. Successor to #133. The infrastructure waits for its adoption. Do NOT bundle. |

**Resolved during recent sessions:** #22, #110, #112, #115, #122; #102 sub-items via #123, #127, #128, **#132 (shipment.service test floor), #133 (audit_logs infrastructure)**.

---

## 5. Critical context (the things that will trip you up)

### 5.1 audit_logs schema + RLS state (post-#133)

- Table: `audit_logs` with columns `id, entity_type, action, description, entity_id, user_id, metadata, before_state, created_at`.
- `before_state` JSONB added by migration `20260516000001`. NULL for non-destructive actions.
- CHECK constraint `audit_logs_destructive_action_check`: rows with `action IN (payment_delete, invoice_cancel, manifest_revert)` MUST have non-null `entity_id` AND `before_state`. Historical actions (`STATUS_CHANGE`, `RESOLVED` from existing RPCs) are unaffected.
- RLS state: INSERT allowed for any authenticated user; SELECT MANAGER+; **NO UPDATE policy**, **NO DELETE policy** (default-deny → cannot mutate). The migration's own do$$ block re-asserts these properties at every apply.
- Wrapper: `packages/services/src/shared/with-audit.ts` — audit-first / fail-loud. Adopt this for any new destructive op.
- Registry: `packages/services/src/shared/destructive-op-registry.ts` — three pinned entries with compile-time `Exclude` exhaustiveness.
- Sentinels: `destructive-op-registry-coverage.test.ts` (registry inventory) + `audit-logs-no-update-delete.test.ts` (no UPDATE/DELETE against audit_logs anywhere under `packages/`, `apps/`, `supabase/functions/`).
- Application-layer bug-fix side effect: `audit.service.ts.logEvent` no longer references the four phantom columns (`old_values`, `new_values`, `ip_address`, `user_agent`). `audit-client.tsx` was reading the same phantom columns; now reads `beforeState`.

### 5.2 Cross-package tag-emission contract — three-level enforcement (unchanged)

| Level | Artifact |
|---|---|
| CI gate | `node scripts/sentry/lint-alert-rules.mjs` |
| Vitest sentinel | `apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts` |
| Runbook | `docs/runbooks/sentry-alert-rules.md § 4` |

PR #133 added `AUDIT_WRITE_TAG_KEYS` (audit.write_failed / audit.action / audit.entity_type) — these are emitted on audit-write failure. If a future PR adds a Sentry alert rule keyed off these tags, the canonical-rules-tag-contract sentinel must be extended to cover them.

### 5.3 Shared mock-db helper extensions (new in #133)

`packages/services/src/__tests__/helpers/make-db.ts` and `helpers/make-builder-spy.ts` both now include `range` in their chain methods. Added for audit.service.ts's `listAuditLogs` pagination. Same pattern as the prior `makeBuilderSpy` extraction in PR #132 (extract / extend on second use, not first).

### 5.4 Six CI gates still load-bearing on main

Unchanged: `registry-check`, `governance`, `migrations-fresh-apply`, `npm-audit`, `alert-rule-lint`, `bundle-size`. PR #133's migration was verified by `migrations-fresh-apply` in CI (the agent cannot apply to live DB — auto-mode classifier blocks that, correctly).

### 5.5 CodeRabbit pattern catalog (unchanged — 9 entries)

All 9 patterns in `docs/patterns/coderabbit-catalog.md`. PR #133 exercised patterns 1, 2, 5, 6, 7, 8, 9 proactively. The prior handoff said "12 entries" — that was wrong; the actual count is 9.

---

## 6. Your first task — recommended

Per the cadence pre-commit (§ 1), pick ONE — not multiple in the same session. **Process note (carry-forward from PR #132's review):** momentum-vs-risk must be a named, auditable decision every session, never a silent default. If you pick something OTHER than risk-rank #1, name it in the PR body's "Handoff override note" section.

### Option A — Issue #134: audit_logs PR 2 (audit adoption) RECOMMENDED (risk-rank #1)

Natural successor to PR #133. Wire `withAudit` in `deletePayment` + `cancelInvoice` + design + adopt `revertManifest`. Flip the registry-coverage sentinel from "wrapper contract" to "per-method adoption." Issue #134 has the full scope, sub-decisions for `revertManifest`, and acceptance criteria.

Estimate: ~600-900 LoC. One focused session.

**Risk-rank rationale:** the infrastructure shipped in #133 is inert until adoption lands — every day deferred is another day of unrecoverable destructive evidence. Highest-risk-remaining item.

### Option B — `manifest.service.ts` test floor (~one focused session) (risk-rank #6)

The momentum default from PR #132's handoff. ~7.3KB source. Mirror PR #132's structure. **Note:** if #134 is taken first (as recommended), this session will need to absorb the new `revertManifest` method's test surface — sequence #134 BEFORE this option.

Estimate: ~500-700 LoC. One focused session.

### Option C — #130 (regex-alternation LAW gate) — small standalone tooling PR (~30 min)

Forward infrastructure investment. **Do NOT bundle with #131.**

### Option D — #131 (branded `ServiceLevel` type) — structural type infrastructure (~45 min)

Will update PR #132's `serviceLevel` test assertions. **Do NOT bundle with #130.**

### Option E — Owner runs the #94 procedure (5 min, owner-only)

Not an agent task.

---

## 7. Cumulative discipline observations (carry-forward — required reading for Sprint 2)

Distilled from PRs #105 → #133. Next session's mandatory context load includes this section.

### 7.1. PHASE-A audit document IS the load-bearing artifact

Confirmed again in PR #133: the PHASE-0 decision doc + the PHASE-A matrix in the PR body together drove every subsequent code decision. The decision doc routes future PRs (issue #134's body cross-references it).

### 7.2. Forcing-function sentinel pattern (now 7 instances)

PR #133 added two more sentinels: `destructive-op-registry-coverage.test.ts` and `audit-logs-no-update-delete.test.ts`. Each ships with a hardcoded list / size-pin meta-sentinel that forces conscious intent on additions. This is the standard pattern.

### 7.3. Bailout fires at per-line, per-PR, AND per-mechanism granularity

PR #133 fired the bailout at per-PR granularity (split infrastructure from adoption). The decision doc explicitly notes that individual destructive ops can also upgrade from Option C to Option A per-op — that's a per-mechanism bailout reserved for future PRs where atomicity needs are stricter.

### 7.4. CodeRabbit findings are signal, not friction (unchanged)

### 7.5. Merge-phrase classifier is the system (unchanged)

PR #133 also relied on the auto-mode classifier to BLOCK a direct live-DB migration apply (verified the classifier protects shared infra; the agent correctly fell back to the `migrations-fresh-apply` CI gate as the verification path).

### 7.6. Shared helpers extract on second use, not first (unchanged)

PR #133's `range` addition to `makeDb` + `makeBuilderSpy` follows the same pattern: extend on the second consumer's need.

### 7.7. Cadence rule survives repeated tests (now FOUR PRs old — § 1)

### 7.8. NEW: Schema-vs-service drift can be silent for unknown durations

PR #133 surfaced an `audit.service.ts.logEvent` impl that inserted four columns that NEVER existed in the schema. Compile passed (`db.from("audit_logs").insert(...)` is untyped at the column level). Runtime would have thrown — but no caller existed, so the bug was orphaned. The lesson: **broken-but-orphaned code is a latent bug, not benign dead code.** A future schema audit should grep service files for column references and cross-check against the generated `database.types.ts`. Not in scope this PR; flag for whoever owns Sprint 3 hardening.

### 7.9. NEW: Task prompts naming the bailout seam are a force multiplier

PR #133's prompt named the seam ("PR 1: infrastructure; PR 2: adoption"). The bailout call was mechanical because the seam was prescribed. Recommend the pattern for future complex tasks.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm vitest run apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/audit.service.test.ts      # 14 cases (rewrite in #133)
pnpm vitest run packages/services/src/__tests__/with-audit.test.ts          # 9 cases (new in #133)
pnpm vitest run packages/services/src/__tests__/destructive-op-registry-coverage.test.ts  # new in #133
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts        # new in #133
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations

```
# Planning + retros
docs/SESSION-RETRO-2026-05-15.md                       # May-15 CI-hardening retro
docs/retros/2026-05-16-invoice-service-tests.md        # PR #123
docs/retros/2026-05-16-pre-sprint2-maximum-sweep.md    # PRs #126/#127/#128
docs/retros/2026-05-16-shipment-service-tests.md       # PR #132
docs/retros/2026-05-16-audit-logs-pr1-infrastructure.md # PR #133 (← latest)
docs/decisions/2026-05-16-audit-logs-mechanism.md      # PR #133 PHASE-0 decision (← NEW)
docs/NEXT-SESSION-HANDOFF.md                           # ← this file
docs/runbooks/sentry-alert-rules.md                    # Sentry alert-rule playbook
docs/audits/2026-05-15-rbac-denial-audit.md            # PHASE-A audit reference

# audit_logs infrastructure (NEW in #133)
supabase/migrations/20260516000001_audit_logs_destructive_op_hardening.sql
packages/services/src/shared/with-audit.ts                   # The wrapper
packages/services/src/shared/destructive-op-registry.ts      # The pinned registry
packages/services/src/__tests__/with-audit.test.ts           # Wrapper test floor
packages/services/src/__tests__/destructive-op-registry-coverage.test.ts  # Registry sentinel
packages/services/src/__tests__/audit-logs-no-update-delete.test.ts        # Tamper-evidence sentinel
packages/services/src/audit.service.ts                       # Fixed (was broken)
packages/types/src/audit.types.ts                            # AuditAction enum + DESTRUCTIVE_AUDIT_ACTIONS

# Service test floors (the pattern)
packages/services/src/__tests__/helpers/make-db.ts             # CANONICAL shared mock builder (+ range in #133)
packages/services/src/__tests__/helpers/make-builder-spy.ts    # CANONICAL recording spy (+ range in #133)
packages/services/src/__tests__/payment.service.test.ts        # template (29 cases, PR #118)
packages/services/src/__tests__/invoice.service.test.ts        # 40 cases, PR #123
packages/services/src/__tests__/shipment.service.test.ts       # 50 cases, PR #132
packages/services/src/__tests__/audit.service.test.ts          # 14 cases, PR #133

# Sentry observability
packages/auth/src/sentry-tagger.ts
packages/auth/src/rbac-instrumentation.ts
packages/services/src/shared/sentry-tagger.ts
packages/services/src/shared/with-rpc.ts
packages/services/src/shared/with-audit.ts                # NEW in #133

# Sentry observability — apps + scripts
apps/dashboard/sentry-wire.ts
apps/dashboard/sentry.{server,edge,client}.config.ts
apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts
apps/dashboard/__tests__/rbac-block-adoption.test.ts
apps/dashboard/__tests__/api-routes-no-console.test.ts
apps/dashboard/__tests__/audit-doc-references.test.ts
scripts/sentry/canonical-rules.mjs
scripts/sentry/create-alert-rules.mjs
scripts/sentry/lint-alert-rules.mjs

# Core rules + skills
CLAUDE.md
AGENTS.md
DESIGN_SYSTEM.md
.claude/skills/RESOLVER.md
```

---

## 10. The honest read

PR #133 (audit_logs infrastructure) is the 17th PR since the May 15 baseline. Tests are now at 540 (252 → 540 across the arc; +25 this PR). Five sentinel tests + 2 canonical test helpers + 1 wrapper + 1 registry + 1 migration + 1 hardening decision doc. The cadence rule held a fourth time.

The PR #133 work was genuinely larger than budgeted (the "design + migration + service hook + tests in one PR" frame in the task prompt didn't match reality — the table existed, the service was broken, and one destructive op had no method). The bailout fired at the prescribed seam (infrastructure / adoption); PR 2 is issue #134.

The remaining Sprint 2 items (audit_logs adoption via #134; `manifest.service.ts` and `whatsapp.service.ts` test floors; 5 E2E flows) are each a session by themselves.

**Recommended one-line summary for the next session's prompt:** "Pick up audit_logs PR 2 from issue #134. ONE PR. Take the full session. Decline any 'while we're here' expansion — file an issue instead."

---

**Load the skills. Re-read § 1 (cadence pre-commit, now four PRs old). Pick a task from § 6. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
