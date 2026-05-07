"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import {
  PrintButton,
  PRINT_PAGE_SIZES,
} from "@workspace/ui/components/primitives/print-button"
import {
  ShippingLabel,
  type ShippingLabelData,
} from "@workspace/ui/components/composed/shipments/shipping-label"
import { RiArrowLeftLine } from "@workspace/ui/icons"

interface PrintInvoiceLabelClientProps {
  data: ShippingLabelData
  /** When true, the browser print dialog is triggered automatically. */
  autoPrint?: boolean
}

export function PrintInvoiceLabelClient({ data, autoPrint }: PrintInvoiceLabelClientProps) {
  const router = useRouter()
  const labelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!autoPrint) return
    const t = setTimeout(() => window.print(), 400)
    return () => clearTimeout(t)
  }, [autoPrint])

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto mb-6 flex max-w-xl items-center justify-between gap-3 print:hidden">
        <Button variant="outline" size="sm" onClick={() => router.back()} aria-label="Back">
          <RiArrowLeftLine aria-hidden="true" />
          <span className="ml-1.5">Back</span>
        </Button>
        <div className="flex flex-col items-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Shipping Label · 4×6 thermal (FBA 7-zone)
          </p>
          <p className="font-mono text-sm font-semibold text-foreground">{data.awbNumber}</p>
        </div>
        <PrintButton
          contentRef={labelRef}
          documentTitle={`TAC-Label-${data.awbNumber}`}
          pageStyle={PRINT_PAGE_SIZES.ThermalShipping}
          size="sm"
          variant="default"
        >
          Print 4×6
        </PrintButton>
      </div>

      <div data-print-target="label" className="flex justify-center">
        <ShippingLabel ref={labelRef} data={data} />
      </div>
    </div>
  )
}
