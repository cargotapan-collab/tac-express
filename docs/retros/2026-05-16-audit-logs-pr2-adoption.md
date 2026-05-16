# Session Retro — audit_logs adoption (PR 2 / #134)

**Date:** 2026-05-16
**Session shape:** third substantive Sprint 2 session; fifth cadence test; completes #102 risk-rank #1
**Author:** Claude Code (Opus 4.7) in PM + Senior FSE + CTO + Security-architect mode
**Predecessor:** PR #133 (audit_logs PR 1 infrastructure)
**Successor:** none for the audit-logs arc — #102 audit_logs item is now fully discharged
**Decision doc:** [`docs/decisions/2026-05-16-audit-logs-mechanism.md`](../decisions/2026-05-16-audit-logs-mechanism.md) (PR #133 — unchanged)

---

## 1. TL;DR

Wired all three destructive ops to PR #133's `withAudit` infrastructure. The audit system now does what it was built to do: every destructive op produces exactly one tamper-evident audit row.

PHASE-0 reconciliation found one CHECK-constraint mismatch that the prompt explicitly told me to fix: PR #133's enum included `manifest_revert` as a placeholder for a method that didn't exist. Per the task brief (do not build destruction capability solely to give the audit system a hook), the real manifest destructive op is `removeShipmentFromManifest`. Shipped migration `20260516000002` to rename the CHECK enum value to `manifest_shipment_remove` — the honest name for the op that actually exists — and propagated the rename through `AuditAction`, the registry, the audit-client, and PR #133's test fixtures.

**Shipped this PR:**
- Migration `20260516000002_audit_logs_check_manifest_shipment_remove.sql` — pre-flight asserts zero existing rows use the legacy value, drops + re-adds the CHECK constraint, post-flight verifies the new enum is present and the legacy value is gone.
- `withAudit` adopted in three service methods, with an audit-first SELECT-then-INSERT-then-DESTRUCTIVE pattern in each:
  - `payment.service.ts :: deletePayment`
  - `invoice.service.ts :: cancelInvoice` (status guard `.in("status", ["DRAFT", "ISSUED"])` preserved inside the wrapper)
  - `manifest.service.ts :: removeShipmentFromManifest`
- Sentinel `destructive-op-registry-coverage.test.ts` flipped from "wrapper contract only" to "per-method withAudit adoption" — the previously block-commented `(e)` assertion is active. Added a defense-in-depth import-line check to rule out comment-only or string-only false positives.
- Per-op test floors: 6 new cases in `payment.service.test.ts`, 5 new cases in `invoice.service.test.ts`, 6 new cases in new file `manifest.service.test.ts`. Each suite asserts: SELECT-then-INSERT-then-DESTRUCTIVE ordering, audit payload shape, no-double-audit (audit_logs hit exactly once), audit-write failure blocks the destructive op, and (where applicable) preservation of existing guards.
- Type / registry rename propagated through `audit.types.ts`, `destructive-op-registry.ts`, `apps/dashboard/app/ops-console/audit/audit-client.tsx`, and PR #133's `audit.service.test.ts` + `with-audit.test.ts` (the `manifest_revert` literals in those test files were renamed via sed).

**Test floor:** 540 → 556 (+16). All six load-bearing CI gates green locally:
- typecheck ✓
- lint (max-warnings 0) ✓
- test (556 / 556) ✓
- build (both apps) ✓
- audit:governance + audit:auth-boundary + audit:skills + audit:design-spec + test:routing-eval ✓
- alert-rule lint (6 rules) + npm audit (no vulns) ✓

`migrations-fresh-apply` runs in CI (needs Supabase CLI + Docker); both migrations are idempotent + carry their own do$$ verification blocks.

**Risk-rank #1 is now fully discharged.** Destructive ops produce exactly one tamper-evident audit row each, blocking on audit failure (no audit = no destruction).

---

## 2. The PHASE-0 reconciliation outcome

The central correctness risk this PR named explicitly: DOUBLE-AUDITING. PR #133's PHASE-0 had found two SECURITY DEFINER RPCs that already write audit rows server-side (`resolve_exception` → action='RESOLVED'; `update_shipment_status` → action='STATUS_CHANGE'). If any of the three destructive ops ran through a path that also audited server-side, wrapping it with `withAudit` would produce two rows per op — corrupting the audit trail.

### Per-op execution path map

| Op | Execution path | Server-side audit? | Mechanism | Action value (CHECK) |
|---|---|---|---|---|
| `deletePayment` (payment.service.ts) | `db.from("invoice_payments").delete().eq("id", id)` — plain JS-side mutation | NO. No RPC. No trigger on invoice_payments writes audit (verified via pg_trigger query). | service-layer `withAudit` | `payment_delete` — matches CHECK as shipped in #133 |
| `cancelInvoice` (invoice.service.ts) | `db.from("invoices").update({ status: "CANCELLED" }).eq("id", id).in("status", [DRAFT, ISSUED])` — plain JS-side mutation | NO. No RPC. The only invoices trigger is `update_invoices_updated_at` (updated_at maintenance, doesn't write audit). | service-layer `withAudit` | `invoice_cancel` — matches CHECK as shipped in #133 |
| `removeShipmentFromManifest` (manifest.service.ts) | `db.from("manifest_shipments").delete().eq("manifest_id", id).eq("awb_number", awb)` — plain JS-side mutation | NO. No RPC. No trigger on manifest_shipments writes audit. | service-layer `withAudit` | **`manifest_shipment_remove` — CHECK MISMATCH** (constraint shipped in #133 said `manifest_revert`) |

Per-op verification: `SELECT proname FROM pg_proc WHERE prosrc ILIKE '%audit_logs%'` returned only `resolve_exception` + `update_shipment_status` — neither overlaps with the three destructive ops. `SELECT t.tgname, p.prosrc ILIKE '%audit_logs%' FROM pg_trigger t JOIN pg_proc p ON t.tgfoid = p.oid WHERE c.relname IN (invoice_payments, invoices, manifest_shipments, manifests)` returned only the two `updated_at` maintenance triggers. **Zero double-audit risk for our three ops.**

### CHECK-constraint reconciliation

PR #133 shipped a CHECK constraint enumerating `payment_delete`, `invoice_cancel`, `manifest_revert`. The third value was a placeholder for a method (`revertManifest`) that didn't exist in the codebase. The prompt's anti-pattern rule was unambiguous: "DO NOT write an action value the CHECK constraint rejects, or keep a constraint value no op uses. Reconcile the constraint."

This PR ships migration `20260516000002_audit_logs_check_manifest_shipment_remove.sql` that:
1. Asserts pre-flight that zero rows use the legacy value (audit_logs is append-only; no production rows reference `manifest_revert` because no code path could ever have written it).
2. Drops the old constraint.
3. Re-adds it with `payment_delete | invoice_cancel | manifest_shipment_remove`.
4. Post-flight verifies the new enum is present and the legacy value is gone.

The rename propagates through `AuditAction` (`@workspace/types`), `DESTRUCTIVE_AUDIT_ACTIONS`, the `DESTRUCTIVE_OP_REGISTRY` entry, the audit-client's filter dropdown + ActionBadge variant switch, and the two test files PR #133 shipped that hardcoded `manifest_revert` (`audit.service.test.ts`, `with-audit.test.ts`).

### Manifest-revert decision

Confirmed and recorded: **no revertManifest method exists; we do NOT build one in this PR.** Per the task brief, building destruction capability solely to give the audit system a hook is backwards. The destructive op that exists is `removeShipmentFromManifest`, and that's what carries the audit hook. If product surfaces a genuine need for a manifest-wide revert later, that's a separate feature issue with its own PHASE-0.

The issue #134 body (filed pre-decision during PR #133's session) still says "design + add revertManifest" — that's stale. The override is named explicitly in the PR body's PHASE-0 section.

---

## 3. Transactionality

Same posture as PR #133's decision doc § 4 (no change). Each adoption performs:

1. SELECT row (capture before_state) — single round-trip.
2. INSERT audit row — single round-trip.
3. DESTRUCTIVE op (DELETE / UPDATE) — single round-trip.

Three round-trips, not one transaction. The audit-first ordering means the only possible inconsistency is "orphaned audit row, observable" — never silent destruction. The wrapper throws `AuditWriteFailedError` if step 2 fails, so step 3 never runs without a committed audit row.

The SELECT failure mode (step 1) was added in this PR for each op's adoption: if the read fails for any reason, the operation throws before reaching the audit write. No audit row is created for an attempted read of a row that errored. This matches operator intuition (a failed SELECT is a system error, not a destructive attempt).

The no-row short-circuit (step 1 returns no rows) preserves the prior idempotent semantics of each method: a double-click or stale-request DELETE call still no-ops without spuriously creating an audit row. This is deliberate — auditing a no-op would be noise.

---

## 4. The fifth cadence test

The cadence rule (one PR per Sprint 2 session, no bundling) has now survived **five real tests**:

1. First test (post-#129): bundle `regex-alternation gate` + `branded ServiceLevel` into the analysis session → DECLINED.
2. Second test (PR #132): bundle three "while I'm here" expansions into the shipment.service test floor → DECLINED.
3. Third test (PR #132 session boundary).
4. Fourth test (PR #133): bundle adoption alongside infrastructure → DECLINED. Filed as issue #134.
5. **Fifth test (this PR / #134):** two distinct bundle temptations surfaced. Both DECLINED.

### Bundle temptation 1: building `revertManifest` because the registry "needed" it

The strongest pressure of this session. The issue #134 body itself said "Design + add `revertManifest`" — i.e., the prior session's plan was to build it. The CHECK constraint enumerated `manifest_revert`. The natural-language pull toward shipping a method that closes both gaps was real.

The task brief overrode this: **"DO NOT build a revertManifest method. Building destruction capability solely to give the audit system a hook is backwards."** Resisted; renamed the CHECK enum value to match the op that exists instead. The PHASE-0 section in the PR body documents the override explicitly.

### Bundle temptation 2: auditing more ops than the three named

Walking the manifest.service surface, several other methods are destructive-ish: `closeManifest`, `departManifest`, `arriveManifest`, `reconcileManifest`. The decision doc's § 5.2 specifically scoped the registry to "destruction of a primary financial / shipment / manifest record, OR a status transition that cannot be reversed without operator action" — status transitions are NOT in scope, intentionally. None of these were wired. None were even added to the registry. If product policy changes to treat them as auditable, that's a future PR.

### What's new from this test

The **issue-body-says-X-but-the-current-prompt-overrides** pattern. The prior session's issue body (#134) was filed in good faith during PR #133's session with the best understanding at the time. By the time this session began, the task brief had updated the manifest-revert call. Future agents should treat the task brief as the live decision and the issue body as historical context — but always reconcile the gap explicitly in the PR body (which I did).

---

## 5. CodeRabbit-preempt sweep

The 9 catalog entries:

| # | Pattern | Applied here |
|---|---|---|
| 1 | Value-contract over call-existence | Every per-op test reads `spy.firstCallArgs("insert")?.[0]` for the audit payload; `spy.firstCallArgs("update")?.[0]` for the destructive UPDATE; etc. No bare `toHaveBeenCalledWith`. |
| 2 | Multi-step `nthCalledWith` | The per-op ordering tests use `tableCalls` array equality to pin the three-step sequence — equivalent to `nthCalledWith` for the multi-step path. |
| 3 | `statSync(...).isFile()` | N/A — no new file-existence invariants this PR. |
| 4 | Sweep whole describe block | All three new `deletePayment` / `cancelInvoice` / `removeShipmentFromManifest` test blocks consistently apply the same audit-payload + table-call-ordering + no-double-audit + audit-fail patterns — uniform. |
| 5 | No hardcoded line numbers | All marker comments use symbol names (`AUDIT-WRAPPED`, function names, migration filenames). |
| 6 | Anchor-scoped windows | The flipped sentinel's `wrapperRe` matches `withAudit(` followed by the action literal within a 400-char window, not file-level `toContain`. |
| 7 | Generalize regex | The flipped sentinel's import-line check matches `from\s+["']\.\/shared\/with-audit["']` — handles both quote styles + variable whitespace. |
| 8 | Enum exhaustiveness | `DESTRUCTIVE_AUDIT_ACTIONS` is unchanged from PR #133 (still `as const satisfies readonly AuditAction[]`); only the third literal renamed. The registry's `Exclude<...>` compile-time check + the audit.service.test.ts dual-sentinel both still active. |
| 9 | Abstract on second use | No new helpers; the three adoptions reuse `makeDb` + `makeBuilderSpy` verbatim. |

---

## 6. Honest read

- **What went well:** PHASE-0 reconciliation routed through cleanly. The double-audit risk was concrete enough to be answerable (Supabase MCP queries gave a definitive yes/no per op). The CHECK-constraint rename was the right call — keeping the placeholder value would have been a permanent latent-integrity smell. The five-test cadence streak is durable.
- **What was friction:** The existing `deletePayment` and `cancelInvoice` tests in PR #133's test floor used a single-builder pattern that returned `{data: null, error: null}` — adequate for testing only the DELETE/UPDATE round-trip, but the new SELECT-first path short-circuits when data is null. Had to refactor those tests to provide a row in the fixture. Total LoC delta in the refactored sections is modest (~80 LoC) but the test-pattern shift is notable for future contributors writing tests against audit-wrapped methods.
- **What I'd flag to the next session:** Risk-rank #1 is now discharged. The handoff's § 6 needs to name the next-highest-risk item. Per the post-#132 process note ("momentum-vs-risk must be a named, auditable decision every session"), the next agent picks between #94 (Sentry alert-rule wiring, 5-min owner-only), the `manifest.service.ts` full test floor (the natural test-coverage gap exposed by this PR's narrow manifest.service.test.ts), the `whatsapp.service.ts` floor (larger but unaudited), or the smaller #130/#131 items. The decision-rationale lives in § 6 of the new handoff.

Ready to merge once owner reviews + types `merge PR #<N>`.
