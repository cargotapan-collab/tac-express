"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { AwbBarcode } from "./awb-barcode"

export interface ShippingLabelData {
  awbNumber: string
  origin: string
  destination: string
  serviceLevel: string
  paymentMode: string

  senderName: string
  senderPhone?: string
  senderAddress: string

  receiverName: string
  receiverPhone?: string
  receiverAddress: string

  pieces?: number
  weightKg?: number
  description?: string
  orderRef?: string

  companyName?: string
}

interface ShippingLabelProps {
  data: ShippingLabelData
  /** Width/height aspect for the label (defaults to 4"x6" portrait) */
  size?: "4x6" | "A5"
  className?: string
}

const ShippingLabel = React.forwardRef<HTMLDivElement, ShippingLabelProps>(
  function ShippingLabel({ data, size = "4x6", className }, ref) {
    const widthClass = size === "4x6" ? "w-[4in]" : "w-[148mm]"
    const companyName = data.companyName ?? "TAC EXPRESS"

    return (
      <div
        ref={ref}
        data-slot="shipping-label"
        className={cn(
          "mx-auto tac-print-label border-2 font-sans print:border-0",
          widthClass,
          className
        )}
        style={{ aspectRatio: size === "4x6" ? "4/6" : "148/210" }}
      >
        {/* Header — company + service */}
        <div className="flex items-center justify-between border-b-2 border-black px-3 py-2">
          <span className="font-serif font-bold text-lg leading-none">
            {companyName}
          </span>
          <span className="font-mono text-2xs uppercase tracking-widest border border-black px-1.5 py-0.5">
            {data.serviceLevel}
          </span>
        </div>

        {/* Route */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 border-b-2 border-black">
          <div className="text-center">
            <p className="font-mono text-2xs uppercase tracking-widest opacity-70">From</p>
            <p className="font-bold text-base leading-tight">{data.origin}</p>
          </div>
          <span className="font-bold text-xl">→</span>
          <div className="text-center">
            <p className="font-mono text-2xs uppercase tracking-widest opacity-70">To</p>
            <p className="font-bold text-base leading-tight">{data.destination}</p>
          </div>
        </div>

        {/* Sender / Receiver */}
        <div className="grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black">
          <div className="p-2">
            <p className="font-mono text-2xs uppercase tracking-widest opacity-70 mb-1">
              Sender
            </p>
            <p className="font-semibold text-xs leading-tight">{data.senderName}</p>
            <p className="text-2xs leading-tight opacity-80 mt-0.5">
              {data.senderAddress}
            </p>
            {data.senderPhone && (
              <p className="font-mono text-2xs mt-0.5">{data.senderPhone}</p>
            )}
          </div>
          <div className="p-2">
            <p className="font-mono text-2xs uppercase tracking-widest opacity-70 mb-1">
              Receiver
            </p>
            <p className="font-semibold text-xs leading-tight">
              {data.receiverName}
            </p>
            <p className="text-2xs leading-tight opacity-80 mt-0.5">
              {data.receiverAddress}
            </p>
            {data.receiverPhone && (
              <p className="font-mono text-2xs mt-0.5">{data.receiverPhone}</p>
            )}
          </div>
        </div>

        {/* Package meta */}
        <div className="grid grid-cols-3 divide-x-2 divide-black border-b-2 border-black">
          <div className="p-2 text-center">
            <p className="font-mono text-2xs uppercase tracking-widest opacity-70">
              Pieces
            </p>
            <p className="font-bold text-base">{data.pieces ?? 1}</p>
          </div>
          <div className="p-2 text-center">
            <p className="font-mono text-2xs uppercase tracking-widest opacity-70">
              Weight
            </p>
            <p className="font-bold text-base">
              {data.weightKg ? `${data.weightKg} kg` : "—"}
            </p>
          </div>
          <div className="p-2 text-center">
            <p className="font-mono text-2xs uppercase tracking-widest opacity-70">
              Payment
            </p>
            <p className="font-bold text-base">{data.paymentMode}</p>
          </div>
        </div>

        {/* Optional meta */}
        {(data.orderRef || data.description) && (
          <div className="px-3 py-1.5 border-b-2 border-black text-2xs">
            {data.orderRef && (
              <p>
                <span className="font-mono uppercase tracking-widest opacity-70">
                  Order:
                </span>{" "}
                <span className="font-mono">{data.orderRef}</span>
              </p>
            )}
            {data.description && (
              <p className="truncate">
                <span className="font-mono uppercase tracking-widest opacity-70">
                  Contents:
                </span>{" "}
                {data.description}
              </p>
            )}
          </div>
        )}

        {/* Barcode + AWB */}
        <div className="flex flex-col items-center justify-center py-4 gap-1 tac-print-label">
          <AwbBarcode value={data.awbNumber} height={70} barWidth={2} />
        </div>
      </div>
    )
  }
)

export { ShippingLabel }
