import { randomUUID } from "node:crypto"

/**
 * Service-role test fixture for the payment-recording E2E spec (SB-4 / E1).
 *
 * WHY raw fetch (not a JS client):
 * The dashboard does NOT depend on the Supabase JS SDK directly (it uses
 * @workspace/database's `@supabase/ssr` cookie-based clients). Adding
 * that SDK just for this E2E fixture would introduce a new direct dep —
 * explicitly forbidden by the SB-4 brief. Supabase's PostgREST API is
 * fully usable via Node 22's built-in `fetch`; the three primitives
 * this fixture needs (INSERT, SELECT-by-eq, DELETE-by-eq) are bounded
 * enough that a JS client is overkill. CI runs on Node 22 per the e2e
 * workflow.
 *
 * WHY service-role auth:
 * The spec creates an `invoices` row + asserts an `invoice_payments` row
 * lands correctly. Both writes need to bypass cookie-bound RLS that the
 * dashboard's user-session enforces. Service-role bypasses RLS by
 * definition; it's the right scope for *test infrastructure* (the spec's
 * UI journey separately exercises the real MANAGER+ session via the
 * existing auth state).
 *
 * WHY all FKs nullable on the seeded invoice:
 * Per supabase/migrations/20260515000001_baseline_from_production.sql §
 * `invoices` table — `customer_id`, `shipment_id`, `awb_number` are all
 * `ON DELETE SET NULL`. Leaving them NULL on the test invoice keeps the
 * fixture self-contained (no upstream customer/shipment seed needed) and
 * the teardown a single `DELETE FROM invoices` (cascades to
 * `invoice_payments` via that table's `ON DELETE CASCADE`).
 *
 * Idempotency: each test RUN generates a fresh UUID for the invoice;
 * the test run's `afterAll` deletes it. Parallel CI runs don't collide
 * (uuid v4 entropy). Customer/shipment rows are never created or touched.
 *
 * Catalog #1 preempt — VALUE contracts:
 *   The fixture functions RETURN the seeded id (caller asserts against it),
 *   not just "succeeded." The teardown reports the deleted-row count so
 *   the spec can assert exactly-1-row-deleted (no leakage).
 */

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""

export function hasServiceRoleEnv(): boolean {
  return Boolean(SERVICE_ROLE_KEY) && Boolean(SUPABASE_URL)
}

/**
 * Build common headers for every PostgREST request. Service-role JWT in
 * BOTH the Authorization header (RLS bypass) AND the apikey header
 * (Supabase's PostgREST requires both — anon key alone returns 401).
 */
function postgrestHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    ...(extra ?? {}),
  }
}

function assertEnv(): void {
  if (!hasServiceRoleEnv()) {
    throw new Error(
      "payment-fixture: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL " +
        "must both be set. (CI provides both via secrets; locally, source " +
        "apps/dashboard/.env.local.)",
    )
  }
}

export interface SeededInvoice {
  id: string
  invoiceNumber: string
  totalAmount: number
  balance: number
}

/**
 * Create a fresh test invoice in `public.invoices` with status='ISSUED'
 * and balance>0 (the precondition for the "Record Payment" button to
 * appear at ops-invoice-detail-live.tsx:651-661). Returns the seeded ids.
 *
 * The invoice has all optional FKs set to NULL (no upstream customer /
 * shipment seed required); see file header. The `invoice_number` includes
 * a timestamp-based suffix to avoid colliding with any production data.
 */
export async function seedTestInvoice(): Promise<SeededInvoice> {
  assertEnv()
  const id = randomUUID()
  const invoiceNumber = `E2E-PAY-${Date.now()}-${id.slice(0, 8)}`
  const totalAmount = 100
  const balance = 100

  const res = await fetch(`${SUPABASE_URL}/rest/v1/invoices`, {
    method: "POST",
    headers: postgrestHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify({
      id,
      invoice_number: invoiceNumber,
      status: "ISSUED",
      customer_name: "E2E Payment-Recording Test (auto-deleted)",
      payment_mode: "TO_PAY",
      base_freight: totalAmount,
      total_amount: totalAmount,
      balance,
      advance_paid: 0,
      issued_at: new Date().toISOString(),
      customer_id: null,
      shipment_id: null,
      awb_number: null,
    }),
  })

  if (!res.ok) {
    // Surface code + status WITHOUT echoing the response body (Supabase
    // PostgREST error responses can include column values that violated
    // a constraint — keep PII / data shapes out of test logs).
    throw new Error(
      `seedTestInvoice failed: HTTP ${res.status} ${res.statusText}`,
    )
  }

  return { id, invoiceNumber, totalAmount, balance }
}

export interface FixtureTeardownResult {
  invoiceDeleted: number
  paymentsCascadeDeleted: number
}

/**
 * Tear down the seeded test invoice. The `invoice_payments` rows for this
 * invoice cascade-delete automatically via the FK's `ON DELETE CASCADE`
 * (verified at migration baseline §`invoice_payments`).
 *
 * Returns the row counts so the caller can assert exactly-1-invoice-
 * deleted + the expected payments-cascade-deleted count. This is the
 * catalog #1 "value contract over call existence" pattern — a teardown
 * that returns `void` would not surface a leakage bug.
 *
 * Safe to call multiple times — a missing invoice is a no-op (zero rows
 * deleted, no error).
 */
export async function teardownTestInvoice(
  invoiceId: string,
): Promise<FixtureTeardownResult> {
  assertEnv()

  // Count cascade-deleted payments BEFORE the DELETE — once cascade fires,
  // counting after is impossible (rows are gone). PostgREST's exact-count
  // is opt-in via the Prefer header; HEAD-method skips returning rows.
  const countRes = await fetch(
    `${SUPABASE_URL}/rest/v1/invoice_payments?invoice_id=eq.${invoiceId}&select=id`,
    {
      method: "HEAD",
      headers: postgrestHeaders({ Prefer: "count=exact" }),
    },
  )
  if (!countRes.ok) {
    throw new Error(
      `teardownTestInvoice (count) failed: HTTP ${countRes.status}`,
    )
  }
  const paymentsCount = parseContentRangeTotal(
    countRes.headers.get("content-range"),
  )

  const deleteRes = await fetch(
    `${SUPABASE_URL}/rest/v1/invoices?id=eq.${invoiceId}`,
    {
      method: "DELETE",
      headers: postgrestHeaders({ Prefer: "count=exact,return=minimal" }),
    },
  )
  if (!deleteRes.ok) {
    throw new Error(
      `teardownTestInvoice (delete) failed: HTTP ${deleteRes.status}`,
    )
  }
  const invoiceCount = parseContentRangeTotal(
    deleteRes.headers.get("content-range"),
  )

  return {
    invoiceDeleted: invoiceCount,
    paymentsCascadeDeleted: paymentsCount,
  }
}

export interface PaymentRow {
  id: string
  invoice_id: string
  amount: number
  method: string
  received_at: string
}

/**
 * Service-role SELECT of all payment rows linked to the seeded test
 * invoice. The money-flow A3+A4 assertions in the spec read against this.
 */
export async function findPaymentsForTestInvoice(
  invoiceId: string,
): Promise<PaymentRow[]> {
  assertEnv()
  const url =
    `${SUPABASE_URL}/rest/v1/invoice_payments` +
    `?invoice_id=eq.${invoiceId}` +
    `&select=id,invoice_id,amount,method,received_at` +
    `&order=created_at.asc`
  const res = await fetch(url, {
    method: "GET",
    headers: postgrestHeaders(),
  })
  if (!res.ok) {
    throw new Error(
      `findPaymentsForTestInvoice failed: HTTP ${res.status}`,
    )
  }
  const rows = (await res.json()) as Array<Record<string, unknown>>
  return rows.map((row): PaymentRow => ({
    id: row.id as string,
    invoice_id: row.invoice_id as string,
    amount: Number(row.amount),
    method: row.method as string,
    received_at: row.received_at as string,
  }))
}

/**
 * Parse the total-rows count out of a PostgREST `Content-Range` header.
 * Format examples:
 *   "0-9/42"  → 42 total
 *   "*\/0"    → 0 total (no rows matched)
 *   "0-0/*"   → unknown total (count header was not requested correctly)
 * Returns 0 on null / malformed input — the caller's assertions surface
 * any unexpected zero.
 */
function parseContentRangeTotal(header: string | null): number {
  if (!header) return 0
  const slashIdx = header.lastIndexOf("/")
  if (slashIdx < 0) return 0
  const totalPart = header.slice(slashIdx + 1)
  if (totalPart === "*") return 0
  const total = Number.parseInt(totalPart, 10)
  return Number.isNaN(total) ? 0 : total
}
