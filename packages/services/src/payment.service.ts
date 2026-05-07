import type { SupabaseClient } from "@workspace/database/supabase.types"

export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "CARD"
  | "NEFT_RTGS"
  | "WALLET"
  | "OTHER"

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: PaymentMethod
  reference?: string
  notes?: string
  receivedAt: string
  recordedBy?: string
  attachmentPath?: string
}

export interface RecordPaymentInput {
  invoiceId: string
  amount: number
  method: PaymentMethod
  reference?: string
  notes?: string
  receivedAt?: string
  attachmentPath?: string
}

function mapPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    invoiceId: row.invoice_id as string,
    amount: Number(row.amount ?? 0),
    method: (row.method as PaymentMethod) ?? "OTHER",
    reference: row.reference as string | undefined,
    notes: row.notes as string | undefined,
    receivedAt: row.received_at as string,
    recordedBy: row.recorded_by as string | undefined,
    attachmentPath: row.attachment_path as string | undefined,
  }
}

/**
 * Time-bounded cache: once we confirm the deployment is missing the
 * `invoice_payments` table, every subsequent call within the TTL window
 * short-circuits without hitting the network. This kills the noisy 404
 * spam in the browser console while still letting the cache lapse so a
 * fresh deploy of the migration self-heals without a process restart.
 *
 * We intentionally avoid a permanent module-level boolean — on the Node
 * runtime that pins the flag for the lifetime of the server process and
 * silently disables payment recording for every tenant once any single
 * caller hits a schema-cache miss.
 */
const RELATION_MISSING_TTL_MS = 60_000
let invoicePaymentsRelationMissingUntil = 0

function markRelationMissing(): void {
  invoicePaymentsRelationMissingUntil = Date.now() + RELATION_MISSING_TTL_MS
}

function isRelationMissing(): boolean {
  return Date.now() < invoicePaymentsRelationMissingUntil
}

/**
 * Recognise every error shape Supabase returns when the table or RPC is
 * absent — the regex on `message` alone misses PostgREST's schema-cache
 * miss text (`"Could not find the table 'public.invoice_payments'…"`).
 */
function isMissingInvoicePaymentsRelation(err: {
  code?: string
  message?: string
} | null | undefined): boolean {
  if (!err) return false
  if (err.code === "PGRST205" || err.code === "PGRST204" || err.code === "42P01") {
    return true
  }
  const msg = err.message ?? ""
  return /does not exist|schema cache|could not find the (?:table|relation)|relation .* does not exist/i.test(
    msg,
  )
}

/**
 * Payment service — CRUD for invoice payments. Backed by the `invoice_payments`
 * table which is added in migration 20260501000002 (Phase 4 plan).
 *
 * IMPORTANT: This service tries the `record_invoice_payment` RPC first because
 * it atomically updates the invoice's `advance_paid` + `balance` + status in
 * one transaction. When the RPC isn't deployed yet, falls back to a two-step
 * insert + update path.
 */
export function createPaymentService(db: SupabaseClient) {
  return {
    async listForInvoice(invoiceId: string): Promise<Payment[]> {
      // Short-circuit once we've already learned the table is missing —
      // avoids issuing repeated 404s for every invoice that loads.
      if (isRelationMissing()) return []
      const { data, error } = await db
        .from("invoice_payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("received_at", { ascending: false })
      if (error) {
        if (isMissingInvoicePaymentsRelation(error)) {
          markRelationMissing()
          return []
        }
        throw error
      }
      return (data ?? []).map((row) => mapPayment(row as Record<string, unknown>))
    },

    async recordPayment(input: RecordPaymentInput): Promise<Payment> {
      if (isRelationMissing()) {
        throw new Error(
          "Payment recording is unavailable: the `invoice_payments` table " +
            "has not been deployed yet. Apply migration 20260501000002.",
        )
      }
      const receivedAt = input.receivedAt ?? new Date().toISOString()

      // RPC path: atomic invoice update + payment row.
      const rpc = await db.rpc("record_invoice_payment", {
        p_invoice_id: input.invoiceId,
        p_amount: input.amount,
        p_method: input.method,
        p_reference: input.reference ?? null,
        p_notes: input.notes ?? null,
        p_received_at: receivedAt,
        p_attachment_path: input.attachmentPath ?? null,
      })
      if (!rpc.error && rpc.data) {
        return mapPayment(rpc.data as Record<string, unknown>)
      }

      // ⚠ Fallback: best-effort, NOT atomic. Two concurrent calls for the
      // same invoice will both read the same `advance_paid` and both write
      // `oldAdvance + ownAmount`, swallowing one of the increments. Apply
      // migration `20260501000002_add_record_invoice_payment_rpc.sql` so the
      // RPC path above is taken — it locks the invoice row inside a single
      // transaction. We keep this fallback only so the dashboard stays
      // functional during the brief deploy window where the table exists
      // but the RPC has not been refreshed in PostgREST's schema cache yet.
      const { data: insRow, error: insErr } = await db
        .from("invoice_payments")
        .insert({
          invoice_id: input.invoiceId,
          amount: input.amount,
          method: input.method,
          reference: input.reference ?? null,
          notes: input.notes ?? null,
          received_at: receivedAt,
          attachment_path: input.attachmentPath ?? null,
        })
        .select("*")
        .single()
      if (insErr) {
        if (isMissingInvoicePaymentsRelation(insErr)) {
          markRelationMissing()
        }
        throw insErr
      }

      // Read the invoice to refresh advance + balance + status locally.
      const { data: invRow, error: invErr } = await db
        .from("invoices")
        .select("advance_paid, total_amount")
        .eq("id", input.invoiceId)
        .single()
      if (invErr) throw invErr
      const newAdvance = Number(invRow.advance_paid ?? 0) + input.amount
      const total = Number(invRow.total_amount ?? 0)
      const newBalance = Math.max(total - newAdvance, 0)
      const status = newBalance === 0 ? "PAID" : "ISSUED"
      await db
        .from("invoices")
        .update({
          advance_paid: newAdvance,
          balance: newBalance,
          status,
          paid_at: status === "PAID" ? receivedAt : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.invoiceId)
      return mapPayment(insRow as Record<string, unknown>)
    },

    async deletePayment(id: string): Promise<void> {
      if (isRelationMissing()) return
      const { error } = await db
        .from("invoice_payments")
        .delete()
        .eq("id", id)
      if (error) {
        if (isMissingInvoicePaymentsRelation(error)) {
          markRelationMissing()
          return
        }
        throw error
      }
    },
  }
}

export type PaymentService = ReturnType<typeof createPaymentService>
