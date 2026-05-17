# Next-Session Handoff — Start Here

> **You are picking up TAC Express after PR #<TBD> (manifest.service.ts full test floor — backlog item O1).** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** post-PR-#<TBD> merge — `test(services): manifest.service.ts full test floor (#102 / O1)`.
**Date this doc was written:** 2026-05-17 (third substantive Sprint 2 session today — fifth service-test floor done; the floor pattern is now stable across five PRs: #118 / #123 / #132 / #138 / this one).
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer.
**Status of recent risk-ranked items (per `docs/backlog/production-readiness.md`):**
- **W1** (whatsapp_sends audit table + retry path): DONE (PR #141).
- **W2/W3/W4/W5** (whatsapp_sends follow-ups #142–#145): OPEN; refs pending.
- **#136 backlog-drift sentinel**: DONE (PR #146).
- **O1** (manifest.service.ts full test floor): DONE (this PR).
- **O2** (`as unknown as` cast cleanup at invoice-pdf route): OPEN; small.

> **Reminder from PR #146:** the open production-readiness backlog lives at [`docs/backlog/production-readiness.md`](backlog/production-readiness.md). That file is AUTHORITATIVE; `#102`-the-GitHub-issue is a human-facing pointer. The `Backlog references drift check` CI gate verifies every code reference on every PR. Derive task references from the repo file, not the GitHub issue.

---

## 1. CADENCE PRE-COMMIT (load-bearing — NINE substantive PRs old)

**Status: HOLDS.** Nine real tests across the arc (post-#129, PR #132, #132's session boundary, #133, #134/#135, #137 META, #138, #141, #146, #<TBD>). This session resisted three named bundle temptations:

1. **Fix a manifest.service.ts bug surfaced by testing.** None surfaced; nothing to apply. The discipline would have been document + file follow-up. Tests-only-discipline held.
2. **CI-gate the other four sentinels.** Known-but-deferred carry-forward from PR #146's retro § 7.3 (`pnpm test` is NOT a CI gate today; the four pre-existing sentinels run only locally). Not promoted in this PR — separate policy decision.
3. **Bundle any of the 8 open issues.** None touched.

**New observation (this session):** the #136 backlog-drift sentinel got its FIRST live exercise reacting to a backlog edit — the O1 refs block grew from 4 refs to 13 (1 service file + 1 test file + 11 method symbols), all of which were re-verified by the CI gate on the PR. The pattern from PR #146's handoff § 7.18 ("authoritative repo file beats authoritative GitHub issue") works as designed across PRs.

---

## 2. READ THIS FIRST — seven things you must NOT do

(Unchanged from PR #146's handoff. Item 7 — the backlog-as-source-of-truth rule — is now load-bearing for this PR's test plan.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`.
2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been load-bearing since #108.
3. **Do NOT add Sentry tag keys without updating all four artifacts** (the cross-package tag-emission contract — see § 5.2 of the prior handoff).
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner runs it locally (#94, still pending).
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.** Sentinel at `apps/dashboard/__tests__/api-routes-no-console.test.ts`.
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) is authoritative. The `Backlog references drift check` CI gate verifies every code reference on main — drift fails CI. **Update the repo file when closing an item, not the issue body.**

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 712 tests passing (post-#<TBD>)
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
# Backlog-drift sentinel (CI also runs as `Backlog references drift check`):
pnpm test apps/dashboard/__tests__/backlog-refs-drift.test.ts
```

---

## 4. Current state snapshot

### Open PRs (0 after #<TBD> merges)

### Open issues — derive from [`docs/backlog/production-readiness.md`](backlog/production-readiness.md)

**The repo backlog file is authoritative.** Tracker numbers listed for cross-reference.

| Tracker | Title | In repo backlog as | Priority |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Sentry alert-rule notification action | **O3** | P2 (owner-runnable) |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta — body pointer-only | meta |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | (not in repo backlog — tooling improvement) | own session |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` type | (not in repo backlog — type-infra improvement) | own session |
| [#136](https://github.com/cargotapan-collab/tac-express/issues/136) | Backlog-drift sentinel | DISCHARGED (PR #146) | — |
| [#139](https://github.com/cargotapan-collab/tac-express/issues/139) | WAMID-null redundant form-fallback fix | (not in repo backlog — small standalone bug) | own session |
| [#140](https://github.com/cargotapan-collab/tac-express/issues/140) | BASE-URL empty-string fallback | (not in repo backlog — small standalone bug) | own session |
| [#142](https://github.com/cargotapan-collab/tac-express/issues/142) | Operator retry UI for failed WhatsApp sends | **W2** | medium |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated background retry job | **W3** | low |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery-callback webhook | **W4** | medium-low |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | App-layer immutability sentinel (whatsapp_sends) | **W5** | low |

**Recently resolved:** #134 (PR #135), audit_logs full discharge (#133+#135), #137 META re-validation, #138 whatsapp.service test floor, #141 whatsapp_sends table + retry path, #146 backlog-drift sentinel, **O1 manifest.service.ts test floor (this PR)**.

---

## 5. Critical context (the things that will trip you up)

### 5.1 audit_logs adoption (post-#135) — unchanged

### 5.2 Cross-package tag-emission contract — unchanged. Note: `SUPABASE_RPC_TAG_KEYS` keys are `rpc`, `rpcName`, `errorCode` (NOT `.fn` — common assumption pitfall caught in this PR's local gates).

### 5.3 Shared mock-db helpers — UPDATED (additive)

`make-builder-spy.ts` + `make-db.ts` gained an `ilike` chain method this session (manifest.service.ts's `getManifests` filter.search was the first consumer). Same shape + same precedent as PR #133's `range` addition. The canonical helpers are now five-floor-deep and absorbing every new shape additively; no fork.

### 5.4 Seven CI gates load-bearing — unchanged

(`LAW gates`, `@tac registry sync + smoke`, `migrations apply on fresh DB`, `npm audit`, `Sentry alert-rule structure lint`, `Bundle size`, `Backlog references drift check`, plus `visual + a11y` in the e2e workflow.)

**Still NOT a CI gate:** `pnpm test` (the full vitest suite). The five pre-existing sentinels (`rbac-block-adoption`, `api-routes-no-console`, `silent-by-design`, `audit-doc-references`, `audit-logs-no-update-delete`) and ~700 unit tests still run only locally. Promoting `pnpm test` to a generic gate is a separately-scoped policy decision (see retro § 7.3 carry-forward).

### 5.5 CodeRabbit pattern catalog (9 entries) — unchanged. PRs #141 and #146 both went through both bots clean on first pass; the catalog works preventively.

### 5.6 Test-pattern shift for audit-wrapped methods (from #135) — unchanged

### 5.7 Test-floor pattern for non-Supabase services (PR #138) — unchanged

### 5.8 Service-wrapper pattern crossing fetch + Supabase (PR #141) — unchanged

### 5.9 Queued-row-first / NEVER-blocking pattern (PR #141, decision § E) — unchanged

### 5.10 Repo-mirror-plus-sentinel forcing-function pattern (PR #146) — unchanged. **First cross-PR exercise this session** — the backlog file's O1 refs grew from 4 to 13 entries; the sentinel re-verified all of them on the PR. Pattern holds.

### 5.11 NEW: `SupabaseRpcError` wrapper vs raw rpc error — load-bearing distinction in tests

`captureSupabaseRpcError(rpcName, rpc.error)` wraps the underlying error into a `SupabaseRpcError` BEFORE calling captureException. The wrapper has `code: "SUPABASE_RPC_FAILED"`. The raw `rpc.error` (e.g. `code: "P0001"`) is still what the service throws. Tests that assert on Sentry must check the wrapper; tests that assert on the rejected promise must check the raw error. Conflating them was the most common iteration in this PR's local-gate cycle — three Sentry assertions fixed before the gates went green.

---

## 6. Your first task — recommended

**The next-lead source of truth is now [`docs/backlog/production-readiness.md`](backlog/production-readiness.md), NOT this handoff.** Per the backlog's risk-ranked open items:

### Option A — O2: Cleanup the remaining `as unknown as` cast at `apps/dashboard/app/api/public/invoice-pdf/route.ts` (rank #5)

Small standalone PR (~30 min) or fold into next PDF-touching PR. The cast is a workaround for a known boundary in `@react-pdf/renderer`; replacement should be a properly-typed marshaling helper. Sentinel-checked refs in the backlog file point at the file + the `headerBuffer` symbol.

### Option B — Promote `pnpm test` to a generic CI gate (or add dedicated gates for the four existing sentinels)

PR #146's retro § 7.3 carried this forward. Pros: every existing sentinel becomes a merge-blocker. Cons: every flaky test becomes a recurring merge-blocker; ~3–5 min added CI time. Needs PHASE-0 deciding "all of pnpm test" vs "narrow per-sentinel jobs."

### Option C — W2 / W3 / W4 / W5 — the four whatsapp_sends follow-ups

See backlog file. W2 (operator retry UI) is the most user-facing; W3 (automated retry) is multi-session.

### Option D — D1 / D2 / D3 / D5 — docs-only items

Each ~30 min to 1–2 hours.

### Option E — #139 + #140 — the two whatsapp.service.ts source bugs

Each is its own PR per the discipline rule (do not bundle even when files coincide). The brief noted these could plausibly each be ~5–30 LoC + 2–3 test cases.

### Option F — #130 / #131 — small standalone tooling / type-infra

Each is its own session. Do NOT bundle.

### Option G — #94 (5-min owner-runnable Sentry provisioning)

Not an agent task.

---

## 7. Cumulative discipline observations (carry-forward)

Distilled from PRs #105 → #<TBD>.

### 7.1 – 7.19 (unchanged — see PR #146 handoff)

### 7.20 NEW (this session): The canonical-helper-extension pattern is now five-floor-validated

`makeDb` + `makeBuilderSpy` + `makeBuilderSpyByTable` absorbed every assertion shape five floors in a row (payment / invoice / shipment / whatsapp / manifest). The single additive extension this session (`ilike`) followed PR #133's `range` precedent verbatim. The pattern: when a method on the SUT uses a chainable that the helper doesn't model yet, add ONE entry to `CHAIN_METHODS` in both helpers; do NOT fork the helper or build a parallel mock. Confidence: high — the pattern is now mature enough to expect future floors to use it without modification.

### 7.21 NEW (this session): `SupabaseRpcError` wrapper vs raw error — preempt-pattern candidate

Three test-time iterations this PR were on conflating the captured (wrapped) error with the thrown (raw) error. The pattern is documented in § 5.11 above. If the next session writing service tests for an RPC-touching service hits the same iteration, that's a signal to add a catalog entry. Not catalog-worthy yet (single instance), but flagged.

### 7.22 NEW (this session): The #136 sentinel handles backlog growth gracefully

The O1 refs block grew from 4 to 13 entries in one PR; the sentinel re-verified all 13 + the 13 W1 refs + the 2 O2 refs + the W2-W5 opt-out markers in a single CI run. Failure-message contract (per PHASE-0 § D in `docs/decisions/2026-05-17-backlog-drift-sentinel.md`) names the item AND the rotted ref — exactly what's needed when a future PR breaks a ref. The narrow-CI-gate design (one job, one test file) keeps the failure name unambiguous in the PR check list.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp.service.test.ts          # 47 cases (PR #138)
pnpm vitest run packages/services/src/__tests__/whatsapp-tracked.service.test.ts  # 32 cases (PR #141)
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts          # 50 cases (this PR + PR #135 preserved) — NEW
pnpm vitest run apps/dashboard/__tests__/backlog-refs-drift.test.ts               # 32 cases (PR #146)
pnpm vitest run packages/services/src/__tests__/audit.service.test.ts
pnpm vitest run packages/services/src/__tests__/with-audit.test.ts
pnpm vitest run packages/services/src/__tests__/destructive-op-registry-coverage.test.ts
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations

(Additions this PR marked NEW. Sentinel-test-family lineage unchanged at FIVE.)

```
# Service test floors (FIVE complete + ONE narrow + this PR's extension)
packages/services/src/__tests__/payment.service.test.ts                 # 29+ cases (PR #118)
packages/services/src/__tests__/invoice.service.test.ts                 # 40+ cases (PR #123)
packages/services/src/__tests__/shipment.service.test.ts                # 50 cases (PR #132)
packages/services/src/__tests__/whatsapp.service.test.ts                # 47 cases (PR #138)
packages/services/src/__tests__/whatsapp-tracked.service.test.ts        # 32 cases (PR #141)
packages/services/src/__tests__/manifest.service.test.ts                # 50 cases (this PR + PR #135 preserved) — UPDATED

# Sentinel tests (FIVE in the family)
apps/dashboard/__tests__/rbac-block-adoption.test.ts                    # PR #114
apps/dashboard/__tests__/api-routes-no-console.test.ts                  # PR #117
packages/services/src/__tests__/silent-by-design.test.ts                # PR #120
apps/dashboard/__tests__/audit-doc-references.test.ts                   # PR #121
packages/services/src/__tests__/audit-logs-no-update-delete.test.ts     # PR #133
apps/dashboard/__tests__/backlog-refs-drift.test.ts                     # PR #146 — CI-gated (the one CI-gated sentinel)

# Authoritative backlog + decision docs
docs/backlog/production-readiness.md                                    # PR #146 — AUTHORITATIVE (O1 updated this PR)
docs/decisions/2026-05-16-audit-logs-mechanism.md                       # audit_logs PHASE-0
docs/decisions/2026-05-17-whatsapp-sends-mechanism.md                   # whatsapp_sends PHASE-0
docs/decisions/2026-05-17-backlog-drift-sentinel.md                     # backlog-drift sentinel PHASE-0

# Shared mock helpers (extended additively in this PR)
packages/services/src/__tests__/helpers/make-db.ts                      # `ilike` added this PR (precedent: PR #133's `range`)
packages/services/src/__tests__/helpers/make-builder-spy.ts             # `ilike` added this PR
```

---

## 10. The honest read

Tests 659 → 712 (+53 from manifest floor). Source diff: zero. Backlog item O1 status: OPEN → DONE with 11 verifiable refs. The #136 backlog-drift sentinel had its first live cross-PR exercise and worked as designed. The canonical-helper pattern is now five-floor-validated; one additive extension (`ilike`) per PR #133's precedent shape.

Three named bundle temptations resisted (manifest source bugs, CI-gating-other-sentinels, the 8 open issues). Three test-time iterations on `SupabaseRpcError` wrapper shape caught by local gates before opening the PR. Seven gates green locally; CI's `Backlog references drift check` re-verifies on the PR.

**Recommended one-line summary for the next session's prompt:** "Pick up [`docs/backlog/production-readiness.md`](docs/backlog/production-readiness.md) item O2 — `as unknown as` cast cleanup at `apps/dashboard/app/api/public/invoice-pdf/route.ts` (~30 min). ONE PR. Decline any 'while we're here' expansion." (Or one of options B–G per owner priority.)

---

**Load the skills. Re-read § 1 (cadence pre-commit, NINE substantive PRs old). Pick a task from § 6 — or better, from `docs/backlog/production-readiness.md` directly. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
