# PR α Retro — 2026-05-15 (closing #112 / broad instrumentation adoption)

> Per-PR retro for PR α of the campaign. Campaign-level retro at [`docs/retros/2026-05-15-pm-campaign-track.md`](./2026-05-15-pm-campaign-track.md) covers the full sequence.

**Author:** Claude Code (Opus 4.7), PM-mode
**Branch state at PR start:** `main` at `e333e0c` (post-#113)
**PR landing target:** close #112

---

## 0. TL;DR

| Metric | Value |
|---|---|
| RPC migrations adopted | 7 (4 DIRECT-WRAP + 3 SELECTIVE) |
| RPC deferred (with marker) | 1 (`detect_sla_breaches`) |
| RBAC BLOCK sites adopted | 3 (the only BLOCK sites in the codebase per audit) |
| RBAC GATE sites left alone | ~10 (UI conditional rendering — intentional per audit) |
| New tests | 32 |
| Test count delta | 286 → 318 |
| Diff target | ≤1500 LoC (audit estimated ~941 actuals) |

---

## 1. What worked

### PHASE A audit document IS the safeguard
Writing the classification before any adoption code meant the reviewer (and future me) could check every line against an independently-committed contract. Several judgment calls (booking.service's selective adoption, dashboard.service's DEFERRED marker, the AMBIGUOUS site at send-invoice:325) had clear paper trails. The audit doc went in as commit (a) of its own — anyone reviewing the adoption commits has the bucket logic right there.

### The bailout almost fired but didn't need to
Audit estimated ~941 LoC additions; actuals tracked closely. The dashboard.service DEFERRED marker is the bailout in action at a per-line level — `withRpc` would have worked there mechanically but the silent-degrade pattern made adoption a behavior change. Mark + defer was the correct call.

### Test pattern from PR #113 paid dividends
The DI mock pattern (`registerSentry({ captureException: vi.fn() })`) plus a minimal `makeRpcDb` helper made the 23 service-adoption tests mechanical. No `@sentry/nextjs` import anywhere in tests. The cross-package contract sentinel from PR #113 (`canonical-rules-tag-contract.test.ts`) stayed green automatically because the tag-key constants didn't change.

### Static-analysis test for BLOCK adoption
Route handlers are notoriously hard to unit-test (cookies, NextResponse, Supabase admin service). The decision to use file-text grep for the BLOCK adoption contract was a deliberate tradeoff: brittleness in exchange for marginal-cost coverage. Documented inline that the "right reaction to brittleness" is to delete and replace with a real integration test — not to soften the assertion.

---

## 2. What surprised me

### Zero `canAccess`/`canDo` callers in `apps/`
The original #112 body listed sites that turned out to call `isManagerOrAbove` / `isAdminOrAbove`, not `canAccess`. The audit doc's first job was to actually grep the codebase and discover this. Lesson: don't trust an issue body's site list — re-derive from grep at audit time.

### `PostgrestFilterBuilder` is thenable, not a strict `Promise`
The first typecheck of `withRpc(name, () => db.rpc(...))` failed because Supabase returns its own builder type. Fix was a one-character widen from `Promise` to `PromiseLike`. Lesson: when introducing a wrapper that takes a `() => Promise<T>` callback, default to `PromiseLike` from day one if the most likely real-world callback is a thenable from an ORM/SDK.

---

## 3. What did NOT ship this PR

- The DEFERRED `detect_sla_breaches` decision (silent/info/error). Marked with `SENTRY-MIGRATION-DEFERRED` comment; follow-up needs to decide observability semantics.
- The AMBIGUOUS `isAdminOrAbove` sub-gate at `send-invoice/route.ts:325`. Treated as GATE-equivalent for this PR; follow-up needs to clarify intent.
- The full handoff replacement — deferred to the campaign-level retro at session end. This per-PR retro is a milestone marker, not a session boundary.

---

## 4. Carryforward

Both deferred items are tracked in the audit doc § 6. Once PRs β/γ/δ land and the campaign retro closes the session, these items become the next-session backlog. They are NOT critical — both are observability-completeness items, not correctness items.

Next in the campaign sequence: PR β (advance #94 — alert rule 6 + parameterized notification + owner procedure).
