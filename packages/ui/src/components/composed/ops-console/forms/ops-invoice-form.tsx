"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { cn } from "@workspace/ui/lib/utils"
import {
  RiMoneyDollarCircleLine,
  RiAddLine,
  RiLoaderLine,
} from "@workspace/ui/icons"

import { OpsCard } from "../ops-card"
import { OpsButton } from "../ops-button"
import {
  OpsFieldInput,
  OpsFieldSelect,
  OpsFieldLabel,
} from "../ops-field"

export const opsInvoiceFormSchema = z.object({
  awbNumber: z.string().min(8, "Valid AWB required"),
  customerName: z.string().min(2, "Customer name required"),
  paymentMode: z.enum(["TO_PAY", "PAID", "TBB"]),
  totalAmount: z.coerce.number().positive("> 0"),
  dueDate: z.string().optional().or(z.literal("")),
})

export type OpsInvoiceFormInput = z.infer<typeof opsInvoiceFormSchema>

interface OpsInvoiceFormProps {
  onSubmit: (data: OpsInvoiceFormInput) => Promise<void> | void
  isLoading?: boolean
  className?: string
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="font-paper-mono text-paper-err text-[length:var(--text-paper-11)] mt-1">
      {message}
    </p>
  )
}

export function OpsInvoiceForm({ onSubmit, isLoading, className }: OpsInvoiceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpsInvoiceFormInput>({
    resolver: zodResolver(opsInvoiceFormSchema),
    mode: "onBlur",
    defaultValues: { paymentMode: "PAID" },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d))} className={cn("space-y-4", className)} noValidate>
      <OpsCard ticks className="p-6">
        <div className="flex items-center gap-2 paper-eyebrow mb-4">
          <RiMoneyDollarCircleLine aria-hidden className="size-3.5" />
          <span>Invoice Header</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <OpsFieldLabel htmlFor="inv-awb">AWB</OpsFieldLabel>
            <OpsFieldInput id="inv-awb" placeholder="TAC..." {...register("awbNumber")} />
            <FieldError message={errors.awbNumber?.message} />
          </div>
          <div>
            <OpsFieldLabel htmlFor="inv-cust">Customer</OpsFieldLabel>
            <OpsFieldInput id="inv-cust" placeholder="CUSTOMER NAME" {...register("customerName")} />
            <FieldError message={errors.customerName?.message} />
          </div>
          <div>
            <OpsFieldLabel htmlFor="inv-total">Total ₹</OpsFieldLabel>
            <OpsFieldInput id="inv-total" inputMode="decimal" placeholder="0.00" {...register("totalAmount")} />
            <FieldError message={errors.totalAmount?.message} />
          </div>
          <div>
            <OpsFieldLabel htmlFor="inv-payment">Payment Mode</OpsFieldLabel>
            <OpsFieldSelect id="inv-payment" {...register("paymentMode")}>
              <option value="PAID">PAID</option>
              <option value="TO_PAY">TO PAY</option>
              <option value="TBB">TO BE BILLED</option>
            </OpsFieldSelect>
          </div>
          <div className="col-span-2">
            <OpsFieldLabel htmlFor="inv-due">Due Date (optional)</OpsFieldLabel>
            <OpsFieldInput id="inv-due" type="date" {...register("dueDate")} />
          </div>
        </div>
      </OpsCard>

      <div className="border border-dashed border-paper-line bg-paper-2/40 p-4 font-paper-mono text-[length:var(--text-paper-12)] text-paper-fg-3">
        Single-page MVP. Multi-step invoice wizard with rate lookup + line-item
        breakdown lives at <span className="paper-id">/finance/create</span> on the v6 flow until ported.
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-paper-line pt-4">
        <OpsButton type="reset" variant="ghost">Reset</OpsButton>
        <OpsButton type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <><RiLoaderLine aria-hidden className="size-3 animate-spin motion-reduce:animate-none" />Creating…</>
          ) : (
            <><RiAddLine aria-hidden className="size-3" />Create Invoice</>
          )}
        </OpsButton>
      </div>
    </form>
  )
}
