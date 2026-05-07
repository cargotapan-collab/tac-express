import type { Metadata } from "next"
import { cookies } from "next/headers"

import { createInvoiceServerService } from "@workspace/services/server"

import { InvoiceDetailClient } from "./invoice-detail-client"

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Title every invoice with its invoice number so browser tabs read
 * "INV-2026-01014 · …" — easy to identify at a glance when several
 * invoice tabs are open.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const cookieStore = await cookies()
  const invoiceService = createInvoiceServerService(cookieStore)
  const invoice = await invoiceService.getInvoiceById(id).catch(() => null)

  if (!invoice) {
    return { title: "Invoice · TAC Express" }
  }
  return {
    title: `${invoice.invoiceNumber} · ${invoice.customerName} · TAC Express`,
    description: `Tax invoice ${invoice.invoiceNumber} for ${invoice.customerName}`,
  }
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params
  return <InvoiceDetailClient invoiceId={id} />
}
