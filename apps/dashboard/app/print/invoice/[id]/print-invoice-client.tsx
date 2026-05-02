"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import {
  PrintButton,
  PRINT_PAGE_SIZES,
} from "@workspace/ui/components/primitives/print-button"
import {
  InvoicePrintView,
  type InvoicePrintData,
} from "@workspace/ui/components/composed/finance/invoice-print-view"
import { RiArrowLeftLine } from "@workspace/ui/icons"

interface PrintInvoiceClientProps {
  data: InvoicePrintData
}

export function PrintInvoiceClient({ data }: PrintInvoiceClientProps) {
  const router = useRouter()
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-background p-6">
      <div
        className="mx-auto mb-6 flex items-center justify-between gap-3 print:hidden"
        style={{ width: "210mm" }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          aria-label="Back"
        >
          <RiArrowLeftLine aria-hidden="true" />
          <span className="ml-1.5">Back</span>
        </Button>
        <div className="flex flex-col items-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Tax Invoice · A4
          </p>
          <p className="font-mono text-sm font-semibold text-foreground">
            {data.invoiceNumber}
          </p>
        </div>
        <PrintButton
          contentRef={ref}
          documentTitle={`TAC-Invoice-${data.invoiceNumber}`}
          pageStyle={PRINT_PAGE_SIZES.A4}
          size="sm"
        >
          Print A4
        </PrintButton>
      </div>

      <div data-print-target="invoice" className="flex justify-center">
        <InvoicePrintView ref={ref} data={data} />
      </div>
    </div>
  )
}
