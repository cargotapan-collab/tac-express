import type { SupabaseClient } from "@workspace/database/supabase.types"
import type { TablesInsert } from "@workspace/database/database.types"
import type { Invoice, InvoiceFilters } from "@workspace/types"
import { InvoiceStatus } from "@workspace/types"

/** Canonical insert shape for `invoices` rows, derived from generated DB types. */
export type CreateInvoiceDbInput = TablesInsert<"invoices">

export function createInvoiceService(db: SupabaseClient) {
  return {
    async getInvoices(filters: InvoiceFilters = {}): Promise<Invoice[]> {
      let query = db
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(filters.pageSize ?? 50)

      if (filters.status?.length) query = query.in("status", filters.status)
      if (filters.search) {
        query = query.or(`invoice_number.ilike.%${filters.search}%,awb_number.ilike.%${filters.search}%`)
      }
      if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom)
      if (filters.dateTo) query = query.lte("created_at", filters.dateTo)

      const { data, error } = await query
      if (error) throw error
      return (data ?? []).map(mapInvoice)
    },

    async getInvoiceById(id: string): Promise<Invoice | null> {
      const { data, error } = await db
        .from("invoices")
        .select("*")
        .eq("id", id)
        .single()
      if (error) throw error
      return data ? mapInvoice(data) : null
    },

    async createInvoice(input: CreateInvoiceDbInput): Promise<Invoice> {
      const payload: CreateInvoiceDbInput = {
        ...input,
        status: InvoiceStatus.DRAFT,
        awb_number: input.awb_number?.trim() || null,
        customer_id: input.customer_id || null,
      }
      const { data, error } = await db
        .from("invoices")
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return mapInvoice(data)
    },

    async issueInvoice(id: string): Promise<void> {
      const { error } = await db
        .from("invoices")
        .update({ status: InvoiceStatus.ISSUED, issued_at: new Date().toISOString() })
        .eq("id", id)
        .eq("status", InvoiceStatus.DRAFT)
      if (error) throw error
    },

    async markPaid(id: string, paidAt?: string): Promise<void> {
      const { error } = await db
        .from("invoices")
        .update({ status: InvoiceStatus.PAID, paid_at: paidAt ?? new Date().toISOString() })
        .eq("id", id)
        .eq("status", InvoiceStatus.ISSUED)
      if (error) throw error
    },

    async cancelInvoice(id: string): Promise<void> {
      const { error } = await db
        .from("invoices")
        .update({ status: InvoiceStatus.CANCELLED })
        .eq("id", id)
        .in("status", [InvoiceStatus.DRAFT, InvoiceStatus.ISSUED])
      if (error) throw error
    },

    async getOverdueCount(): Promise<number> {
      const { count, error } = await db
        .from("invoices")
        .select("*", { count: "exact", head: true })
        .eq("status", InvoiceStatus.OVERDUE)
      if (error) throw error
      return count ?? 0
    },
  }
}

function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    awbNumber: row.awb_number,
    shipmentId: row.shipment_id,
    customerId: row.customer_id,
    customerName: row.customer_name ?? "",
    customerGstin: row.customer_gstin,
    status: row.status,
    paymentMode: row.payment_mode,
    baseFreight: (row.base_freight as number) ?? 0,
    docketCharge: (row.docket_charge as number) ?? 0,
    pickupCharge: (row.pickup_charge as number) ?? 0,
    packingCharge: (row.packing_charge as number) ?? 0,
    fuelSurcharge: (row.fuel_surcharge as number) ?? 0,
    handlingFee: (row.handling_fee as number) ?? 0,
    insurance: (row.insurance as number) ?? 0,
    discount: (row.discount as number) ?? 0,
    tax: row.tax ?? { cgst: 0, sgst: 0, igst: 0, total: 0 },
    totalAmount: (row.total_amount as number) ?? 0,
    advancePaid: (row.advance_paid as number) ?? 0,
    balance: (row.balance as number) ?? 0,
    pdfPath: row.pdf_path as string | undefined,
    issuedAt: row.issued_at as string | undefined,
    paidAt: row.paid_at as string | undefined,
    dueDate: row.due_date as string | undefined,
    notes: row.notes as string | undefined,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as unknown as Invoice
}

