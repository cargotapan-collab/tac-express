import type { Metadata } from "next"
import { InvoiceDetailClient } from "./invoice-detail-client"

export const metadata: Metadata = { title: "Invoice Detail | TAC Express" }

interface Props {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params
  return <InvoiceDetailClient invoiceId={id} />
}
