import type { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"

import { createInvoiceServerService } from "@workspace/services/server"
import type { InvoicePrintData } from "@workspace/ui/components/composed/finance/invoice-print-view"

import { PrintInvoiceClient } from "./print-invoice-client"

export const metadata: Metadata = {
  title: "Print Invoice · TAC Express",
  description: "Invoice for printing",
}

export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PrintInvoicePage({ params }: PageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const invoiceService = createInvoiceServerService(cookieStore)

  const invoice = await invoiceService.getInvoiceById(id).catch(() => null)
  if (!invoice) notFound()

  const data: InvoicePrintData = {
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    createdAt: invoice.createdAt,
    dueDate: invoice.dueDate,
    paymentMode: invoice.paymentMode,
    awbNumber: invoice.awbNumber,
    customerName: invoice.customerName,
    customerGstin: invoice.customerGstin,
    baseFreight: invoice.baseFreight,
    docketCharge: invoice.docketCharge,
    fuelSurcharge: invoice.fuelSurcharge,
    handlingFee: invoice.handlingFee,
    insurance: invoice.insurance,
    discount: invoice.discount,
    cgst: invoice.tax.cgst,
    sgst: invoice.tax.sgst,
    igst: invoice.tax.igst,
    totalTax: invoice.tax.total,
    totalAmount: invoice.totalAmount,
    notes: invoice.notes,
  }

  return <PrintInvoiceClient data={data} />
}
