# Next-Session Handoff — Start Here

> **You are picking up TAC Express after PR #<TBD> (whatsapp.service.ts test floor).** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** post-PR-#<TBD> merge — `test(services): whatsapp.service.ts unit-test floor (#102)`
**Date this doc was written:** 2026-05-16 (fourth substantive Sprint 2 session — service-test-floor #4)
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer
**#102 risk-rank #1 status:** DISCHARGED (audit_logs, PRs #133 + #135)
**#102 risk-rank #2 status (whatsapp.service.ts test floor):** DISCHARGED (this PR)
**Re-validation status:** [`docs/audits/2026-05-16-102-revalidation.md`](audits/2026-05-16-102-revalidation.md) is still the authoritative current accounting (updated below in § 4 with this session's deltas)

---

## 0. REQUIRED PRE-READING

Before writing ANY code in a session, load these:

1. **[`docs/audits/2026-05-16-102-revalidation.md`](audits/2026-05-16-102-revalidation.md)** — the full per-item verdict table for #102.

2. **[`docs/patterns/coderabbit-catalog.md`](patterns/coderabbit-catalog.md)** — 9 entries × 4 categories.

3. **[`docs/retros/2026-05-16-whatsapp-service-tests.md`](retros/2026-05-16-whatsapp-service-tests.md)** — this session's retro. § 3 (mocking-strategy decision), § 6.3 (source-behavior finding: WAMID-null triggers a redundant retry), § 6.4 (don't-fix discipline) are the load-bearing sections.

4. **[`docs/retros/2026-05-16-audit-logs-pr2-adoption.md`](retros/2026-05-16-audit-logs-pr2-adoption.md)** — PR #135 retro. Relevant if you pick up `whatsapp_sends` next (audit-wiring pattern).

5. **[`docs/decisions/2026-05-16-audit-logs-mechanism.md`](decisions/2026-05-16-audit-logs-mechanism.md)** — the audit-logs PHASE-0 decision doc. Required reading if extending the audit surface to WhatsApp events.

6. **[`docs/retros/2026-05-16-shipment-service-tests.md`](retros/2026-05-16-shipment-service-tests.md)** — PR #132 retro. Test-floor template.

Plus this file's § 1 (cadence pre-commit, now SIX substantive PRs old).

---

## 1. CADENCE PRE-COMMIT (load-bearing — SIX substantive PRs old)

**Status: HOLDS.** Six real tests across the arc (post-#129, PR #132, PR #132's session boundary, PR #133, PR #134/#135, PR #137 META, PR #<TBD>). The whatsapp.service test floor session resisted three bundle temptations:

1. **`whatsapp_sends` audit table** — the most predictable smell. Resisted; remains risk-rank #2 for the next session.
2. **The console-logging cleanup** — touched the test layer only (spy-suppress); did not change source.
3. **The WAMID-null redundant-fallback fix** — a real ~5-LoC source fix discovered during testing. Resisted per the test-floor-PR-is-tests-only rule. Documented + flagged for a separate PR.

**New observation (this session):** the "while I'm here" source-fix temptation grew teeth this session. Previous sessions resisted bundling adjacent FEATURES (whatsapp_sends, manifest.service tests); this session resisted bundling a FIX surfaced by testing. The discipline boundary: a test floor exposes behavior. Behavior changes get their own PHASE-0. Treating the test floor as a venue for "obvious" fixes erodes the cadence rule's value because every test floor surfaces something fixable.

---

## 2. READ THIS FIRST — six things you must NOT do

(Unchanged from prior handoff — see § 2 there.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`.
2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been load-bearing since #108.
3. **Do NOT add Sentry tag keys without updating all four artifacts** (the cross-package tag-emission contract — see § 5.2).
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner runs it locally (#94, still pending).
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.** Sentinel at `apps/dashboard/__tests__/api-routes-no-console.test.ts`.
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 603 tests passing (post-#<TBD>)
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
```

---

## 4. Current state snapshot

### Open PRs (0)

Clean slate once #<TBD> merges.

### Open Issues — short list

| # | Title | Priority | Notes |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Verify + wire Sentry alert-rule notification action | P2 | 5-min owner action. |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta | Re-validation authoritative; this session ticks the `whatsapp.service.ts` test-floor item. |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | — | Own session. Do NOT bundle. |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` type | — | Own session. Do NOT bundle. |
| [#136](https://github.com/cargotapan-collab/tac-express/issues/136) | Backlog drift sentinel (forcing function for #102) | — | Own session. Do NOT bundle. |
| [#<TBD-WAMID>](TBD) | WAMID-null redundant form-fallback fix | small | NEW — filed by this session. ~5 LoC source change + 2-3 test cases. Own session. Do NOT bundle. |

**Recently resolved:** #134 (PR #135), audit_logs full discharge (#133+#135), #137 META re-validation.

### Re-validation deltas since PR #137

Two #102 items go DONE-BUT-UNTICKED this session:
- **Unit tests for `whatsapp.service.ts` (18KB, 0 tests today)** → DONE in PR #<TBD>. 47 cases.
- Sequencing: `whatsapp_sends` audit table is now UNBLOCKED (was waiting on this test floor per re-validation § 8.2).

---

## 5. Critical context (the things that will trip you up)

### 5.1 audit_logs adoption (post-#135) — unchanged

### 5.2 Cross-package tag-emission contract — unchanged

### 5.3 Shared mock-db helpers — unchanged

### 5.4 Six CI gates still load-bearing — unchanged

### 5.5 CodeRabbit pattern catalog (9 entries) — unchanged

### 5.6 Test-pattern shift for audit-wrapped methods (from #135) — unchanged

### 5.7 NEW: Test-floor pattern for non-Supabase services (this session's contribution)

`packages/services/src/__tests__/whatsapp.service.test.ts` is the FIRST service-test floor that doesn't touch Supabase. It mocks the external `globalThis.fetch` via `vi.stubGlobal("fetch", ...)` with a small `mockFetchSequence` helper inline in the file. If the next service-test target is also a pure HTTP/external-integration service, mirror this file's shape. If a second consumer of `mockFetchSequence` appears, extraction-on-second-use applies — same shape as the `makeBuilderSpy` extraction in PR #132.

**Three pieces of the pattern worth lifting verbatim:**
- `mockResponse({ ok, status, statusText, body })` — minimal Response-shaped stub; avoids real `new Response()` encoding round-trips that don't help the test.
- `mockFetchSequence(...steps)` — sequence mock with exhausted-call FAIL-LOUD assertion. Catches the bug shape where the SUT makes more API calls than the test anticipated. Paid for itself in this session's first-iteration debugging.
- `vi.unstubAllGlobals()` in `afterEach` (paired with `vi.unstubAllEnvs()` if `vi.stubEnv` is used) — keeps tests isolated.

### 5.8 NEW: WAMID-null redundant-fallback finding (source-behavior, not bug)

PR #<TBD> documented a finding during testing: when WPBox returns HTTP 200 with `message_wamid: null` (silent rejection), the `postSmart` wrapper's `shouldFallback` decision sees `status === 200` and retries as form-encoded — producing a SECOND identical fetch call that hits the same WAMID-null response. Production cost: every WAMID-null silent rejection causes a redundant WPBox API call.

NOT fixed in this PR (zero-source-change rule for test floors). Filed as a follow-up issue. Reasonable fix: tighten `shouldFallback` to skip retry when the JSON-attempt error was a recognized application-level signal (WAMID-null is the canonical case). Scope: ~5 LoC + 2-3 test cases.

---

## 6. Your first task — recommended

Per the cadence rule (§ 1) and the re-validation in `docs/audits/2026-05-16-102-revalidation.md § 6 / § 8`.

### Option A — `whatsapp_sends` audit table (risk-rank #2 per re-validation) RECOMMENDED

Now unblocked by this session's test floor. Same shape as the discharged `audit_logs` item: a schema migration + a service-side audit hook + sentinels + tests. The whatsapp.service test floor means audit-wiring lands on tested code (mirroring the discipline that made PR #135 cleanly executable).

PHASE-0 sub-decision at start of session: extend `DESTRUCTIVE_OP_REGISTRY` (if WhatsApp ops map to destruction shape) OR introduce a parallel `whatsapp_event_registry` (if events are external-send attempts, not strictly destructive). Likely the latter — sends are not destructive; they're attempt-records.

Estimate: ~1 session.

### Option B — WAMID-null redundant-fallback fix (small standalone) (NEW, filed this session)

~5 LoC source change in `postSmart`'s `shouldFallback` + 2-3 test cases. Bounded scope. Reduces a real per-WPBox-WAMID-null production cost (one extra API call per silent rejection). Good "between bigger items" PR.

Estimate: ~30-45 min.

### Option C — `manifest.service.ts` full test floor (risk-rank #4 per re-validation)

Lower per-day risk than the WhatsApp family items. Comfortable known-shape session. Pick if Option A is blocked or if a shorter session window is available.

### Option D — #136 (backlog drift sentinel — forcing function)

~500 LoC. Substantial. Reduces per-session re-validation burden for the rest of Sprint 2.

### Option E — #94 (5-min owner-runnable Sentry provisioning)

Not an agent task.

### Option F — #130 or #131 (small standalone tooling / type-infrastructure)

Each is its own session. Do NOT bundle.

---

## 7. Cumulative discipline observations (carry-forward)

Distilled from PRs #105 → #<TBD>.

### 7.1 - 7.11 (unchanged from prior handoff)

### 7.12. Parent-tracker issue bodies drift unless mechanically gated (from PR #137)

### 7.13. "Re-validate don't fix" is a discipline of its own kind (from PR #137)

### 7.14. NEW: Test floors expose fixable behavior; don't fix in the test PR

This session's WAMID-null finding (§ 5.8) is the canonical example. A test floor's job is to PIN current behavior — including unattractive behavior. Fixing the unattractive behavior in the same PR conflates "what does this code do" with "what should this code do" and makes the test PR harder to review (which assertion changes are tests of the new code vs. tests of the old behavior preserved?). The discipline: test what is; file a follow-up to fix what should be.

### 7.15. NEW: First-non-Supabase service-test floor establishes a HTTP-mocking sub-pattern

The pattern is `vi.stubGlobal("fetch", mockFetchSequence(...))` + sequence-exhausted FAIL-LOUD + console-suppression via `vi.spyOn(console, ...).mockImplementation(...)` in beforeEach. Same shape as `makeDb`'s discipline (mock at the boundary; let your own logic run) but for the HTTP boundary. Extract `mockFetchSequence` on second use (no second consumer today).

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp.service.test.ts   # NEW 47 cases this PR
pnpm vitest run packages/services/src/__tests__/audit.service.test.ts
pnpm vitest run packages/services/src/__tests__/with-audit.test.ts
pnpm vitest run packages/services/src/__tests__/destructive-op-registry-coverage.test.ts
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations

(Unchanged from prior handoff; one addition.)

```
# Test floors (the pattern, plus the NEW non-Supabase variant)
packages/services/src/__tests__/payment.service.test.ts                 # 29+ cases (PR #118)
packages/services/src/__tests__/invoice.service.test.ts                 # 40+ cases (PR #123)
packages/services/src/__tests__/shipment.service.test.ts                # 50 cases (PR #132)
packages/services/src/__tests__/whatsapp.service.test.ts                # 47 cases (PR #<TBD>) — NEW non-Supabase pattern
packages/services/src/__tests__/manifest.service.test.ts                # narrow audit surface only (PR #135)
packages/services/src/__tests__/audit.service.test.ts                   # 14 cases (PR #133)

# Shared mock helpers
packages/services/src/__tests__/helpers/make-db.ts                      # Supabase mock (canonical)
packages/services/src/__tests__/helpers/make-builder-spy.ts             # Chainable builder spy
```

---

## 10. The honest read

Tests 556 → 603 (+47). Fourth service-test floor done; risk-rank #1 (audit_logs) and #2 (whatsapp.service test foundation) both discharged. The whatsapp_sends audit table is now unblocked — that wiring lands on tested code.

The session's one substantive carry-forward is the WAMID-null redundant-fallback finding (§ 5.8 + retro § 6.3). Filed as a follow-up issue; do NOT bundle.

**Recommended one-line summary for the next session's prompt:** "Pick up the whatsapp_sends audit table per `docs/audits/2026-05-16-102-revalidation.md § 8.2`. PHASE-0 sub-decision: extend `DESTRUCTIVE_OP_REGISTRY` or introduce a parallel `whatsapp_event_registry`. ONE PR. Decline any 'while we're here' expansion — including the WAMID-null fix (separate issue)."

---

**Load the skills. Re-read § 1 (cadence pre-commit, SIX substantive PRs old). Pick a task from § 6. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
