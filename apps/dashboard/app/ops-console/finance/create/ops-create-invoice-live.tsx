"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useCreateInvoice } from "@workspace/services/hooks/use-invoices"
import {
  OpsInvoiceForm,
  type OpsInvoiceFormInput,
} from "@workspace/ui/components/composed/ops-console/forms"

export function OpsCreateInvoiceLive() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateInvoice()

  const onSubmit = async (data: OpsInvoiceFormInput) => {
    try {
      const invoice = await mutateAsync({
        awbNumber: data.awbNumber.toUpperCase(),
        customerName: data.customerName,
        totalAmount: data.totalAmount,
        paymentMode: data.paymentMode,
        dueDate: data.dueDate || undefined,
      } as Parameters<typeof mutateAsync>[0])
      toast.success(`Invoice ${invoice.invoiceNumber} created`)
      router.push(`/ops-console/finance/${invoice.id}`)
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : String(err)
      toast.error(`Failed to create invoice: ${msg}`)
    }
  }

  return <OpsInvoiceForm onSubmit={onSubmit} isLoading={isPending} />
}
