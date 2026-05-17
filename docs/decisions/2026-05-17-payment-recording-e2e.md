# PHASE-0 — Payment-recording E2E (SB-4 / E1 carve-out)

**Date:** 2026-05-17
**Closes:** [SB-4 in DoD](../launch/definition-of-done.md#sb-4--payment-recording-e2e-backlog-e1-carve-out) / backlog [E1 (carve-out)](../backlog/production-readiness.md#e1--e2e-flows-5-grouped-items).
**Review posture:** **HEIGHTENED-SELF-REVIEW** — CodeRabbit's last review on PR #159 surfaced a billing warning ("payment not collected >72h"). Status uncertain; default to over-preparing.

---

## Scope check (OD-2 unresolved but unambiguous)

The DoD's SB-4 scope is explicit: payment-recording carve-out only. OD-2 (whether to promote the other 4 E1 flows) is unresolved, but it governs whether MORE flows become future ship-blockers — not whether payment-recording is in scope. **This PR is payment-recording, period.** No other E1 flow.

---

## A. Harness reuse

The new test extends the existing Playwright setup in `apps/dashboard/e2e/` — same config, same auth-setup, same CI invocation. No parallel harness.

| Piece | Reused / new |
|---|---|
| `apps/dashboard/playwright.config.ts` | Reused as-is — workers=1, baseURL=`http://localhost:3001`, storageState shared via `e2e/.auth/operator.json` |
| `apps/dashboard/e2e/_auth.setup.ts` | Reused — produces the operator auth state shared by all desktop projects |
| `desktop-1280` + `desktop-1920` projects | Reused — the new spec runs in BOTH viewports automatically (no project config change) |
| `.github/workflows/e2e.yml` | Reused — the workflow runs `playwright test` (no spec filter), so a new spec in `apps/dashboard/e2e/` runs automatically. No workflow edit. |
| `e2e/.auth/operator.json` | Reused — auth state for the dashboard MANAGER+ test user |
| `SUPABASE_SERVICE_ROLE_KEY` | Reused — already provided to the CI workflow (line 47 of `e2e.yml`) |

**New files:**
- `apps/dashboard/e2e/payment-recording.spec.ts` — the test
- `apps/dashboard/e2e/_helpers/payment-fixture.ts` — service-role seed + teardown helper

Nothing structural in the harness needs to change.

## B. Authentication

| Decision | Value |
|---|---|
| Mechanism | Reuse `e2e/.auth/operator.json` storage state from `_auth.setup.ts` |
| Credential source | `E2E_USER_EMAIL` + `E2E_USER_PASSWORD` env vars (already in `e2e.yml` lines 50-51 via repo secrets; already in operator's local `.env.local` per the existing pattern) |
| Required role | MANAGER+ (mirrors the role-gate on `/api/whatsapp/send-invoice` route + the matching `/ops-console/finance/[id]` page surfaces) |
| Skip behavior | If `hasAuthSession()` returns false (env vars absent locally), the spec skips with a clear message — same pattern as `print.spec.ts` |
| No hardcoded credentials | The spec NEVER references the email/password directly; auth is fully delegated to the existing setup |

## C. Test data — seed and teardown

The flow requires an **ISSUED invoice with `balance > 0`** as a precondition (the "Record Payment" button only appears on issued invoices with outstanding balance — verified at [`ops-invoice-detail-live.tsx:651-661`](../../apps/dashboard/app/ops-console/finance/[id]/ops-invoice-detail-live.tsx)).

**Approach: per-test isolated fixture.** Use the Supabase service-role client (Node-side, NOT browser) to seed a complete fixture in `beforeAll`, and tear it down completely in `afterAll`.

```text
beforeAll:
  1. Create test customer (UPSERT by stable id `e2e-payment-test-customer`)
     — idempotent across runs; remains across runs
  2. Create test shipment for that customer (UPSERT by stable id)
     — idempotent across runs; remains across runs
  3. Create FRESH invoice for that shipment:
     - status='ISSUED', total_amount=100, balance=100, advance_paid=0
     - id is a NEW uuid per test run (stored in test-local state)
  → return { invoiceId } as the test-scoped data

test (the actual journey):
  4. UI: log in (auth state reused), navigate to /ops-console/finance/{invoiceId}
  5. UI: click "Record Payment" button → dialog opens
  6. UI: enter amount 0.01 (tiny non-zero amount per scope-min discipline)
  7. UI: keep default method (UPI), click "Record" button
  8. UI assertion: dialog closes; payment-timeline reflects the new row
  9. DB assertion: SELECT from invoice_payments WHERE invoice_id = invoiceId
     → exactly 1 row exists, amount=0.01, method='UPI'

afterAll (ALWAYS runs, even on mid-test failure — Playwright guarantee):
  10. DELETE FROM invoice_payments WHERE invoice_id = invoiceId
  11. DELETE FROM invoices WHERE id = invoiceId
  (customer + shipment retained — idempotent across runs)
```

**Why this shape:**
- Self-contained — the test doesn't depend on whatever invoices happen to live in the DB; no pre-existing data assumption
- Repeatable — N concurrent runs of the test against the same DB produce N independent invoice fixtures, no collision
- Teardown reliable — `afterAll` runs in Playwright regardless of test pass/fail; explicit DELETEs not cascade-dependent
- No DB schema change — uses existing tables only
- Customer/shipment retained idempotently — first run creates them, subsequent runs UPSERT and reuse; cleaner DB hygiene without losing run-cost
- Tiny amount (₹0.01) — won't materially affect any reporting if the teardown is somehow skipped (residual cleanup discipline)

## D. The journey + assertions

### Steps

```
1. Navigate to /ops-console/finance/{testInvoiceId}
   (auth state already loaded → server-side role-gate passes)
2. Wait for the page heading "Invoice <number>" to be visible (auto-wait)
3. Click button with name /record payment/i
4. Wait for the dialog title "Record payment" to be visible (auto-wait)
5. The Amount input has the balance value pre-filled — clear + fill with "0.01"
6. Method stays at default (UPI) — no interaction
7. Click button with name /^record/i (matches "Record ₹0.01")
8. Wait for the dialog to close (auto-wait via expect not-visible)
9. Wait for the payment-timeline to show the new row (auto-wait via expect text "₹0.01")
```

### Assertions

| # | Assertion | Why it matters |
|---|---|---|
| **A1 — UI success** | Dialog closes after submit | Confirms the form action's promise resolved without throwing |
| **A2 — UI reflection** | Payment-timeline row appears with the new amount | Confirms the post-submit refetch / cache invalidation fired |
| **A3 — DB write (money-flow critical)** | Service-role SELECT from `invoice_payments` returns exactly 1 row for the test `invoice_id` with `amount = 0.01` AND `method = 'UPI'` | THIS is the money-flow guarantee — UI-only would pass even if the row never landed |
| **A4 — Invoice linkage** | The selected payment row's `invoice_id` exactly matches the test fixture's invoice id | Confirms the FK linkage is correct — a payment landing against the WRONG invoice is the worst-shape data bug |

A1+A2 are UI assertions; A3+A4 are the money-flow guarantees. A money-flow E2E test that asserts UI-only is insufficient.

### Selector strategy

All role/label-based, no CSS:

| UI element | Selector |
|---|---|
| Record Payment trigger button | `page.getByRole("button", { name: /record payment/i })` |
| Dialog title | `page.getByRole("heading", { name: /record payment/i })` |
| Amount input | `page.getByLabel(/amount/i)` (the Label htmlFor="payment-amount" is the binding) |
| Submit button | `page.getByRole("button", { name: /^record ₹/i })` (matches `Record ₹0.01` — `^` anchors to NOT match the trigger button "Record Payment") |
| Payment-timeline row | `page.getByText("₹0.01").first()` (acceptable per V1; future: a `data-testid="payment-row"` on PaymentTimeline rows could harden this; filed as POST-LAUNCH note in the spec) |

## E. Flakiness + CI

### Risks identified + mitigations

| Risk | Mitigation |
|---|---|
| Async race: form submit → dialog close → timeline refetch happens via `useQueryClient.invalidateQueries` | Use Playwright's `expect(...).toBeVisible()` / `toBeHidden()` auto-waiting (default 5s timeout) — no `page.waitForTimeout` ever |
| Auth state stale across runs | The `_auth.setup.ts` regenerates the storage state on every full run (auth-setup is a dependency project) — stale state self-heals |
| DB seed collision if two test runs target the same DB concurrently | Each test run generates a fresh `uuid` for the invoice in `beforeAll` — N parallel runs produce N non-colliding fixtures (collision risk = ~0 with v4 uuid) |
| Form validation rejects amount=0.01 because of decimal precision | The amount input has `step="0.01" min="0" max={balance}` — 0.01 is valid given fixture balance=100 |
| Combobox interaction breaks (not used — default UPI accepted) | We do NOT interact with the Combobox — default value works. If a future iteration changes the default away from UPI, the test breaks loudly with a clear "method mismatch" assertion — explicit value-contract assertion (catalog #1) |
| DB teardown fails because RLS denies the DELETE via the service-role key | Service-role bypasses RLS by definition; teardown uses service-role client; verified |
| CI test pollution between PRs | Each PR's run produces its own fresh test invoice id; cleanup teardown removes it; the persistent customer/shipment rows are idempotent across all PRs |
| Mid-test failure leaves payment row uncleaned | `afterAll` runs regardless — Playwright's `test.afterAll(async () => { … })` guarantees teardown even on test failure |
| `record_invoice_payment` RPC vs racy fallback path divergence | The test exercises whichever path is live in the deployed schema — exactly the money-flow surface the operator hits in production. Per payment.service.ts the canonical RPC is the intended path; fallback is a temporary issue-#9 cover. The E2E test asserts the OUTCOME (row landed), independent of which path produced it. |
| Test runs even when env vars missing → cascading failure noise | `test.skip(!hasAuthSession(), "needs E2E_USER_EMAIL/PASSWORD")` — pattern from print.spec.ts |

### CI

- Workflow: `.github/workflows/e2e.yml` runs `playwright test` (no filter) on every PR touching `apps/dashboard/**` or `packages/{ui,services,types}/**`. **This PR touches `apps/dashboard/**` — workflow runs automatically.**
- Required env vars for the test (all already in workflow secrets): `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`
- Browser provisioning: chromium-only, `--with-deps`, via `pnpm --filter dashboard exec playwright install --with-deps chromium` — already in the workflow
- workers=1 (config-pinned) — no race within the run

### Scope estimate

One coherent PR. The infrastructure (auth fixture, storage state, CI workflow, service-role env var) ALL exists. The work is: ONE new spec file + ONE small helper module + governance updates. **Bailout DOES NOT fire** — no split needed.

If, during writing, the helper module grows beyond ~150 LoC OR a second spec naturally falls out for robustness/edge cases, that would trigger the bailout split (happy path now, hardening next). Pre-committing: PR 1 = happy path + DB assertion; PR 2 = edge cases (insufficient amount, invalid method, mid-submit failure) — POST-LAUNCH per OD-2's payment-only-sufficient lean.

---

## Verdict

Ship as planned, one PR. Heightened-self-review posture for the diff. PHASE-0 (A–E) provides the full implementation roadmap. ~+250 LoC test + helper, ~+50 LoC governance updates. SB-4 closed; only owner-runnable SB-2 stands between TAC Express and launch.
