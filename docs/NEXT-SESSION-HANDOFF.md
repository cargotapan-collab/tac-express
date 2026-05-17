# Next-Session Handoff — Start Here

> **You are picking up TAC Express after PR #<TBD> (whatsapp.service.ts bugfixes #139 + #140).** Read this top-to-bottom before opening any other file. Designed to take 5 minutes and get you productive.

**Last code commit on `main`:** post-PR-#<TBD> merge — `fix(whatsapp): #139 redundant WAMID-null fetch + #140 empty WPBOX_BASE_URL`.
**Date this doc was written:** 2026-05-17 (fourth substantive Sprint 2 session today — first SOURCE-changing PR after three test/infra PRs in a row).
**Author of last session:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer.
**Status of recent risk-ranked items (per `docs/backlog/production-readiness.md`):**
- **W1** (whatsapp_sends audit table + retry path): DONE (PR #141).
- **W2/W3/W4/W5** (whatsapp_sends follow-ups #142–#145): OPEN; refs pending.
- **#136 backlog-drift sentinel**: DONE (PR #146).
- **O1** (manifest.service.ts full test floor): DONE (PR #147).
- **O2** (`as unknown as` cast cleanup at invoice-pdf route): OPEN; small.
- **#139 / #140** (whatsapp.service.ts source bugs): DONE (this PR — two-bug batch, per-commit-split).

> **Reminder from PR #146:** the open production-readiness backlog lives at [`docs/backlog/production-readiness.md`](backlog/production-readiness.md). That file is AUTHORITATIVE; `#102`-the-GitHub-issue is a human-facing pointer. The `Backlog references drift check` CI gate verifies every code reference on every PR. Derive task references from the repo file, not the GitHub issue.

---

## 1. CADENCE PRE-COMMIT (load-bearing — TEN substantive PRs old)

**Status: HOLDS.** Ten real tests across the arc (post-#129, PR #132, #132's session boundary, #133, #134/#135, #137 META, #138, #141, #146, #147, #<TBD>). This session resisted three named bundle temptations:

1. **Fix a third bug noticed in-file.** None surfaced; nothing to apply.
2. **Refactor postSmart / getWhatsAppConfig beyond the minimal fix.** Strong pull on the shouldFallback decision-tree comments but resisted — only the early-return + new optional field shipped.
3. **Expand into whatsapp-tracked.service.ts wrapper.** Strong pull because the wrapper's Row 2 test passes for the wrong reason pre-fix (now for the right reason post-fix — diagnostic noted in retro § 2 + § 4.4). The wrapper itself is untouched.

**New observation (this session):** the "bug-doc test → regression check" lifecycle pattern. PR #138's test floor wrote LATENT-prefixed tests for both #139 and #140; this PR's source fix made those tests fail, and the FLIP (assertion inverted + title renamed `LATENT BUG: ...` → `... regression check`) was mandatory. Recorded as discipline § 7.20 below. Generalizes: any future test floor that finds an obvious bug should pin it as a LATENT test and follow the same lifecycle.

---

## 2. READ THIS FIRST — seven things you must NOT do

(Unchanged from PR #147 handoff.)

1. **Do NOT skip [`tac-express-onboarding`](.claude/skills/tac-express-onboarding/SKILL.md).** Mandatory per `CLAUDE.md § 0.5`.
2. **Do NOT bump dependencies in feature PRs.** The `npm-audit` gate has been load-bearing since #108.
3. **Do NOT add Sentry tag keys without updating all four artifacts.**
4. **Do NOT run `scripts/sentry/create-alert-rules.mjs` from an agent session.** Owner runs it locally (#94, still pending).
5. **Do NOT regress to `console.*` in the three pino-migrated API routes.** Sentinel at `apps/dashboard/__tests__/api-routes-no-console.test.ts`.
6. **Do NOT attempt to merge from an agent session without typed per-PR authorization.** Owner types `merge PR <N>` exactly.
7. **Do NOT derive task references from `#102`-the-GitHub-issue.** [`docs/backlog/production-readiness.md`](backlog/production-readiness.md) is authoritative.

---

## 3. First 5 minutes — mandatory ramp

```bash
git checkout main && git pull origin main
pnpm typecheck && pnpm lint && pnpm test
# Expected: all green; 712 tests passing (post-#<TBD>; same count as post-#147,
# because this PR FLIPPED 3 pre-existing tests rather than adding new ones)
pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm test apps/dashboard/__tests__/backlog-refs-drift.test.ts   # backlog sentinel
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
| [#139](https://github.com/cargotapan-collab/tac-express/issues/139) | WAMID-null redundant form-fallback fix | DISCHARGED (this PR, commit 1) | — |
| [#140](https://github.com/cargotapan-collab/tac-express/issues/140) | BASE-URL empty-string fallback | DISCHARGED (this PR, commit 2) | — |
| [#142](https://github.com/cargotapan-collab/tac-express/issues/142) | Operator retry UI for failed WhatsApp sends | **W2** | medium |
| [#143](https://github.com/cargotapan-collab/tac-express/issues/143) | Automated background retry job | **W3** | low |
| [#144](https://github.com/cargotapan-collab/tac-express/issues/144) | Meta delivery-callback webhook | **W4** | medium-low |
| [#145](https://github.com/cargotapan-collab/tac-express/issues/145) | App-layer immutability sentinel (whatsapp_sends) | **W5** | low |

**Recently resolved:** #134 (PR #135), audit_logs full discharge (#133+#135), #137 META, #138 whatsapp.service test floor, #141 whatsapp_sends, #146 backlog-drift sentinel, #147 manifest.service test floor, **#139 + #140 whatsapp.service bugfixes (this PR)**.

---

## 5. Critical context (the things that will trip you up)

### 5.1 audit_logs adoption (post-#135) — unchanged

### 5.2 Cross-package tag-emission contract — unchanged. Note: `SUPABASE_RPC_TAG_KEYS` keys are `rpc`, `rpcName`, `errorCode` (NOT `.fn` — assumption pitfall from PR #147).

### 5.3 Shared mock-db helpers — unchanged from PR #147 (added `ilike` for manifest.service.ts).

### 5.4 Seven CI gates load-bearing — unchanged

(`LAW gates`, `@tac registry sync + smoke`, `migrations apply on fresh DB`, `npm audit`, `Sentry alert-rule structure lint`, `Bundle size`, `Backlog references drift check`, plus `visual + a11y` in the e2e workflow.)

**Still NOT a CI gate:** `pnpm test` (the full vitest suite). The five pre-existing sentinels run only locally. Carry-forward from PR #146 retro § 7.3.

### 5.5 CodeRabbit pattern catalog (9 entries) — unchanged. Four PRs in a row cleared the bots near-clean; the catalog is working preventively.

### 5.6 NEW: `WhatsAppResult.semanticFailure` flag (this PR, #139)

The `WhatsAppResult` failure variant now carries an optional `semanticFailure?: boolean` marker. When true, the failure is a deliberate upstream rejection (currently only WAMID-null) — `postSmart` skips the form-encoded fallback for these. Currently set only by the WAMID-null branch in `attemptPost`; if a future upstream-rejection shape emerges (a different 200-with-error envelope that's NOT a body-format issue), set `semanticFailure: true` on its return path and `postSmart`'s early-return picks it up automatically.

The flag is also visible to the whatsapp-tracked.service wrapper — if a future need arises to log/track semantic vs transport failures distinctly in `whatsapp_sends.error_message`, the marker is already plumbed.

### 5.7 NEW: Bug-doc test → regression-check lifecycle (this PR)

PR #138's test floor wrote two LATENT-prefixed tests pinning the buggy behavior of #139 and #140 (the floor's rule was tests-only; no source fix). This PR's source fix made those tests fail; the FLIP (assertion inverted + title renamed `LATENT BUG: ...` → `... regression check`) was mandatory. This is the clean lifecycle for buggy behavior surfaced by a test-floor PR:

1. Test floor: write the bug-doc test with `LATENT BUG:` title prefix + comment block stating "this test pins the bug; the future fix flips it." File a follow-up issue.
2. Fix PR: change the source. The LATENT test fails on the new behavior. Flip the assertion + rename the title to `<bug-id> regression check`.

This is recorded for future test floors so the pattern carries forward.

---

## 6. Your first task — recommended

**The next-lead source of truth is now [`docs/backlog/production-readiness.md`](backlog/production-readiness.md), NOT this handoff.** Per the backlog's risk-ranked open items:

### Option A — O2: Cleanup the remaining `as unknown as` cast at `apps/dashboard/app/api/public/invoice-pdf/route.ts` (rank #5) — RECOMMENDED

Small standalone PR (~30 min). The cast is a workaround for a known boundary in `@react-pdf/renderer`. Sentinel-checked refs in the backlog file point at the file + the `headerBuffer` symbol.

### Option B — Promote `pnpm test` to a generic CI gate (or add dedicated gates per existing sentinel)

PR #146's retro § 7.3 carried this forward. Cons: every flaky test becomes a recurring merge-blocker. Pros: every existing sentinel becomes load-bearing in CI. Needs PHASE-0.

### Option C — W2 / W3 / W4 / W5 — the four whatsapp_sends follow-ups

W2 (operator retry UI) is the most user-facing.

### Option D — D1 / D2 / D3 / D5 — docs-only items

Each ~30 min to 1-2 hours.

### Option E — #130 / #131 — small standalone tooling / type-infra

Each is its own session.

### Option F — Wrapper test strengthening (NEW, optional)

Tighten the whatsapp-tracked.service.test.ts `Row 2: WAMID-null silent rejection` to pin `fetchMock.toHaveBeenCalledTimes(1)` explicitly. The source-side regression check in this PR already guards the behavior; this would add belt-and-braces. Small (one line + one comment). NOT urgent.

### Option G — #94 (5-min owner-runnable Sentry provisioning) — not an agent task

---

## 7. Cumulative discipline observations (carry-forward)

Distilled from PRs #105 → #<TBD>.

### 7.1 - 7.19 (unchanged — see PR #146 / #147 handoffs)

### 7.20 NEW (this session): The LATENT-test → regression-check lifecycle pattern

Documented in § 5.7 above. When a test floor encounters obvious source bugs, the test floor's discipline is "tests only, no source fix" — but the test floor MUST still pin the bug as a LATENT-prefixed test so the eventual fix PR's source change forces a deliberate test flip. The two-PR lifecycle is the forcing function: the LATENT test is a tripwire; the fix PR can't accidentally ship without addressing it.

### 7.21 NEW (this session): Two-bug-batch discipline (per-commit split as the seam)

Bundling two related one-file bugs into one PR is fine IFF: (a) same file, (b) both small, (c) both filed as follow-ups of the same prior PR, (d) low-contention, (e) **commit-separated for independent revert**. This is NOT a no-bundle violation — the discipline is in the COMMIT structure, not the PR count. If a future similar batch comes up, the precedent is established here. The commit boundary IS the bailout seam.

### 7.22 NEW (this session): Passing-test ≠ correct-test diagnostic

The whatsapp-tracked.service Row 2 test passed under the buggy source because the redundant second fetch coincidentally produced a different `result.ok=false` path (mock-exhaustion error → caught by `attemptPost` → returned as `Network error: ...`). The load-bearing assertion (`status='failed'`) was satisfied via the wrong mechanism. Caught by mental tracing during PHASE-A, NOT by any test failing. Lesson: when reviewing tests of code that interacts with a system you're about to change, trace the data path — a passing test may be passing for a reason the source change will invalidate.

---

## 8. Common commands

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm audit --prod --audit-level moderate
node scripts/sentry/lint-alert-rules.mjs
pnpm vitest run packages/services/src/__tests__/payment.service.test.ts
pnpm vitest run packages/services/src/__tests__/invoice.service.test.ts
pnpm vitest run packages/services/src/__tests__/shipment.service.test.ts
pnpm vitest run packages/services/src/__tests__/whatsapp.service.test.ts          # 47 cases (PR #138 + #139/#140 fixes)
pnpm vitest run packages/services/src/__tests__/whatsapp-tracked.service.test.ts  # 32 cases (PR #141)
pnpm vitest run packages/services/src/__tests__/manifest.service.test.ts          # 50 cases (PR #135 + #147)
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

(Unchanged from PR #147 except: `whatsapp.service.ts` source has the #139 + #140 fixes from this PR.)

```
# Service test floors (unchanged set)
packages/services/src/__tests__/payment.service.test.ts                 # 29+ cases (PR #118)
packages/services/src/__tests__/invoice.service.test.ts                 # 40+ cases (PR #123)
packages/services/src/__tests__/shipment.service.test.ts                # 50 cases (PR #132)
packages/services/src/__tests__/whatsapp.service.test.ts                # 47 cases (PR #138 + this PR's flips)
packages/services/src/__tests__/whatsapp-tracked.service.test.ts        # 32 cases (PR #141)
packages/services/src/__tests__/manifest.service.test.ts                # 50 cases (PR #135 + #147)

# Source bugfixes landed this PR
packages/services/src/whatsapp.service.ts                               # postSmart semanticFailure short-circuit (#139); ?? -> || (#140)

# Authoritative backlog + decision docs (unchanged from PR #147)
docs/backlog/production-readiness.md
docs/decisions/2026-05-16-audit-logs-mechanism.md
docs/decisions/2026-05-17-whatsapp-sends-mechanism.md
docs/decisions/2026-05-17-backlog-drift-sentinel.md
```

---

## 10. The honest read

Tests 712 → 712 (no count change — three pre-existing LATENT/redundant-fallback tests FLIPPED to regression checks). Source diff: ~30 LoC net across two files. The brief's "DO NOT" list ran six items long; all six held. The per-commit split discipline held; either fix can be reverted independently.

The single most useful diagnostic from this session is the "passing-test ≠ correct-test" observation about the whatsapp-tracked.service Row 2 test (§ 7.22). Not acted on (would be wrapper scope creep) but recorded for future maintainer pickup.

**Recommended one-line summary for the next session's prompt:** "Pick up [`docs/backlog/production-readiness.md`](docs/backlog/production-readiness.md) item O2 — `as unknown as` cast cleanup at `apps/dashboard/app/api/public/invoice-pdf/route.ts` (rank #5; ~30 min). ONE PR. Decline any 'while we're here' expansion." (Or one of options B–G per owner priority.)

---

**Load the skills. Re-read § 1 (cadence pre-commit, TEN substantive PRs old). Pick a task from § 6 — or better, from `docs/backlog/production-readiness.md` directly. Ship one clean PR.**

When you're done, update or replace this file with a fresh handoff.
