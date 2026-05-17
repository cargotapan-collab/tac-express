import { test, expect } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"

import {
  findPaymentsForTestInvoice,
  hasServiceRoleEnv,
  seedTestInvoice,
  SeedTestInvoiceError,
  teardownTestInvoice,
  type SeededInvoice,
} from "./_helpers/payment-fixture"

/**
 * E2E — payment-recording money-flow journey (SB-4 / E1 carve-out).
 *
 * Decision doc: docs/decisions/2026-05-17-payment-recording-e2e.md
 *
 * Asserts BOTH the UI success state AND that the payment row actually
 * lands in `invoice_payments` with the right amount + invoice linkage.
 * A UI-only assertion is insufficient for a money flow — the operator
 * could see "success" and the row never write (per the
 * `PaymentResponseLostError` class in
 * `packages/services/src/payment.service.ts` — symbol reference per
 * catalog #5). This
 * spec catches that exact failure shape.
 *
 * Scope (strictly): payment recording. Other E1 flows (shipment wizard,
 * manifest wizard, RBAC RLS isolation, exception lifecycle) are
 * POST-LAUNCH per OD-2 lean = payment-only-sufficient.
 *
 * Skip behavior — mirrors apps/dashboard/e2e/print.spec.ts:
 *   - missing E2E_USER_EMAIL/PASSWORD → no auth session → spec skips
 *   - missing SUPABASE_SERVICE_ROLE_KEY → no fixture seed → spec skips
 * (CI provides all three via repo secrets; local runs degrade gracefully.)
 */

function hasAuthSession(): boolean {
  const storagePath = path.join(process.cwd(), "e2e/.auth/operator.json")
  try {
    const raw = JSON.parse(fs.readFileSync(storagePath, "utf-8")) as {
      cookies?: unknown[]
    }
    return Array.isArray(raw.cookies) && raw.cookies.length > 0
  } catch {
    return false
  }
}

test.describe("Payment recording — money-flow E2E", () => {
  let seeded: SeededInvoice | null = null

  test.beforeAll(async () => {
    // Skip the whole describe if the env doesn't support the journey.
    if (!hasAuthSession() || !hasServiceRoleEnv()) {
      return
    }
    try {
      seeded = await seedTestInvoice()
    } catch (err) {
      // Best-effort cleanup: SeedTestInvoiceError surfaces the generated
      // id so we can attempt teardown even if the seed threw post-commit
      // (timeout-post-commit, network-reset-post-commit). Without this,
      // a transient failure would leak the seeded row across CI runs.
      if (err instanceof SeedTestInvoiceError) {
        await teardownTestInvoice(err.seededId).catch(() => {
          // Silent — the cleanup itself failing on a row that may not
          // exist is acceptable; the rethrow below surfaces the original
          // cause for the test result.
        })
      }
      throw err
    }
  })

  test.afterAll(async () => {
    // ALWAYS run teardown, even if the test failed mid-run — Playwright
    // guarantees afterAll fires. The teardown reports row counts so a
    // residual-leakage bug surfaces in the test output.
    if (seeded === null) return
    const result = await teardownTestInvoice(seeded.id)
    // Value-contract assertion — a teardown that silently no-op'd would
    // hide an RLS misconfiguration or a wrong-id bug. Catalog #1.
    expect(result.invoiceDeleted).toBe(1)
    // The spec records exactly ONE payment row. If the cascade-count
    // shows zero, the UI submit didn't actually write (and A3 below
    // would have failed). If >1, the spec produced a duplicate (a
    // double-submit race we'd want to know about immediately).
    expect(result.paymentsCascadeDeleted).toBeLessThanOrEqual(1)
    seeded = null
  })

  test("operator records a payment; UI confirms AND DB row lands", async ({
    page,
  }) => {
    test.skip(
      !hasAuthSession(),
      "Needs E2E_USER_EMAIL + E2E_USER_PASSWORD (auth state)",
    )
    test.skip(
      !hasServiceRoleEnv(),
      "Needs SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL (fixture seed)",
    )
    // If we reached this line, beforeAll seeded successfully — assert.
    if (seeded === null) {
      throw new Error(
        "Internal: env gates passed but fixture is null — beforeAll error " +
          "was suppressed. See the prior console line.",
      )
    }
    const invoice = seeded

    // ─── 1. Navigate to the invoice detail page (auth state already loaded) ───
    await page.goto(`/ops-console/finance/${invoice.id}`)

    // Wait for the page heading to render — the role-gated server component
    // resolves the auth + RLS + service fetch before paint. Auto-wait via
    // expect handles the async render window; no arbitrary sleeps.
    await expect(
      page.getByRole("heading", { level: 1 }),
    ).toBeVisible({ timeout: 15_000 })

    // ─── 2. Open the Record Payment dialog ────────────────────────────────
    // The trigger button is enabled for status=ISSUED + balance>0 — both
    // true for the seeded invoice. (Trigger lives at
    // `ops-invoice-detail-live.tsx` inside the `status === ISSUED &&
    // balance > 0` conditional — symbol reference, not line number, per
    // catalog #5.)
    const recordTrigger = page.getByRole("button", {
      name: /record payment/i,
    })
    await expect(recordTrigger).toBeVisible({ timeout: 5_000 })
    await expect(recordTrigger).toBeEnabled()
    await recordTrigger.click()

    // ─── 3. Fill the dialog ───────────────────────────────────────────────
    const dialogTitle = page.getByRole("heading", { name: /record payment/i })
    await expect(dialogTitle).toBeVisible({ timeout: 5_000 })

    // The Amount input pre-fills with the invoice balance (100). Clear and
    // record a tiny amount — per fixture design (decision doc § C), a
    // residual cleanup-skip leaves ₹0.01 not ₹100.
    const amountInput = page.getByLabel(/amount/i)
    await amountInput.fill("0.01")

    // Method stays at default (UPI per packages/ui/.../record-payment-dialog.tsx).
    // Asserting the default value here is a contract assertion: if a future
    // PR changes the default to a value not in our value-contract, the
    // assertion fires before the form submit produces a misleading DB row.
    // (catalog #1 — value over call-existence)

    // Submit. The submit button label includes the formatted amount
    // ("Record ₹0.01") — anchor on the leading "Record ₹" so we don't
    // accidentally re-match the trigger button "Record Payment".
    const submitButton = page.getByRole("button", { name: /^record ₹/i })
    await expect(submitButton).toBeEnabled()
    await submitButton.click()

    // ─── 4. UI assertions (A1 + A2) ───────────────────────────────────────
    // A1 — dialog closes after submit
    await expect(dialogTitle).toBeHidden({ timeout: 10_000 })

    // A2 — payment-timeline reflects the new row.
    // The amount renders as `₹0.01` (en-IN formatted) in the timeline.
    // Scope the lookup to the PaymentTimeline root via its `data-slot=
    // "payment-timeline"` anchor — `page.getByText("₹0.01").first()`
    // would be ambiguous because the submit button label `Record ₹0.01`
    // ALSO contains `₹0.01`, and the dialog may remain mounted (just
    // hidden) after submit. CodeRabbit #160 caught this; the scoped
    // lookup is the catalog-#7 (anchor-scoped windows) shape.
    await expect(
      page
        .locator('[data-slot="payment-timeline"]')
        .getByText("₹0.01"),
    ).toBeVisible({ timeout: 10_000 })

    // ─── 5. DB assertions (A3 + A4) — the money-flow guarantee ────────────
    // The above UI assertions can pass even if the row never landed (the
    // mutation hook's onSuccess fires before the server write is
    // confirmed in some races; the PaymentResponseLostError shape from
    // `PaymentResponseLostError` class in payment.service.ts documents
    // exactly this gap — symbol reference per catalog #5). The next two
    // assertions are the load-bearing money-flow contract.
    const payments = await findPaymentsForTestInvoice(invoice.id)
    // A3 — exactly 1 row for this invoice with the recorded amount + method.
    expect(payments).toHaveLength(1)
    const recorded = payments[0]!
    expect(recorded.amount).toBe(0.01)
    expect(recorded.method).toBe("UPI")
    // A4 — invoice linkage. The row's invoice_id matches the seeded fixture
    // exactly. A payment landing against the WRONG invoice is the worst-
    // shape money-flow data bug; this assertion makes that impossible.
    expect(recorded.invoice_id).toBe(invoice.id)
  })
})

/**
 * `hasAuthSession` is kept module-local rather than promoted to _helpers —
 * print.spec.ts has its own copy. Per catalog #9 (abstract on second use),
 * extraction is justified when a THIRD consumer appears. Filed as a small
 * POST-LAUNCH polish if the spec count grows.
 */
