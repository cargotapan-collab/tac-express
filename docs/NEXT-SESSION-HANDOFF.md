# Next-Session Handoff — Start Here

> **You are picking up TAC Express after PR #<TBD> (close the uncaught-sentinels CI gap — `Unit tests` gate).** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** post-PR-#<TBD> merge — `ci: close the uncaught-sentinels CI gap by adding pnpm test gate`.
**Date this doc was written:** 2026-05-17 (fifth substantive session today — first CI-policy session in the arc; closes PR #146's deferred carry-forward).
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer.
**Status of recent work (per `docs/backlog/production-readiness.md`):**
- **W1** (whatsapp_sends audit table): DONE (PR #141).
- **#136 backlog-drift sentinel**: DONE (PR #146).
- **O1** (manifest.service.ts full test floor): DONE (PR #147).
- **#139 + #140** (whatsapp.service source bugs): DONE (PR #148).
- **CI test-gating policy** (PR #146 retro § 7.3 carry-forward): DONE (this PR).
- **W2/W3/W4/W5** (whatsapp_sends follow-ups #142–#145): OPEN; refs pending.
- **O2** (`as unknown as` cast cleanup at invoice-pdf route): OPEN; small.

> **CI test-gating policy IS NOW WRITTEN (this PR):** see AGENTS.md "CI test-gating policy" subsection in § 0. Every vitest unit test in the repo runs on CI on every architecture-gates-triggering PR via the new `Unit tests` job. The five previously-uncaught sentinels are now genuinely load-bearing. Read AGENTS.md § 0 before adding any new sentinel.

---

## 1. CADENCE PRE-COMMIT (load-bearing — ELEVEN substantive PRs old)

**Status: HOLDS.** Eleven real tests across the arc (post-#129, PR #132, #132's session boundary, #133, #134/#135, #137 META, #138, #141, #146, #147, #148, #<TBD>). This session resisted four named bundle temptations:

1. **Authoring new sentinels or tests.** Strong pull (every CI-engineering session generates "we could also sentinel X" thoughts). Resisted: this session WIRES, does not WRITE.
2. **Weakening a CI-failing assertion.** Didn't fire (suite passed on CI). The contingency was clear: portability fixes in scope; real findings stop-and-surface.
3. **Refactoring workflow files beyond gating change.** Strong pull (YAML anchors, comment consolidation). Resisted: one job added + one comment updated.
4. **Bundling O2 or any open issue.** None touched.

**New observation (this session):** the PHASE-0 (A) ground-truth-first protocol caught a scope-understatement in the brief. The brief said "four sentinels uncaught"; ground truth showed (a) five sentinels uncaught (not four — `audit-logs-no-update-delete` was missed), AND (b) the FULL 712-test suite was ungated, not just the sentinels. Without the verification step, this PR would have shipped four narrow per-sentinel gates and left 700 unit tests still ungated. Recorded as discipline § 7.24 below.

---

## 2. READ THIS FIRST — seven things you must NOT do

(Item 7 unchanged. Items 1–6 unchanged.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`.
2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been load-bearing since #108.
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner runs it locally (#94, still pending).
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.** Sentinel at `apps/dashboard/__tests__/api-routes-no-console.test.ts` (NOW CI-GATED).
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) is authoritative.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 712 tests passing.
# IMPORTANT: as of this PR, `pnpm test` ALSO runs on CI on every PR — a local
# failure that you fix should also be verified on CI before opening the PR.
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm test apps/dashboard/__tests__/backlog-refs-drift.test.ts   # backlog sentinel (also runs inside pnpm test above)
```

---

## 4. Current state snapshot

### Open PRs (0 after #<TBD> merges)

### Open issues — derive from [`docs/backlog/production-readiness.md`](backlog/production-readiness.md)

**The repo backlog file is authoritative.** Tracker numbers for cross-reference only.

| Tracker | Title | In repo backlog as | Priority |
|---|---|---|---|
| [#94](https://github.com/cargotapan-collab/tac-express/issues/94) | Sentry alert-rule notification action | **O3** | P2 (owner-runnable) |
| [#102](https://github.com/cargotapan-collab/tac-express/issues/102) | Production-readiness backlog tracking | meta — body pointer-only | meta |
| [#130](https://github.com/cargotapan-collab/tac-express/issues/130) | Regex-alternation LAW gate | (not in repo backlog — tooling) | own session |
| [#131](https://github.com/cargotapan-collab/tac-express/issues/131) | Branded `ServiceLevel` type | (not in repo backlog — type-infra) | own session |
| [#139](https://github.com/cargotapan-collab/tac-express/issues/139) | WAMID-null redundant fallback | DISCHARGED (PR #148) | — |
| [#140](https://github.com/cargotapan-collab/tac-express/issues/140) | BASE-URL empty fallback | DISCHARGED (PR #148) | — |
| [#142](https://github.com/cargotapan-collab/tac-express/issues/142) | Operator retry UI | **W2** | medium |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated retry job | **W3** | low |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery webhook | **W4** | medium-low |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | App-layer immutability sentinel (whatsapp_sends) | **W5** | low |

**Recently resolved:** the audit_logs+test-floor arc (PRs #133/#135/#138/#141/#147), backlog-drift sentinel (PR #146), whatsapp.service source bugs (PR #148), **CI test-gating policy (this PR)**.

---

## 5. Critical context (the things that will trip you up)

### 5.1 audit_logs adoption (post-#135) — unchanged

### 5.2 Cross-package tag-emission contract — unchanged

### 5.3 Shared mock-db helpers — unchanged

### 5.4 EIGHT CI gates load-bearing — UPDATED this PR

- `LAW gates` (`pnpm audit:governance`)
- `@tac registry sync + smoke`
- `migrations apply on fresh DB`
- `npm audit (production deps)`
- `Sentry alert-rule structure lint`
- `Bundle size`
- `Backlog references drift check` (the PR #146 narrow gate, retained)
- **`Unit tests`** (NEW THIS PR — the full 712-test vitest suite + the five other named sentinels)

Plus the e2e workflow's `visual + a11y` Playwright run.

**Pre-this-PR ground truth:** the project believed it had five sentinels; only ONE was actually CI-gated. The other 711 tests (including 4 explicitly-named sentinels) ran only locally via the pre-commit checklist — a discipline gate, not a mechanical gate.

### 5.5 CodeRabbit pattern catalog (9 entries) — unchanged

### 5.6 NEW: CI test-gating policy (this PR)

Documented in AGENTS.md § 0 ("CI test-gating policy" subsection). Read it before adding any sentinel. Summary:
- **Default for new sentinels:** place in `__tests__/`; the `Unit tests` job picks them up automatically. No workflow edit needed.
- **Narrow gate only when:** the test surface is small AND the gate needs to run on a path the broader workflow filter doesn't cover, OR failure-message clarity at PR-check-list level is uniquely valuable (e.g., a critical signal that mustn't be buried). The criteria are in AGENTS.md.
- **The six sentinel inventory** is documented in AGENTS.md with the file paths + what each guards.

### 5.7 NEW: PHASE-0 ground-truth-first protocol (this PR)

The brief said "four sentinels"; ground truth showed five sentinels + full unit suite ungated. The brief's PHASE-0 (A) requirement to verify before scoping was load-bearing — without it, the PR would have shipped four narrow gates and left ~700 tests ungated. Recorded as discipline § 7.24 — for any future CI / infrastructure session, ground truth on what runs today is step 1, not an assumption.

---

## 6. Your first task — recommended

**The next-lead source of truth is now [`docs/backlog/production-readiness.md`](backlog/production-readiness.md), NOT this handoff.** Per the backlog's risk-ranked open items:

### Option A — O2: Cleanup the remaining `as unknown as` cast at `apps/dashboard/app/api/public/invoice-pdf/route.ts` (rank #5) — RECOMMENDED

Small standalone PR (~30 min). The cast is a workaround for a known boundary in `@react-pdf/renderer`. Sentinel-checked refs in the backlog file point at the file + the `headerBuffer` symbol.

### Option B — W2 / W3 / W4 / W5 — the four whatsapp_sends follow-ups

W2 (operator retry UI) is the most user-facing; W3 (automated retry) is multi-session.

### Option C — D1 / D2 / D3 / D5 — docs-only items

Each ~30 min to 1-2 hours.

### Option D — #130 / #131 — small standalone tooling / type-infra

Each is its own session.

### Option E — Wrapper test strengthening (carried from PR #148 retro § 7.3)

Tighten the whatsapp-tracked.service.test.ts `Row 2: WAMID-null silent rejection` to pin `fetchMock.toHaveBeenCalledTimes(1)` explicitly. NOT urgent.

### Option F — #94 (5-min owner-runnable Sentry provisioning) — not an agent task

---

## 7. Cumulative discipline observations (carry-forward)

Distilled from PRs #105 → #<TBD>.

### 7.1 – 7.22 (unchanged — see PR #146 / #147 / #148 handoffs)

### 7.23 NEW (this session): The deferred-policy comment + retro-carry-forward pattern works

PR #146 deferred the "CI-gate `pnpm test`" policy decision with both (a) an explicit comment in `architecture-gates.yml` naming the deferred decision, and (b) a retro § 7.3 carry-forward identifying it as a future-session pickup. THIS session inherited unambiguous context from both. Pattern recorded: when a PR identifies a deferred policy decision, leave BOTH a code/workflow comment AND a retro carry-forward naming the scope. The next session inherits the decision with zero re-discovery cost.

### 7.24 NEW (this session): PHASE-0 ground-truth-first is load-bearing for infrastructure sessions

The brief said "four sentinels"; ground truth showed five sentinels + the full 712-test suite ungated. Without the PHASE-0 (A) verification step, this PR would have shipped four narrow per-sentinel gates and left ~700 tests still ungated — a half-fix. The pattern: for any CI / infrastructure / governance session, do NOT scope the fix until ground truth is established. Read the actual workflow files, the actual scripts, the actual test invocations. Assumed scope is the failure mode.

This generalizes beyond CI sessions: any time a brief describes "the way things are," verify before scoping. The discipline cost is small (one focused investigation pass); the cost of skipping is a half-fix PR.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp.service.test.ts          # 47 cases (PR #138 + #148 fixes)
pnpm vitest run packages/services/src/__tests__/whatsapp-tracked.service.test.ts  # 32 cases (PR #141)
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts          # 50 cases (PR #135 + #147)
pnpm vitest run apps/dashboard/__tests__/backlog-refs-drift.test.ts               # 32 cases (PR #146)
pnpm vitest run packages/services/src/__tests__/audit.service.test.ts
pnpm vitest run packages/services/src/__tests__/with-audit.test.ts
pnpm vitest run packages/services/src/__tests__/destructive-op-registry-coverage.test.ts
pnpm vitest run packages/services/src/__tests__/audit-logs-no-update-delete.test.ts
pnpm vitest run packages/services/src/__tests__/silent-by-design.test.ts
pnpm vitest run apps/dashboard/__tests__/audit-doc-references.test.ts
pnpm vitest run apps/dashboard/__tests__/api-routes-no-console.test.ts            # NOW CI-gated (this PR)
pnpm vitest run apps/dashboard/__tests__/rbac-block-adoption.test.ts              # NOW CI-gated (this PR)
node scripts/ci-watch-pr.mjs <pr-number>
```

---

## 9. Key file locations (unchanged)

```
# Sentinel tests (SIX — all now CI-gated as of this PR)
apps/dashboard/__tests__/rbac-block-adoption.test.ts                    # PR #114; CI-gated this PR
apps/dashboard/__tests__/api-routes-no-console.test.ts                  # PR #117; CI-gated this PR
packages/services/src/__tests__/silent-by-design.test.ts                # PR #120; CI-gated this PR
apps/dashboard/__tests__/audit-doc-references.test.ts                   # PR #121; CI-gated this PR
packages/services/src/__tests__/audit-logs-no-update-delete.test.ts     # PR #133; CI-gated this PR
apps/dashboard/__tests__/backlog-refs-drift.test.ts                     # PR #146; CI-gated TWICE (narrow gate + Unit tests job)

# CI workflows
.github/workflows/architecture-gates.yml                                # Unit tests job added this PR
.github/workflows/e2e.yml                                               # Playwright (unchanged)
.github/workflows/shadcn-drift-check.yml                                # shadcn drift (unchanged)

# Authoritative backlog + decision docs (unchanged)
docs/backlog/production-readiness.md
docs/decisions/2026-05-17-backlog-drift-sentinel.md
```

---

## 10. The honest read

Tests 712 → 712 (no count change — this PR doesn't write tests; it wires the existing 712 to run on CI for the first time). One CI job added; one AGENTS.md subsection written. The cost is ~2 min of additional CI runtime per PR; the benefit is ~700 previously-discipline-enforced tests now mechanically enforced.

The brief's "four sentinels" framing was a smaller scope than reality; the PHASE-0 (A) ground-truth-first protocol caught it before any code was written. That protocol carries forward as discipline § 7.24.

**Recommended one-line summary for the next session's prompt:** "Pick up [`docs/backlog/production-readiness.md`](docs/backlog/production-readiness.md) item O2 — `as unknown as` cast cleanup at `apps/dashboard/app/api/public/invoice-pdf/route.ts` (rank #5; ~30 min). ONE PR. Decline any 'while we're here' expansion."

---

**Load the skills. Re-read § 1 (cadence pre-commit, ELEVEN substantive PRs old). Pick a task from § 6 — or better, from `docs/backlog/production-readiness.md` directly. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
