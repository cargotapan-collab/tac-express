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

/**
 * Per-request timeout for every PostgREST call. Bounds the worst-case
 * stall (DNS / TLS / cold PostgREST) so a hung fetch can't burn the
 * entire Playwright timeout AND can't prevent `afterAll` teardown from
 * running (a leaked test invoice would persist across CI runs).
 *
 * Mirrors the established `AbortSignal.timeout(15_000)` pattern in
 * `packages/services/src/whatsapp.service.ts` — 10s here is tighter
 * because PostgREST round-trips are typically <500ms; anything past 10s
 * is a real outage, not normal latency.
 */
const POSTGREST_TIMEOUT_MS = 10_000

function postgrestFetch(input: string, init: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(POSTGREST_TIMEOUT_MS),
  })
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
 * Thrown by `seedTestInvoice` when the PostgREST INSERT throws or returns
 * non-OK AFTER the row may have committed (timeout post-commit, network
 * reset post-commit). The caller MUST attempt best-effort cleanup with
 * the surfaced `seededId` — even though the helper threw, the row may
 * exist on the server and would otherwise leak.
 *
 * Catalog #1 — value contract: a generic `Error` would lose the id; the
 * typed shape surfaces the id at the failure boundary.
 */
export class SeedTestInvoiceError extends Error {
  readonly seededId: string
  readonly seededInvoiceNumber: string

  constructor(message: string, seeded: { id: string; invoiceNumber: string }) {
    super(message)
    this.name = "SeedTestInvoiceError"
    this.seededId = seeded.id
    this.seededInvoiceNumber = seeded.invoiceNumber
  }
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

  // EVERY failure path below surfaces the generated id+invoiceNumber via
  // SeedTestInvoiceError so the caller can attempt best-effort cleanup —
  // PostgREST may have committed the row before the throw fired
  // (timeout-post-commit, network-reset-post-commit) and a plain Error
  // would leak the row across CI runs.
  let res: Response
  try {
    res = await postgrestFetch(`${SUPABASE_URL}/rest/v1/invoices`, {
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
  } catch (err) {
    throw new SeedTestInvoiceError(
      `seedTestInvoice fetch threw: ${err instanceof Error ? err.message : String(err)}`,
      { id, invoiceNumber },
    )
  }

  if (!res.ok) {
    // Surface code + status WITHOUT echoing the response body (Supabase
    // PostgREST error responses can include column values that violated
    // a constraint — keep PII / data shapes out of test logs).
    throw new SeedTestInvoiceError(
      `seedTestInvoice failed: HTTP ${res.status} ${res.statusText}`,
      { id, invoiceNumber },
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
  //
  // BEST-EFFORT: the count is observability, NOT cleanup. A transient
  // count failure must NOT block the DELETE — that would leak the
  // seeded invoice into the test DB across CI runs. Capture the count
  // error, always attempt the DELETE, surface the count failure (if any)
  // ONLY if the DELETE itself succeeded.
  let paymentsCount = 0
  let countError: Error | null = null
  try {
    const countRes = await postgrestFetch(
      `${SUPABASE_URL}/rest/v1/invoice_payments?invoice_id=eq.${encodeURIComponent(invoiceId)}&select=id`,
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
    paymentsCount = parseContentRangeTotal(
      countRes.headers.get("content-range"),
    )
  } catch (err) {
    countError = err instanceof Error ? err : new Error(String(err))
  }

  // The DELETE is the LOAD-BEARING cleanup. It always runs.
  const deleteRes = await postgrestFetch(
    `${SUPABASE_URL}/rest/v1/invoices?id=eq.${encodeURIComponent(invoiceId)}`,
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

  // DELETE succeeded — but if the upstream count failed, surface that
  // now (preserves observability without blocking the cleanup that ran).
  if (countError) {
    throw new Error(
      `teardownTestInvoice deleted ${invoiceCount} invoice row(s) but the ` +
        `pre-delete payments-count probe failed: ${countError.message}`,
      { cause: countError },
    )
  }

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
    `?invoice_id=eq.${encodeURIComponent(invoiceId)}` +
    `&select=id,invoice_id,amount,method,received_at` +
    `&order=created_at.asc`
  const res = await postgrestFetch(url, {
    method: "GET",
    headers: postgrestHeaders(),
  })
  if (!res.ok) {
    throw new Error(
      `findPaymentsForTestInvoice failed: HTTP ${res.status}`,
    )
  }
  const rows = (await res.json()) as Array<Record<string, unknown>>
  // Fail-fast guard — `amount` is numeric NOT NULL on the schema, so a
  // null/undefined here would indicate either a schema drift OR a wrong
  // SELECT projection. `Number(undefined)` produces NaN which would
  // silently propagate to the spec's amount assertion as a confusing
  // failure. Clearer error message saves debug time.
  for (const r of rows) {
    if (r.amount === null || r.amount === undefined) {
      throw new Error(
        `findPaymentsForTestInvoice: row ${String(r.id ?? "<no-id>")} ` +
          `has null/undefined amount — schema drift or wrong projection?`,
      )
    }
  }
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
