# Next-Session Handoff — Start Here

> **You are picking up TAC Express after PR #134 (audit_logs adoption).** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last commit on `main`:** post-PR-#134 merge — `feat(audit): wire withAudit in deletePayment + cancelInvoice + removeShipmentFromManifest (#134)`
**Date this doc was written:** 2026-05-16 (third substantive Sprint 2 session — PR #134)
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer + Security-architect
**#102 risk-rank #1 status:** DISCHARGED. Audit_logs infrastructure (PR #133) + adoption (this PR) together complete the line item.

---

## 0. REQUIRED PRE-READING

Before writing ANY code in a session, load these:

1. **[`docs/patterns/coderabbit-catalog.md`](patterns/coderabbit-catalog.md)** — 9 entries × 4 categories. Authoritative count is 9 (verified in the catalog file's `**Total: 9 entries**` line).

2. **[`docs/retros/2026-05-16-audit-logs-pr2-adoption.md`](retros/2026-05-16-audit-logs-pr2-adoption.md)** — PR #134 retro. § 2 (PHASE-0 reconciliation), § 4 (fifth cadence test), § 6 (honest read) are the load-bearing sections.

3. **[`docs/retros/2026-05-16-audit-logs-pr1-infrastructure.md`](retros/2026-05-16-audit-logs-pr1-infrastructure.md)** — PR #133 retro. Still load-bearing context for the audit-logs design.

4. **[`docs/decisions/2026-05-16-audit-logs-mechanism.md`](decisions/2026-05-16-audit-logs-mechanism.md)** — the audit-logs PHASE-0 decision doc (Option C: hybrid withAudit + sentinel). Read this if you're touching the audit surface, adding a destructive op, or auditing it.

5. **[`docs/retros/2026-05-16-shipment-service-tests.md`](retros/2026-05-16-shipment-service-tests.md)** — PR #132 retro. Still load-bearing for the test-floor pattern.

6. **[`docs/retros/2026-05-15-2026-05-16-two-day-arc.md`](retros/2026-05-15-2026-05-16-two-day-arc.md)** — chapter-level retro covering the 16-PR arc that brought us here.

Plus this file's § 1 (cadence pre-commit, now FIVE PRs old).

---

## 1. CADENCE PRE-COMMIT (load-bearing — now FIVE PRs old)

**Status: HOLDS.** The cadence rule (one PR per Sprint 2 session, no bundling) has now survived five real tests:

1. First test (post-#129): bundle `regex-alternation gate` + `branded ServiceLevel` → DECLINED.
2. Second test (PR #132): bundle three "while I'm here" expansions → DECLINED.
3. Third test (PR #132 session boundary).
4. Fourth test (PR #133): bundle adoption alongside infrastructure → DECLINED (filed #134).
5. **Fifth test (PR #134):** two distinct temptations. Both DECLINED:
   - Building `revertManifest` because the issue body + the CHECK enum both pointed at it (the task brief explicitly overrode — building destruction capability solely to give the audit system a hook is backwards; renamed the CHECK enum value to match the op that actually exists).
   - Auditing more manifest ops than the three named (status transitions like `closeManifest` / `departManifest` were intentionally NOT added to the registry per the decision doc § 5.2 scope).

**New observation (PR #134):** the **issue-body-says-X-but-the-task-brief-overrides** pattern. The prior session's issue body (#134, filed during PR #133) was filed in good faith with the best understanding at the time. By the time the current session began, the manifest-revert decision had been made. Treat the task brief as the live decision and the issue body as historical context — and always reconcile the gap explicitly in the PR body.

The discipline survives because:
- The handoff doc § 1 reminder fires at every session start
- The feedback memories (`feedback_cadence_discipline_first_test`, `feedback_bailout_seam_naming`) fire inside the agent's reasoning loop
- Each PR body's "while we're here" disclosure is empty by construction (deferred items live in tracked issues)

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
# Expected: all green; 556 tests passing (post-#134)
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

Clean slate once #134 merges.

### Open Issues — short list

| # | Title | Priority | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Verify + wire Sentry alert-rule notification action | P2 | 5-min owner action. Runbook § 5.3. |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta | **audit_logs item fully DISCHARGED by PRs #133 + #134.** Remaining sub-items: full `manifest.service.ts` test floor, `whatsapp.service.ts` test floor, 5 E2E flows. |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | — | Own session. Do NOT bundle with #131. |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` type | — | Own session. Updates PR #132's serviceLevel test assertions when it lands. Do NOT bundle with #130. |
| [#134](https://github.com/cargotapan-collab/tac-express/issues/134) | audit_logs PR 2 — adopt withAudit | — | **CLOSED BY THIS PR.** |

**Resolved during recent sessions:** #22, #110, #112, #115, #122; #102 sub-items via #123, #127, #128, #132, **#133 + #134 (audit_logs both halves complete)**.

---

## 5. Critical context (the things that will trip you up)

### 5.1 audit_logs adoption (post-#134) — the post-merge picture

- Three destructive ops are now `withAudit`-wrapped and produce **exactly one** audit_logs row per call:
  - `payment.service.ts :: deletePayment` → action `payment_delete`
  - `invoice.service.ts :: cancelInvoice` → action `invoice_cancel` (status guard `.in("status", [DRAFT, ISSUED])` preserved inside the wrapper)
  - `manifest.service.ts :: removeShipmentFromManifest` → action `manifest_shipment_remove`
- Each wrapped op SELECTs the row first (forensic `before_state`), writes the audit row, then runs the destructive op. Audit-first / fail-loud. If the row doesn't exist (stale request, double-click), the op short-circuits silently — no audit, no destruction. Preserves idempotency for the no-op case.
- Migration `20260516000002` renamed the CHECK constraint enum value from `manifest_revert` (PR #133 placeholder, no method existed) to `manifest_shipment_remove` (the honest name for the op that exists). Pre-flight check: zero rows used the legacy value. Post-flight check: enum is correct.
- The sentinel `destructive-op-registry-coverage.test.ts` now asserts per-method withAudit adoption — adding a registry entry without wiring the wrapper fails CI. The "wrapper-contract-only" mode from PR #133 is gone; the adoption assertion is the live contract.
- `revertManifest` does NOT exist. If product later wants a manifest-wide revert, file a feature issue with its own PHASE-0.

### 5.2 Cross-package tag-emission contract — three-level enforcement (unchanged)

| Level | Artifact |
|---|---|
| CI gate | `node scripts/sentry/lint-alert-rules.mjs` |
| Vitest sentinel | `apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts` |
| Runbook | `docs/runbooks/sentry-alert-rules.md § 4` |

PR #133 added `AUDIT_WRITE_TAG_KEYS` (audit.write_failed / audit.action / audit.entity_type), emitted on audit-write failure via `with-audit.ts`. No new keys in #134.

### 5.3 Shared mock-db helper (unchanged from #133)

`makeDb` + `makeBuilderSpy` include `range` from PR #133. PR #134 used both verbatim — no new helpers.

### 5.4 Six CI gates still load-bearing (unchanged)

`registry-check`, `governance`, `migrations-fresh-apply`, `npm-audit`, `alert-rule-lint`, `bundle-size`. PR #134's two migrations were verified in CI; both are idempotent + ship their own do$$ verification blocks.

### 5.5 CodeRabbit pattern catalog (unchanged — 9 entries)

Authoritative source is `docs/patterns/coderabbit-catalog.md` (Total: 9 entries). PR #134 applied 1, 2, 5, 6, 7, 8 actively; 3 + 4 + 9 didn't apply.

### 5.6 Test-pattern shift for audit-wrapped methods (new in #134)

If you write tests against an audit-wrapped service method, the fixture pattern shifted slightly: the method now does SELECT-first, so `makeDb`'s per-table single-result needs to return a row (not `null`) for the SELECT to find something. Use either:
- `fromResults: { <table>: { data: SAMPLE_ROW, error: null }, audit_logs: { data: null, error: null } }` — works when SELECT + destructive op return the same shape and the destructive op only cares about `error`.
- A per-call `mockImplementation` (see `payment.service.test.ts:throws on generic delete error AFTER the audit row is committed`) when SELECT and DESTRUCTIVE need different results from the same table.

The audit-first ordering is asserted via `tableCalls` array equality, not `toHaveBeenNthCalledWith`, because the wrapper makes a separate `db.from("audit_logs")` call that needs to appear between the two same-table calls.

---

## 6. Your first task — recommended

Per the cadence pre-commit (§ 1), pick ONE — not multiple in the same session. **Risk-rank #1 is now discharged**; the next item must be the highest-risk remaining. Per the PR #132 process note, the choice is named explicitly in this section AND in the PR body's "Handoff override note" if you pick anything other than the top option.

### Option A — `manifest.service.ts` full test floor (~one focused session) RECOMMENDED

The natural test-coverage gap. PR #134 shipped a narrow `manifest.service.test.ts` (6 cases, only the `removeShipmentFromManifest` audit surface). The full test floor needs to cover `getManifests`, `getManifestById`, `getManifestShipments`, `createManifest`, `addShipmentToManifest` (full RPC-or-fallback decision tree), `closeManifest`, `departManifest`, `arriveManifest`, `reconcileManifest`. Mirror PRs #118 / #123 / #132 / the new #134 manifest test as templates.

Estimate: ~500-700 LoC. One focused session.

**Risk-rank rationale:** the largest untested service surface remaining. The handoff post-#132 named this as Option A then; the audit-logs work intervened legitimately (risk-rank #1). Now it's the highest unmet need.

### Option B — `whatsapp.service.ts` test floor (~one focused session, possibly two)

~18KB source. External-integration boundary. Bigger surface than the service tests above; the prior handoff flagged it as "possibly two PRs."

### Option C — #94 (owner-only Sentry provisioning, 5 min)

Not an agent task.

### Option D — #130 (regex-alternation LAW gate) — small standalone tooling PR (~30 min)

Forward infrastructure investment. **Do NOT bundle with #131.**

### Option E — #131 (branded `ServiceLevel` type) — structural type infrastructure (~45 min)

Will update PR #132's `serviceLevel` test assertions. **Do NOT bundle with #130.**

---

## 7. Cumulative discipline observations (carry-forward — required reading)

Distilled from PRs #105 → #134.

### 7.1. PHASE-A / PHASE-0 docs ARE the load-bearing artifact

Confirmed three times now: every complex audit-logs PR's decision doc + the PHASE-0 reconciliation in the PR body has driven the actual code decisions.

### 7.2. Forcing-function sentinel pattern (now 8 instances, +1 in #134)

The registry-coverage sentinel went from "wrapper contract only" (PR #133) to "per-method withAudit adoption" (PR #134) — the same hardcoded-list + meta-size-pin + adoption-assertion shape as the other six.

### 7.3. Bailout fires at per-line, per-PR, AND per-mechanism granularity (unchanged)

### 7.4. CodeRabbit findings are signal, not friction (unchanged)

### 7.5. Merge-phrase classifier is the system (unchanged)

PR #134 again relied on the auto-mode classifier blocking direct live-DB migration apply.

### 7.6. Shared helpers extract on second use, not first (unchanged)

PR #134 added NO new helpers. The three adoptions reused `makeDb` + `makeBuilderSpy` verbatim. Pattern still holds.

### 7.7. Cadence rule survives repeated tests (now FIVE PRs old — § 1)

### 7.8. Schema-vs-service drift can be silent for unknown durations (unchanged)

### 7.9. Task prompts naming the bailout seam are a force multiplier (unchanged)

### 7.10. NEW: Issue-body-says-X-but-task-brief-overrides

When a follow-up issue body was filed in a prior session with the then-best-understanding, the next session's task brief is the authoritative live decision. Reconcile the gap explicitly in the PR body — don't silently follow either side. PR #134 surfaced this with `revertManifest`: the issue body said "design + add"; the task brief said "do not build." The CHECK constraint had to be renamed to match the op that exists.

### 7.11. NEW: SELECT-first audit pattern shifts test fixtures

audit-wrapped service methods read the row before mutating it. Existing tests written against the pre-audit code path (which only ran the mutation) need refactor when the audit hook lands: provide a row in the fixture so the SELECT finds something. Test names like "throws on generic db error" need to disambiguate which error (read-side, audit-side, mutation-side) is being tested.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm vitest run apps/dashboard/__tests__/canonical-rules-tag-contract.test.ts
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts        # +6 audit cases in #134
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts        # +5 audit cases in #134
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/audit.service.test.ts          # 14 cases
pnpm vitest run packages/services/src/__tests__/with-audit.test.ts             # 9 cases (test fixtures renamed in #134)
pnpm vitest run packages/services/src/__tests__/destructive-op-registry-coverage.test.ts  # adoption-assertion ACTIVE in #134
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts        # NEW in #134 (6 cases, narrow audit surface)
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations

```
# Planning + retros
docs/retros/2026-05-16-shipment-service-tests.md          # PR #132
docs/retros/2026-05-16-audit-logs-pr1-infrastructure.md   # PR #133
docs/retros/2026-05-16-audit-logs-pr2-adoption.md         # PR #134 (← latest)
docs/decisions/2026-05-16-audit-logs-mechanism.md         # PHASE-0 decision (still authoritative)
docs/NEXT-SESSION-HANDOFF.md                              # ← this file
docs/runbooks/sentry-alert-rules.md

# audit_logs (now fully wired)
supabase/migrations/20260516000001_audit_logs_destructive_op_hardening.sql       # #133
supabase/migrations/20260516000002_audit_logs_check_manifest_shipment_remove.sql # #134
packages/services/src/shared/with-audit.ts                  # The wrapper
packages/services/src/shared/destructive-op-registry.ts     # Registry — 3 wired entries
packages/services/src/__tests__/with-audit.test.ts
packages/services/src/__tests__/destructive-op-registry-coverage.test.ts  # adoption-assertion ACTIVE
packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
packages/services/src/__tests__/audit.service.test.ts
packages/services/src/__tests__/manifest.service.test.ts                 # NEW — narrow audit surface only
packages/services/src/audit.service.ts
packages/types/src/audit.types.ts                  # AuditAction (manifest_shipment_remove)

# Audit-wired service methods
packages/services/src/payment.service.ts          # deletePayment
packages/services/src/invoice.service.ts          # cancelInvoice
packages/services/src/manifest.service.ts         # removeShipmentFromManifest

# Service test floors (the pattern)
packages/services/src/__tests__/helpers/make-db.ts             # CANONICAL shared mock builder
packages/services/src/__tests__/helpers/make-builder-spy.ts    # CANONICAL recording spy
packages/services/src/__tests__/payment.service.test.ts
packages/services/src/__tests__/invoice.service.test.ts
packages/services/src/__tests__/shipment.service.test.ts

# Sentry observability
packages/auth/src/sentry-tagger.ts
packages/auth/src/rbac-instrumentation.ts
packages/services/src/shared/sentry-tagger.ts
packages/services/src/shared/with-rpc.ts
packages/services/src/shared/with-audit.ts

# Core rules + skills
CLAUDE.md
AGENTS.md
DESIGN_SYSTEM.md
.claude/skills/RESOLVER.md
```

---

## 10. The honest read

PR #134 closes the audit-logs arc. Tests are at 556 (540 → 556, +16). The destructive ops the system was designed to protect now produce exactly one tamper-evident audit row each, blocking on audit failure. Risk-rank #1 is discharged.

Open #102 sub-items remaining: full `manifest.service.ts` test floor (Option A), `whatsapp.service.ts` floor (Option B), 5 E2E flows. None of these is risk-rank #1; the next risk-rank ordering should be re-evaluated against the strategic plan comment on #102 (PR #125's session).

**Recommended one-line summary for the next session's prompt:** "Pick Option A — full manifest.service.ts test floor. ONE PR. Mirror PR #132's pattern. Decline any 'while we're here' expansion."

---

**Load the skills. Re-read § 1 (cadence pre-commit, now FIVE PRs old). Pick a task from § 6. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
