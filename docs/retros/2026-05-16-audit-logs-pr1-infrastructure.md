# Session Retro — audit_logs hardening (PR 1, infrastructure)

**Date:** 2026-05-16
**Session shape:** second substantive Sprint 2 session; third cadence test
**Author:** Claude Code (Opus 4.7) in PM + Senior FSE + CTO + Security-architect mode
**Predecessor:** PR #132 (shipment.service.ts test floor, 50 cases)
**Decision doc:** [`docs/decisions/2026-05-16-audit-logs-mechanism.md`](../decisions/2026-05-16-audit-logs-mechanism.md)

---

## 1. TL;DR

Shipped PR 1 of a deliberately-split 2-PR audit-logs hardening arc. The bailout clause fired during PHASE-0 because the task is genuinely two-PR scope (infrastructure + adoption) — confirmed by the prompt's own seam description matching the scope reality.

**Shipped this PR:**
- Migration adding `before_state jsonb` + scoped `action` CHECK constraint to the existing `audit_logs` table (RLS tamper-evidence preserved exactly — no new UPDATE / DELETE policies).
- Fixed `audit.service.ts` — its `logEvent` was inserting four columns (`old_values`, `new_values`, `ip_address`, `user_agent`) that NEVER existed in the schema. The bug was orphaned because nothing called `logEvent`; surfaced and fixed as a side-effect of the schema work.
- Added `withAudit` wrapper at `packages/services/src/shared/with-audit.ts` — audit-first, fail-loud, deterministic Sentry tags on audit-write failure.
- Added `DESTRUCTIVE_OP_REGISTRY` at `packages/services/src/shared/destructive-op-registry.ts` — three entries (payment_delete, invoice_cancel, manifest_revert).
- Two sentinels: registry-coverage (PR 1 scope only — wrapper contract + meta-exhaustiveness; PR 2 will tighten to assert per-method withAudit adoption) and audit-logs-no-update-delete (closes the service_role-bypass hole at the application layer).
- Updated `AuditLog` type + `DESTRUCTIVE_AUDIT_ACTIONS` + `DestructiveAuditEntityType` exports.
- Updated `apps/dashboard/.../audit-client.tsx` — was reading the phantom columns; now reads `beforeState` and uses the canonical action vocabulary.

**Test floor:** 515 → 540 (+25). All six load-bearing CI gates green locally:
- typecheck ✓
- lint (max-warnings 0) ✓
- test (540 / 540) ✓
- build (both apps) ✓
- audit:governance + audit:auth-boundary + audit:skills + audit:design-spec + test:routing-eval ✓
- alert-rule lint (6 rules) + npm audit (no vulns) ✓

migrations-fresh-apply runs only in CI (needs supabase CLI + Docker); the migration is idempotent (IF NOT EXISTS + pg_constraint guard) and includes its own do$$ verification block.

**Deferred to PR 2:** Adoption of `withAudit` in `payment.service.ts:deletePayment`, `invoice.service.ts:cancelInvoice`, and a newly-designed `revertManifest` method in `manifest.service.ts`. The PR 1 sentinel skips the per-method assertion for `manifest_revert` (the method doesn't exist yet) and PR 2's commit-1 task is to uncomment the adoption-assertion block.

---

## 2. The PHASE-0 decision and why

The prompt named three options (A: DB-trigger / RPC-internal; B: service-layer hook; C: hybrid wrapper + sentinel). The decision doc has the full evaluation; the load-bearing factors:

- **Reality check.** The `audit_logs` table EXISTS, RLS is already tamper-evident (no UPDATE/DELETE policies), and DB-internal audit writes EXIST in two SECURITY DEFINER RPCs already (`resolve_exception`, `update_shipment_status`). The task was hardening + adoption, not greenfield design.

- **Codebase ergonomics.** The Sprint 2 service-test floors all use `makeDb` + `makeBuilderSpy`. JS-side `withAudit` plugs into this pattern; Option A would require integration tests against real Postgres for each new SECURITY DEFINER function.

- **Forcing-function pattern is proven.** The sentinel-registry-with-meta-exhaustiveness shape is the same shape as five other sentinels already shipped (RBAC block-adoption, pino-no-console, audit-doc-references, canonical-rules-tag-contract, silent-by-design). Adoption is mechanical; failure mode is "specific test red," not "audit log silently misses."

- **Atomicity gap acknowledged.** Audit-first / fail-loud collapses the failure modes to "audit-only orphan, observable" instead of "silent destruction." Per-op upgrade to Option A remains available as a one-line registry edit + one-line service edit if any future destructive op needs strict atomicity.

- **Application-layer hole closure.** LAW 6/7 already preclude destructive SQL outside `packages/services`. The no-update-delete sentinel closes the service_role-bypass hole in application code. The remaining holes (direct psql, migrations issuing destructive SQL, service_role from edge functions) are operational and named in the decision doc § 5.4.

---

## 3. The bailout call — what triggered it, why it was right

The prompt's bailout clause was the clearest "if-then" I've seen in a task brief, and it fired exactly on the seam it described:

> "PR 1 (this session): migration + tamper-evident RLS + the audit-write mechanism's infrastructure (the trigger function, OR the withAudit wrapper) + tests for that infrastructure. PR 2 (next session): adoption across all three destructive ops + their tests."

The trigger for me: during PHASE-0, the manifest-revert ambiguity surfaced. The prompt listed `manifest revert` as one of three destructive ops, but **the method doesn't exist** — no `revertManifest` in `manifest.service.ts`, no `revert_manifest` RPC. PR 2 has to DESIGN the method (revert from CLOSED→OPEN? DEPARTED→OPEN? affects manifest_shipments how?) before wiring `withAudit`. Doing that design + the adoption + the test floor would have pushed PR 1 past the 1500-LoC limit and past the "one focused session" cadence.

Splitting was right. PR 1 is infrastructure that's tested, sentinel-protected, and independently coherent. PR 2 is pure adoption — and the design surface for `revertManifest` is its own bounded problem.

---

## 4. Cadence-discipline observations (third test)

Per the cadence rule (one PR per Sprint 2 session, no bundling), and per `feedback_cadence_discipline_first_test`:

### 4.1. What surfaced during this session that could have bundled

| Item | Bundle temptation | Outcome |
|---|---|---|
| `audit.service.ts.logEvent` was outright broken (phantom columns) | "fix it as a separate PR" | KEPT in this PR — the migration's schema change makes the bug fixable in the same commit set; splitting it out would have left main red. Correctly NOT a bundle. |
| `audit-client.tsx` was reading the phantom columns | "leave for PR 2 cleanup" | KEPT in this PR — typecheck would fail without it (the `AuditLog` type no longer has the phantom fields). Minimum-required surgical edit. |
| The handoff-doc claim of "12 CodeRabbit catalog entries" is wrong (it's 9) | "fix the handoff while we're here" | DEFERRED — it's documentation drift in a doc that itself gets superseded by the new handoff this PR writes. Will land in the new handoff naturally. |
| Adding `range` to the canonical `makeDb` / `makeBuilderSpy` helpers (the audit service uses it; no other consumer did) | "extract a separate cleanup commit" | KEPT in this PR — the test for audit.service.listAuditLogs can't pass without it. Same pattern as the prior `register` extension in PR #132. |
| Adopting `withAudit` in `deletePayment` / `cancelInvoice` in this PR | "they exist, they're small, why split?" | DEFERRED to PR 2 — the seam is real; PR 1's sentinel honestly says "wrapper contract + exhaustiveness only" because the adoption-assertion would either be vacuous or force the bundling. |

The third bundle-temptation is the one to call out: **adopting `deletePayment` + `cancelInvoice` in PR 1 was the most attractive scope-creep option of this entire arc.** They're small (~10 LoC each). They'd let PR 1 ship "real" adoption alongside the infrastructure. Resisting required naming the rule out loud: PR 2 ALSO has to land `revertManifest`'s design + adoption, and splitting "all-or-none adoption" cleanly along the seam is more honest than half-adoption in PR 1 with `revertManifest` deferred.

### 4.2. Third test verdict

The cadence rule held. The PR body's "while we're here" section is empty by construction — none of the deferred items were bundled. PR 2 (revertManifest design + 3-method adoption + sentinel flip) is filed as a follow-up issue with explicit scope.

### 4.3. New observation worth codifying

The bailout clause works best when it's named in the task prompt with a clean seam. When the prompt names the seam, the bailout call is mechanical: "is the work bigger than the cleanly-separable-along-that-seam scope?" → yes → split there. When the seam isn't named, the agent has to invent it AND defend it AND apply the cadence rule — three judgment calls instead of one. Recommend future task prompts continue naming bailout seams explicitly.

---

## 5. What surprised me

- **The audit_logs table already existed.** The prompt's frame ("design + migration + service hook + tests") implied greenfield; the reality was schema-hardening on a half-built surface. The decision doc's full evaluation took ~2x as long as it would have for a clean-slate decision because half the work was deciding what NOT to redesign.

- **`logEvent` was broken AND orphaned.** The phantom-column references (`old_values`, `new_values`, `ip_address`, `user_agent`) compiled and would have failed at runtime — except nothing called `logEvent`, so the bug never fired. This is a textbook example of `cast-comment-as-bug-ticket` (catalog entry #11 equivalent): an unused service that asserts a wrong schema is a latent bug, not benign dead code. The audit-client.tsx also read those fields, displaying `—` permanently in production. Two callers, one bug, silently broken for an unknown duration.

- **The DB-internal audit precedent was already live.** Two SECURITY DEFINER RPCs (`resolve_exception`, `update_shipment_status`) insert into `audit_logs` server-side. Option A is partially adopted; the decision doc had to explicitly compare against THIS reality, not against "Option A as a hypothetical." Made the doc's tradeoff section more useful.

- **`manifest revert` doesn't exist.** This was the load-bearing PHASE-0 surprise. The prompt named it as one of three destructive ops; I expected to find a `revertManifest` method. Instead the closest thing was `removeShipmentFromManifest` (a different shape entirely). Resolving this required either:
  - Mapping `manifest_revert` → `removeShipmentFromManifest` (changes the semantics — that's a join-row edit, not a primary-record destruction), OR
  - Deferring `revertManifest`'s design to PR 2 (chosen — splits along the natural seam).

  The second option is what the bailout clause names, but only because the prompt prescribed the seam.

---

## 6. CodeRabbit-preempt sweep

Patterns from `docs/patterns/coderabbit-catalog.md` applied proactively:

| # | Pattern | Where applied |
|---|---|---|
| 1 | Value-contract over call-existence | All `logEvent` / `withAudit` tests capture the actual insert payload via `spy.firstCallArgs("insert")?.[0]` — bare `toHaveBeenCalledWith` would have passed even if the wrapper dropped a field. |
| 2 | Multi-step ordering | The audit-first / destructive-second ordering test reads `spy.calls.insert.length` from inside `destructiveOp`, proving the order without relying on `toHaveBeenNthCalledWith` (`withAudit` only does one `.from()` call). |
| 5 | No hardcoded line numbers | Marker comments reference function names (`logEvent`, `withAudit`) + decision-doc anchors, not line numbers. |
| 6 | Anchor-scoped windows | `destructive-op-registry-coverage.test.ts` matches methodName patterns within the service file's body, not a file-level `toContain`. |
| 7 | Generalize regex | The `audit-logs-no-update-delete` sentinel matches both `.from("audit_logs").update(` and `.from('audit_logs').delete(` and tolerates intermediate `.eq()`/`.in()` chain links via `[\s\S]{0,400}?` instead of hardcoding the chain shape. |
| 8 | Enum exhaustiveness | `DESTRUCTIVE_AUDIT_ACTIONS` is `as const satisfies readonly AuditAction[]`. The registry and the audit.service.test.ts both have `Exclude<DestructiveAuditAction, ...>` compile-time gates. |
| 9 | Abstract on second use | `range` was added to `makeDb` + `makeBuilderSpy` because audit.service.ts is the first service-test consumer that paginates with `.range()`. The helper extension is minimal (one literal in each helper's array). |

CodeRabbit-catalog entry #11 (cast-comment-as-bug-ticket) is implicitly exercised by the `audit.service.ts` rewrite: the prior implementation referenced phantom columns; the rewrite is a root-cause fix per the catalog's rule.

---

## 7. Handoff override note

Per the task prompt: this session chose risk-rank #1 (audit_logs) over the post-#132 handoff's § 6 Option-A momentum default (`manifest.service.ts` test floor). One-line rationale:

> Every destructive op that runs between now and audit_logs shipping is permanently unrecoverable evidence. The risk-of-decay cost accrues daily; manifest.service.ts's absence does not.

Per the PR #132 review process note ("momentum-vs-risk must be a named, auditable decision every session"), this override is named explicitly in the PR body AND in the post-PR-1 handoff's § 6.

---

## 8. PR 2 scope (filed as follow-up issue)

- Adopt `withAudit` in `payment.service.ts:deletePayment` (single DELETE — cleanest first adoption)
- Adopt `withAudit` in `invoice.service.ts:cancelInvoice` (UPDATE with status-guard preserved)
- Design `revertManifest` in `manifest.service.ts`:
  - From which statuses can a manifest revert? (CLOSED / DEPARTED / ARRIVED → likely CLOSED → OPEN only)
  - What happens to `manifest_shipments`? (Stay attached? Freed?)
  - Who can call it? (mirrors `closeManifest`'s RLS — MANAGER+)
- Adopt `withAudit` in the new `revertManifest`
- Uncomment the adoption-assertion block in `destructive-op-registry-coverage.test.ts` and delete the explanatory block-comment in the file header
- Tests for each adoption (mirror payment/invoice/shipment test-floor pattern; ~30-50 LoC per adoption)

Expected size: 600-900 LoC. One focused session per the cadence rule.

---

## 9. Honest read

- **What went well:** The PHASE-0 decision doc paid for itself within an hour — every subsequent code decision routed back to it. The bailout call was straightforward because the prompt named the seam. Test floor pattern from PRs #118/#123/#132 transferred cleanly; the only helper extension needed was `range`.
- **What was friction:** The pre-existing `audit:db-types-fresh` failure on main (stale types file commit timestamp) was a momentary distraction — confirmed it's not CI-gated and moved on. Windows path handling in the no-update-delete sentinel needed an explicit `replace(/\\/g, "/")` in the error message for human readability.
- **What I'd flag to the next session:** The migration adds a CHECK constraint scoped to three string literals. Adding a fourth destructive action requires editing FOUR places: the AuditAction union, `DESTRUCTIVE_AUDIT_ACTIONS`, the registry, AND a new migration extending the CHECK. The compile-time `Exclude` check catches three of the four; the migration is the one the contributor will forget. The audit.service.test.ts has a "destructive action without before_state" case that asserts the DB error surfaces — that's the only test that pins the CHECK's existence at the JS layer. If the CHECK ever silently disappears (e.g., a rollback migration), the test would still pass (the mock builder always returns the mocked error). The migration's own `do$$` verification block is the load-bearing protection there.

Ready to merge once owner reviews + types `merge PR #<N>`.
