import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { PaymentMethod } from "../payment.service"
import { registerSentry } from "../shared/sentry-tagger"
import { SUPABASE_RPC_TAG_KEYS } from "../shared/with-rpc"
import { makeDb } from "./helpers/make-db"

/**
 * Test floor for payment.service.ts — ticks the #102 Sprint 1 Testing
 * sub-items:
 *   - Unit tests for packages/services/src/payment.service.ts
 *     (financial; 0 tests today)
 *   - Unit tests for record_invoice_payment RPC (would have caught the
 *     OPERATOR bug from #97)
 *
 * Scope (JS-side only, no real Postgres):
 *   - listForInvoice: success, no-data, error, relation-missing TTL cache
 *   - recordPayment: full RPC-or-fallback decision tree
 *     - RPC success with data → mapped Payment
 *     - RPC success with null data → PaymentResponseLostError
 *     - RPC real error (e.g. 23505 unique violation) → emit + throw
 *     - RPC missing (PGRST202/42883) → fallback INSERT path
 *     - Fallback INSERT success → invoice balance recalculated
 *     - Fallback INSERT error → throws
 *   - deletePayment: success, error, relation-missing TTL cache
 *   - PaymentResponseLostError: shape contract (code, fields)
 *   - All 8 PaymentMethod enum values pass through to the RPC arg
 *     (would have caught a JS-side validation that excluded a method —
 *     same shape as the OPERATOR-role bug, but applied to payment
 *     methods, which is the surface this layer can actually validate).
 *
 * Out of scope:
 *   - RPC SQL semantics (lock acquisition, balance recalc inside
 *     SECURITY DEFINER) — those need integration tests against real
 *     Postgres, tracked separately.
 *   - The fallback path's race-condition behavior — documented in
 *     payment.service.ts:240 as "racy by design, fixed by #9"; an
 *     integration test would be needed to verify the race occurs and
 *     to verify #9's RPC closes it.
 *
 * Module-level state isolation:
 *   payment.service.ts caches a relation-missing TTL at module scope.
 *   Tests that hit the cache (or want to verify it does NOT hit) need
 *   a fresh module instance. We use vi.resetModules() + dynamic import
 *   in a helper rather than exposing a test-only reset in production code.
 */

const captureExceptionMock = vi.fn()

beforeEach(() => {
  captureExceptionMock.mockClear()
  registerSentry({ captureException: captureExceptionMock })
  vi.resetModules()
})

afterEach(() => {
  registerSentry(null)
})

/**
 * Import payment.service.ts FRESH each call. Resets the module-level
 * TTL cache between tests without exposing a test-only reset in
 * production code.
 */
async function freshPaymentService() {
  vi.resetModules()
  // Re-register Sentry since vi.resetModules() invalidates the
  // sentry-tagger module's singleton state. Each test calls this
  // helper, so registration happens after reset.
  const { registerSentry: register } = await import("../shared/sentry-tagger")
  register({ captureException: captureExceptionMock })
  const mod = await import("../payment.service")
  return mod
}

describe("PaymentResponseLostError shape", () => {
  it("has the bundle-safe discriminator code", async () => {
    const { PaymentResponseLostError } = await freshPaymentService()
    const err = new PaymentResponseLostError({
      invoiceId: "inv-1",
      amount: 100,
      receivedAt: "2026-05-15T00:00:00Z",
    })
    expect(err.code).toBe("PAYMENT_RESPONSE_LOST")
    expect(err.invoiceId).toBe("inv-1")
    expect(err.amount).toBe(100)
    expect(err.receivedAt).toBe("2026-05-15T00:00:00Z")
    expect(err.name).toBe("PaymentResponseLostError")
    expect(err.message).toMatch(/Payment was recorded on the server/)
    expect(err.message).toMatch(/do NOT retry/)
  })

  it("is detectable via instanceof inside the same bundle", async () => {
    const { PaymentResponseLostError } = await freshPaymentService()
    const err = new PaymentResponseLostError({
      invoiceId: "inv-1",
      amount: 100,
      receivedAt: "2026-05-15T00:00:00Z",
    })
    expect(err).toBeInstanceOf(PaymentResponseLostError)
    expect(err).toBeInstanceOf(Error)
  })
})

describe("listForInvoice", () => {
  const SAMPLE_PAYMENT_ROW = {
    id: "pay-1",
    invoice_id: "inv-1",
    amount: 250,
    method: "UPI",
    reference: "UPI-REF-001",
    notes: "Partial",
    received_at: "2026-05-15T12:00:00Z",
    recorded_by: "user-a",
    attachment_path: null,
  }

  it("returns mapped Payment rows on success", async () => {
    const db = makeDb({
      fromResults: {
        invoice_payments: { data: [SAMPLE_PAYMENT_ROW], error: null },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    const payments = await createPaymentService(db).listForInvoice("inv-1")
    expect(payments).toHaveLength(1)
    expect(payments[0]).toMatchObject({
      id: "pay-1",
      invoiceId: "inv-1",
      amount: 250,
      method: "UPI",
      reference: "UPI-REF-001",
    })
  })

  it("returns empty array when db returns null data", async () => {
    const db = makeDb({
      fromResults: { invoice_payments: { data: null, error: null } },
    })
    const { createPaymentService } = await freshPaymentService()
    const payments = await createPaymentService(db).listForInvoice("inv-1")
    expect(payments).toEqual([])
  })

  it("throws on generic db error", async () => {
    const db = makeDb({
      fromResults: {
        invoice_payments: { data: null, error: { code: "57P01", message: "admin shutdown" } },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    await expect(createPaymentService(db).listForInvoice("inv-1")).rejects.toMatchObject({
      code: "57P01",
    })
  })

  it("returns [] AND caches relation-missing when err.code is PGRST205", async () => {
    const db = makeDb({
      fromResults: {
        invoice_payments: {
          data: null,
          error: { code: "PGRST205", message: "Could not find the table" },
        },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    const svc = createPaymentService(db)
    expect(await svc.listForInvoice("inv-1")).toEqual([])
    // Subsequent call short-circuits — db.from is NOT called again.
    expect(await svc.listForInvoice("inv-2")).toEqual([])
    expect(db.from).toHaveBeenCalledTimes(1)
  })

  it("returns [] for the legacy regex shape (PostgREST schema-cache miss)", async () => {
    const db = makeDb({
      fromResults: {
        invoice_payments: {
          data: null,
          error: { message: 'Could not find the relation "invoice_payments"' },
        },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    expect(await createPaymentService(db).listForInvoice("inv-1")).toEqual([])
  })

  it("returns [] for raw Postgres relation-does-not-exist (code 42P01)", async () => {
    const db = makeDb({
      fromResults: {
        invoice_payments: { data: null, error: { code: "42P01", message: "" } },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    expect(await createPaymentService(db).listForInvoice("inv-1")).toEqual([])
  })
})

describe("recordPayment — RPC success branches", () => {
  it("returns mapped Payment when RPC returns data", async () => {
    const db = makeDb({
      rpcResult: {
        data: {
          id: "pay-1",
          invoice_id: "inv-1",
          amount: 500,
          method: "CASH",
          received_at: "2026-05-15T13:00:00Z",
        },
        error: null,
      },
    })
    const { createPaymentService } = await freshPaymentService()
    const result = await createPaymentService(db).recordPayment({
      invoiceId: "inv-1",
      amount: 500,
      method: "CASH",
    })
    expect(result).toMatchObject({
      id: "pay-1",
      invoiceId: "inv-1",
      amount: 500,
      method: "CASH",
    })
    expect(captureExceptionMock).not.toHaveBeenCalled()
  })

  it("throws PaymentResponseLostError when RPC succeeds with null data", async () => {
    const db = makeDb({
      rpcResult: { data: null, error: null },
    })
    const { createPaymentService, PaymentResponseLostError } = await freshPaymentService()
    await expect(
      createPaymentService(db).recordPayment({
        invoiceId: "inv-99",
        amount: 12.34,
        method: "WALLET",
        receivedAt: "2026-05-15T14:00:00Z",
      }),
    ).rejects.toBeInstanceOf(PaymentResponseLostError as new (input: unknown) => Error)
  })

  it("PaymentResponseLostError carries the input identifiers for caller diagnostics", async () => {
    const db = makeDb({ rpcResult: { data: null, error: null } })
    const { createPaymentService } = await freshPaymentService()
    try {
      await createPaymentService(db).recordPayment({
        invoiceId: "inv-99",
        amount: 12.34,
        method: "WALLET",
        receivedAt: "2026-05-15T14:00:00Z",
      })
      throw new Error("should have thrown")
    } catch (err: unknown) {
      const e = err as { code: string; invoiceId: string; amount: number; receivedAt: string }
      expect(e.code).toBe("PAYMENT_RESPONSE_LOST")
      expect(e.invoiceId).toBe("inv-99")
      expect(e.amount).toBe(12.34)
      expect(e.receivedAt).toBe("2026-05-15T14:00:00Z")
    }
  })

  it("default-receivedAt is now-ish ISO when caller omits it", async () => {
    const before = new Date().toISOString()
    const db = makeDb({
      rpcResult: {
        data: {
          id: "pay-1",
          invoice_id: "inv-1",
          amount: 1,
          method: "OTHER",
          received_at: "2026-05-15T15:00:00Z",
        },
        error: null,
      },
    })
    const { createPaymentService } = await freshPaymentService()
    await createPaymentService(db).recordPayment({
      invoiceId: "inv-1",
      amount: 1,
      method: "OTHER",
    })
    // The RPC mock captures the args at call time. The 7th key is
    // p_received_at — verify it was set to an ISO string near "now".
    const rpcCall = (db.rpc as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]!
    const args = rpcCall[1] as { p_received_at: string }
    expect(args.p_received_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(args.p_received_at >= before).toBe(true)
  })
})

describe("recordPayment — RPC error branches", () => {
  it("emits captureSupabaseRpcError + rethrows on real RPC error (e.g. unique violation)", async () => {
    const errObj = { code: "23505", message: "duplicate key value violates unique constraint" }
    const db = makeDb({ rpcResult: { data: null, error: errObj } })
    const { createPaymentService } = await freshPaymentService()

    await expect(
      createPaymentService(db).recordPayment({
        invoiceId: "inv-1",
        amount: 100,
        method: "CASH",
      }),
    ).rejects.toMatchObject({ code: "23505" })

    expect(captureExceptionMock).toHaveBeenCalledTimes(1)
    const [, tags] = captureExceptionMock.mock.calls[0]!
    const tagMap = tags as Record<string, string>
    expect(tagMap[SUPABASE_RPC_TAG_KEYS.rpcName]).toBe("record_invoice_payment")
    expect(tagMap[SUPABASE_RPC_TAG_KEYS.errorCode]).toBe("23505")
  })

  it("emits + rethrows on RLS-denial errors (NOT swallowed by fallback)", async () => {
    // The post-PR-#8 fix: only PGRST202/42883/relation-missing route to
    // the fallback. An RLS denial (42501 or PostgREST permission error)
    // MUST rethrow — silently falling through would bypass the very
    // policy the RPC enforces.
    const errObj = { code: "42501", message: "new row violates row-level security" }
    const db = makeDb({ rpcResult: { data: null, error: errObj } })
    const { createPaymentService } = await freshPaymentService()
    await expect(
      createPaymentService(db).recordPayment({
        invoiceId: "inv-blocked",
        amount: 100,
        method: "CASH",
      }),
    ).rejects.toMatchObject({ code: "42501" })
    // Captured by the RPC-failure tagging surface.
    expect(captureExceptionMock).toHaveBeenCalledTimes(1)
  })

  it("falls back to INSERT + invoice update when RPC is missing (PGRST205)", async () => {
    // The fallback path needs THREE table interactions:
    //   1. insert into invoice_payments
    //   2. select advance_paid, total_amount from invoices
    //   3. update invoices set advance_paid, balance, status, paid_at
    const PAYMENT_ROW = {
      id: "pay-fb-1",
      invoice_id: "inv-1",
      amount: 200,
      method: "BANK_TRANSFER",
      received_at: "2026-05-15T16:00:00Z",
    }
    const INVOICE_ROW = { advance_paid: 100, total_amount: 500 }
    const db = makeDb({
      rpcResult: {
        data: null,
        error: { code: "PGRST205", message: "Could not find the function" },
      },
      fromResults: {
        invoice_payments: { data: PAYMENT_ROW, error: null },
        invoices: { data: INVOICE_ROW, error: null },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    const result = await createPaymentService(db).recordPayment({
      invoiceId: "inv-1",
      amount: 200,
      method: "BANK_TRANSFER",
      receivedAt: "2026-05-15T16:00:00Z",
    })
    expect(result.id).toBe("pay-fb-1")
    expect(result.amount).toBe(200)
    // Sentry NOT emitted for the missing-RPC fallback (audit § 3.2 contract).
    expect(captureExceptionMock).not.toHaveBeenCalled()
    // 3 .from calls in EXACT order: invoice_payments insert, invoices select,
    // invoices update. CodeRabbit caught the weak prior assertion — pinning
    // the call sequence + count catches regressions that skip the invoice
    // update (which would leave advance_paid / balance / status stale on
    // the invoice row even after a successful payment insert).
    expect(db.from).toHaveBeenCalledTimes(3)
    expect(db.from).toHaveBeenNthCalledWith(1, "invoice_payments")
    expect(db.from).toHaveBeenNthCalledWith(2, "invoices")
    expect(db.from).toHaveBeenNthCalledWith(3, "invoices")
  })

  it("throws raw insert error during fallback when INSERT fails", async () => {
    const db = makeDb({
      rpcResult: {
        data: null,
        error: { code: "PGRST205", message: "schema cache miss" },
      },
      fromResults: {
        invoice_payments: { data: null, error: { code: "23505", message: "dup" } },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    await expect(
      createPaymentService(db).recordPayment({
        invoiceId: "inv-1",
        amount: 100,
        method: "CASH",
      }),
    ).rejects.toMatchObject({ code: "23505" })
  })

  it("short-circuits with clear error after relation-missing TTL is set", async () => {
    // First call: relation-missing detected via listForInvoice (cheap setup).
    const dbStep1 = makeDb({
      fromResults: {
        invoice_payments: {
          data: null,
          error: { code: "PGRST205", message: "Could not find" },
        },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    const svc = createPaymentService(dbStep1)
    await svc.listForInvoice("inv-1") // sets the TTL

    // Subsequent recordPayment must throw clearly, NOT attempt the RPC.
    await expect(
      svc.recordPayment({
        invoiceId: "inv-1",
        amount: 100,
        method: "CASH",
      }),
    ).rejects.toThrow(/Payment recording is unavailable/)
    // db.rpc was never called — short-circuit fired.
    expect(dbStep1.rpc).not.toHaveBeenCalled()
  })
})

describe("recordPayment — PaymentMethod enum sentinel", () => {
  // Pinned hardcoded list — the OPERATOR-role bug from #97 happened
  // because a new enum value got added in TypeScript but the SQL CHECK
  // constraint wasn't updated. We can't test the SQL side here, but we
  // CAN pin: every PaymentMethod value the service exports MUST round-
  // trip through recordPayment's RPC arg without transformation.
  //
  // The pedagogical pattern parallels packages/auth/src/rbac.test.ts's
  // UserRole sentinel, but PaymentMethod is a string-union type (no
  // runtime representation, so `Object.values()` doesn't apply). We use
  // the TypeScript-native equivalent: `satisfies readonly PaymentMethod[]`
  // asserts every entry IS a PaymentMethod, and the `_Missing` type below
  // is `never` if-and-only-if ALL_METHODS is exhaustive — so the
  // declaration becomes a type error when a new method is added without
  // an entry here. CodeRabbit caught the prior weaker hardcoded list
  // (suggestion accepted on PR review).
  const ALL_METHODS = [
    "CASH",
    "UPI",
    "BANK_TRANSFER",
    "CHEQUE",
    "CARD",
    "NEFT_RTGS",
    "WALLET",
    "OTHER",
  ] as const satisfies readonly PaymentMethod[]

  // Compile-time exhaustiveness sentinel. If a new method is added to
  // PaymentMethod and NOT to ALL_METHODS above, _Missing becomes the
  // missing union member instead of `never`, and the `true` literal
  // can't be assigned to `never` — TypeScript flags it as an error.
  // The variable is unused at runtime; the type check is the assertion.
  type _Missing = Exclude<PaymentMethod, (typeof ALL_METHODS)[number]>
  const _allPaymentMethodsCovered: _Missing extends never ? true : never = true
  void _allPaymentMethodsCovered // reference to silence the unused-var rule; the type-check IS the assertion

  it.each(ALL_METHODS)("passes %s through to RPC p_method arg unchanged", async (method) => {
    const db = makeDb({
      rpcResult: {
        data: {
          id: "pay-x",
          invoice_id: "inv-x",
          amount: 1,
          method,
          received_at: "2026-05-15T17:00:00Z",
        },
        error: null,
      },
    })
    const { createPaymentService } = await freshPaymentService()
    await createPaymentService(db).recordPayment({
      invoiceId: "inv-x",
      amount: 1,
      method,
    })
    const rpcCall = (db.rpc as unknown as { mock: { calls: unknown[][] } }).mock.calls[0]!
    const args = rpcCall[1] as { p_method: string }
    expect(args.p_method).toBe(method)
  })
})

describe("deletePayment", () => {
  it("calls db.from(invoice_payments).delete().eq on success", async () => {
    const db = makeDb({
      fromResults: { invoice_payments: { data: null, error: null } },
    })
    const { createPaymentService } = await freshPaymentService()
    await expect(
      createPaymentService(db).deletePayment("pay-1"),
    ).resolves.toBeUndefined()
    expect(db.from).toHaveBeenCalledWith("invoice_payments")
  })

  it("throws on generic db error", async () => {
    const db = makeDb({
      fromResults: {
        invoice_payments: { data: null, error: { code: "P0001", message: "trigger blocked delete" } },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    await expect(
      createPaymentService(db).deletePayment("pay-1"),
    ).rejects.toMatchObject({ code: "P0001" })
  })

  it("returns silently when relation-missing TTL is already active", async () => {
    // Set up the TTL by triggering a relation-missing on listForInvoice
    // first, then verify deletePayment short-circuits without calling
    // db.from again.
    const db = makeDb({
      fromResults: {
        invoice_payments: {
          data: null,
          error: { code: "PGRST205", message: "Could not find" },
        },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    const svc = createPaymentService(db)
    await svc.listForInvoice("inv-1") // triggers TTL set
    const callsBefore = vi.mocked(db.from).mock.calls.length
    await expect(svc.deletePayment("pay-1")).resolves.toBeUndefined()
    // No additional .from calls — short-circuit fired.
    expect(vi.mocked(db.from).mock.calls.length).toBe(callsBefore)
  })

  it("marks relation-missing on fresh detection from delete path", async () => {
    const db = makeDb({
      fromResults: {
        invoice_payments: {
          data: null,
          error: { code: "PGRST205", message: "Could not find" },
        },
      },
    })
    const { createPaymentService } = await freshPaymentService()
    const svc = createPaymentService(db)
    // First call detects relation-missing via .delete + returns silently.
    await expect(svc.deletePayment("pay-1")).resolves.toBeUndefined()
    // Second call short-circuits without hitting db.
    await expect(svc.deletePayment("pay-2")).resolves.toBeUndefined()
    expect(db.from).toHaveBeenCalledTimes(1)
  })
})
