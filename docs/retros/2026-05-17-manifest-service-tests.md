# Retro — manifest.service.ts full test floor (#102 / O1)

**Date:** 2026-05-17
**Author:** Claude Code (Opus 4.7) in PM-mode + Senior FSE + Big-Tech CTO + Designer.
**Base:** main at `7f11fe7` (post-#146 backlog-drift sentinel).
**Branch:** `feat/manifest-service-tests`
**Tests:** 659 → 712 (+53 cases).
**Scope verdict:** ONE PR; no bailout fired.

---

## 1. TL;DR

- Closed backlog item **O1** (rank #4 in `docs/backlog/production-readiness.md`). Full coverage of all 10 public methods on `manifest.service.ts` — extending PR #135's narrow `removeShipmentFromManifest` audit-surface coverage.
- Pattern-reuse-only: `makeDb` + `makeBuilderSpy` / `makeBuilderSpyByTable` verbatim from the canonical helpers; `freshManifestService()` factory mirrors `freshShipmentService()`; no new infrastructure. One additive extension to the shared helpers (added `ilike` chain method — same shape as PR #133's `range` addition).
- **First session under the #136 backlog-drift sentinel regime.** O1's `refs` block was updated in the same PR; the new sentinel verified all 11 symbol refs resolve on main and gated the change at CI. The drift gate worked exactly as designed.
- Tests-only discipline held: zero changes to `manifest.service.ts` source. No bugs surfaced that required follow-up filing.

---

## 2. PHASE-A AUDIT — what was covered, what was already there

`manifest.service.ts` exposes 10 public methods. PR #135 covered 1 (`removeShipmentFromManifest`, audit-wired). This PR covers the remaining 9 + an enum-exhaustiveness sentinel + a Sentry-negative-emission sentinel.

| # | Method | Status before this PR | Cases added | Notes |
|---|---|---|---|---|
| 1 | `getManifests` | UNCOVERED | 9 | filter combos (status / originHub / destHub / search / pageSize) + multi-filter + null-data + error + row-mapping. Triggered the `ilike` helper extension. |
| 2 | `getManifestById` | UNCOVERED | 5 | UUID branch / manifest-number fallback / not-found / error / uppercase-UUID regex sanity |
| 3 | `getManifestShipments` | UNCOVERED | 4 | join happy / missing-join-UNKNOWN-fallback / null-data / error |
| 4 | `createManifest` | UNCOVERED | 3 | happy with notes / without notes (undefined default) / error. `ManifestStatus.DRAFT` literal pinned at insert |
| 5 | `addShipmentToManifest` | UNCOVERED | 7 | full RPC-or-fallback decision tree (RPC happy / PGRST202 / 42883 / "function ... does not exist" message / "Could not find" message / RPC real-error emit+throw / fallback INSERT error) + payload value-contract |
| 6 | `removeShipmentFromManifest` | **6 cases (PR #135)** | 0 — **PRESERVED VERBATIM** | The audit-wired surface. Kept untouched at the bottom of the file with a section divider |
| 7 | `closeManifest` | UNCOVERED | 2 | RPC happy / RPC error → withRpc Sentry tag |
| 8 | `departManifest` | UNCOVERED | 2 | update payload value-contract (status=DEPARTED + departed_at ISO) + .eq("id", mid) / error |
| 9 | `arriveManifest` | UNCOVERED | 2 | same shape as departManifest |
| 10 | `reconcileManifest` | UNCOVERED | 2 | update payload value-contract (no timestamp column) / error |
| — | `ManifestStatus` enum exhaustiveness | — | 1 runtime + 1 compile-time sentinel | catalog #8 dual-sentinel mirroring ShipmentStatus / InvoiceStatus / PaymentMethod |
| — | Sentry tag-emission contract (negative) | — | 5 | passive pin on non-emitting methods (getManifests / getManifestById / getManifestShipments / createManifest / departManifest) |

**Total this PR: 44 new + 6 preserved = 50 cases.** Within PR #132's ~50-case envelope. Single PR, no bailout.

---

## 3. What shipped

| Surface | File(s) | LoC (added) |
|---|---|---|
| Test floor extension | `packages/services/src/__tests__/manifest.service.test.ts` | ~750 (file grew from 179 to ~920) |
| Helper extension (`ilike` chain method) | `packages/services/src/__tests__/helpers/make-builder-spy.ts` + `helpers/make-db.ts` | ~14 |
| Backlog O1 refs update + status to DONE | `docs/backlog/production-readiness.md` | ~12 |
| Retro (this file) + handoff replacement | `docs/retros/2026-05-17-manifest-service-tests.md` + `docs/NEXT-SESSION-HANDOFF.md` | ~250 |

Total: ~1,020 LoC. ~74% test code; ~26% docs/handoff/helpers. Well within the 1,500 LoC code-budget intent.

---

## 4. Discipline observations

### 4.1 The #136 backlog-drift sentinel regime — first real exercise

This is the first PR under the #136 regime. Two things worked exactly as designed:

1. **The O1 `refs:` block update is part of the PR.** The brief flagged that drift on this would fail the new CI gate. Updated proactively — added 9 new `symbol:` refs (one per newly-tested method) so the sentinel guards the full surface, not just the two refs it had before. The local `pnpm test apps/dashboard/__tests__/backlog-refs-drift.test.ts` run confirmed all 11 refs resolve on the post-PR tree before the PR was opened.
2. **The W1 dogfood case from PR #146 carried forward intact.** Nothing in this PR touched the whatsapp_sends wrapper, so W1's 13 refs continued to verify. The sentinel runs against ALL backlog refs on every PR — this PR's CI exercises both the modified O1 refs AND the unchanged W1 refs as a single gate.

The cumulative-discipline rule from PR #146's handoff § 7.18 ("authoritative-repo-file beats authoritative-GitHub-issue for sentinel-able artifacts") got its first cross-PR test today: a test-floor PR updates the backlog, the sentinel re-verifies, drift fails CI mechanically. Pattern holds.

### 4.2 Three "while-I'm-here" temptations resisted (brief named them)

1. **Fix a manifest.service.ts bug surfaced by testing.** The full RPC-or-fallback path of `addShipmentToManifest` was thoroughly exercised; the decision tree is correct (no bugs surfaced). Had any bug appeared, the discipline was document + file follow-up; nothing to apply.
2. **CI-gate the other four sentinels.** PR #146's retro § 7.3 flagged that `pnpm test` is NOT a CI gate today (the four pre-existing sentinels run only locally). This PR did NOT promote `pnpm test`; that's a separately-scoped carry-forward.
3. **Bundle any of the 8 open issues.** None touched. The PR strictly does the test-floor + the O1 refs update.

### 4.3 Four real fixes during local-gate iteration

Caught by local gates before the PR opened:

1. **`SUPABASE_RPC_TAG_KEYS` shape:** I had used `.fn` (assumed name). Actual keys: `rpc`, `rpcName`, `errorCode`. Two assertions updated. Lesson: don't assume the shape of a shared constants object — always grep first. Catalog #1 (value-contract) requires the actual key name.
2. **`captureSupabaseRpcError` wraps before emitting:** the emitted error is a `SupabaseRpcError` with code `"SUPABASE_RPC_FAILED"`, NOT the original `rpc.error` (which has `code: "P0001"`). The thrown error (`rejects.toMatchObject({code:"P0001"})`) is the raw one; the captured error is the wrapper. Two distinct assertions; previously I'd conflated them.
3. **`ManifestStatus` enum has 7 members, not 5:** I initially captured DRAFT/DEPARTED/ARRIVED/RECONCILED/CLOSED in the exhaustiveness matrix; the enum also has `BUILDING` and `OPEN` (intermediate lifecycle states). The dual-sentinel runtime check caught this — exactly its purpose. Updated the matrix with a comment explaining that BUILDING/OPEN are intermediate states transitioned via other surfaces, not written by this service.
4. **HubCode / ManifestStatus are TypeScript enums, not string-union types:** can't pass raw string literals; must use `HubCode.NEW_DELHI` / `ManifestStatus.DRAFT`. Typecheck caught this; updated five sites.

None of these required source changes; all are test-side corrections.

### 4.4 Tests-only discipline boundary held cleanly

`manifest.service.ts` source file is `git diff`-clean. No bugs surfaced during testing that required filing follow-ups. The closest call was the `getManifestShipments` "missing shipment join → UNKNOWN status" branch — a defensive `?? "UNKNOWN"` fallback that's clearly intentional. Tested as current behavior.

### 4.5 Pattern reuse — the canonical helpers held up

The four canonical helpers (`makeDb`, `makeBuilderSpy`, `makeBuilderSpyByTable`, `freshXService` factory pattern) absorbed every assertion shape this floor needed. The single extension — adding `ilike` to the chain-methods list in both helpers — is structurally identical to PR #133's `range` addition. No new mock builder, no fork.

The brief's "DO NOT introduce a new mock builder" boundary was easy to honor because the existing builders are well-shaped. Same observation as the prior four floors. The canonical-helper pattern is now five floors deep and showing no signs of strain.

---

## 5. CodeRabbit / Macroscope interactions (TBD until the PR runs)

This section will be filled in by the next session's retro if novel patterns surface. The 9 catalog entries were preempted per § 6 below; PRs #141 and #146 both went through both bots clean on first pass. This PR aims for the same.

If any NEW pattern surfaces, the discipline is: STOP after this PR; update `docs/patterns/coderabbit-catalog.md` as commit 0 of the next session.

---

## 6. CodeRabbit catalog preemption (9 entries)

| # | Entry | Applied? | Where |
|---|---|---|---|
| 1 | Value-contract over call-existence | YES | Every insert/update assertion captures the actual payload via `makeBuilderSpy`'s `spy.firstCallArgs(...)`. The Sentry-tag assertions assert specific tag values, not bare call-count. |
| 2 | nthCalledWith + toHaveBeenCalledTimes(N) | YES | Multi-step flows (createManifest's insert→select→single; addShipmentToManifest's rpc-then-from-then-insert) pin exact counts + sequences. |
| 3 | statSync isFile | N/A | No filesystem invariants here. |
| 4 | Sweep the whole describe block | YES | Every status × outcome combination enumerated; not just the canonical happy case. |
| 5 | No hardcoded line numbers in marker comments | YES | Comments reference symbol names (`ManifestStatus.DRAFT`, `withRpc`, `captureSupabaseRpcError`). |
| 6 | Anchor-scoped windows | N/A | No source-text region sentinels. |
| 7 | Generalize regex beyond current data shape | YES (defensive) | `departed_at` / `arrived_at` assertion uses `/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/` — matches ISO shape, not the literal value. |
| 8 | Enum exhaustiveness via satisfies + Exclude | YES | `ManifestStatus` covered via dual-sentinel (runtime `Object.values` + compile-time `Exclude<>`). |
| 9 | Abstract on second use | N/A | No new helper; the helper extension (`ilike`) is additive to a canonical helper, not a new abstraction. |

---

## 7. Carry-forward

### 7.1 Owner-action carry-forward (unchanged from PR #146's retro § 7.1)

| Item | Action |
|---|---|
| `#102` body still has the stale checkbox list + the PR #137 tick-list corrections were never pasted | Owner edits `#102`'s body to point at `docs/backlog/production-readiness.md` as authoritative |
| `#94` Sentry alert-rule notification action | 5-min owner-runnable; not agent-actionable |
| Windows worktree-directory cleanup at `C:/tac/tac-express/tac-whatsapp-sends-102/` | The dir is git-untracked but the filesystem dir remains due to the Windows long-path issue. Cleanup via `rd /s /q \\?\C:\tac\tac-express\tac-whatsapp-sends-102` from cmd.exe |

### 7.2 Filed-this-session: NOTHING (zero scope creep)

No new GitHub issues filed. Every adjacent surface (the helper extension, the additional symbol refs, the dual-sentinel matrix) was implemented inline as additive, not as a separate concern.

### 7.3 Future-agent: candidates for the next session (in priority order per backlog)

- **O2** — Cleanup the remaining `as unknown as` cast at `apps/dashboard/app/api/public/invoice-pdf/route.ts`. ~30 min standalone or fold into next PDF-touching PR. Rank #5.
- **CI-gating gap** — promote `pnpm test` to a generic CI gate (or, more conservatively, add dedicated gates for the four existing sentinels). PR #146's retro § 7.3 flagged. Policy decision; needs PHASE-0.
- **W2 / W3 / W4 / W5** — the four whatsapp_sends follow-ups. W2 (operator retry UI) is the most user-facing; W3 (automated retry) is multi-session.
- **#139 / #140** — small standalone whatsapp.service.ts source bugs. Each is its own PR per the discipline rule.
- **#130 / #131** — own sessions per the brief.

---

## 8. The honest read

Pattern-reuse session as advertised; the five-floor canonical-test pattern (`makeDb` + `makeBuilderSpy` + `freshXService` factory + enum dual-sentinel + Sentry negative-pin) absorbed every assertion this floor needed. The new #136 backlog-drift sentinel got its first live exercise reacting to a backlog edit — sentinel green, gate green. The single additive helper extension (`ilike`) followed PR #133's precedent shape exactly.

Tests 659 → 712 (+53). Source diff: zero. Backlog O1 status: OPEN → DONE with 11 verifiable refs. Zero new dependencies. Zero "while we're here" expansion. Seven gates green locally; CI's eighth gate (`Backlog references drift check`) re-verifies on the PR.
