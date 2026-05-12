"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { cn } from "@workspace/ui/lib/utils"
import {
  RiBox3Line,
  RiUserLine,
  RiTeamLine,
  RiMoneyDollarCircleLine,
  RiAddLine,
  RiLoaderLine,
  type RemixiconComponentType,
} from "@workspace/ui/icons"

import { OpsCard } from "../ops-card"
import { OpsButton } from "../ops-button"
import { OpsFieldInput, OpsFieldSelect, OpsFieldLabel } from "../ops-field"

/**
 * Schema mirrors the v6 create-shipment form so the live wrapper can reuse the
 * same `CreateShipmentDbInput` snake-case mapping. Keeping it inline (DRY
 * violation) avoids a cross-package refactor; promote to `@workspace/types`
 * once the multi-step wizard variant is built.
 */
export const opsShipmentFormSchema = z.object({
  senderName: z.string().min(2, "Name required"),
  senderPhone: z.string().min(10, "Valid phone required"),
  senderAddress: z.string().min(5, "Address required"),
  senderCity: z.string().min(2, "City required"),
  senderState: z.string().min(2, "State required"),
  senderPincode: z.string().length(6, "6-digit PIN required"),
  receiverName: z.string().min(2, "Name required"),
  receiverPhone: z.string().min(10, "Valid phone required"),
  receiverAddress: z.string().min(5, "Address required"),
  receiverCity: z.string().min(2, "City required"),
  receiverState: z.string().min(2, "State required"),
  receiverPincode: z.string().length(6, "6-digit PIN required"),
  weight: z.coerce.number().positive("Weight must be positive"),
  length: z.coerce.number().positive("Required"),
  breadth: z.coerce.number().positive("Required"),
  height: z.coerce.number().positive("Required"),
  pieces: z.coerce.number().int().positive("At least 1 piece"),
  declaredValue: z.coerce.number().min(0, "0 or more"),
  description: z.string().min(2, "Description required"),
  paymentMode: z.enum(["TO_PAY", "PAID", "TBB"]),
  serviceType: z.enum(["STANDARD", "EXPRESS", "PRIORITY"]),
})

export type OpsShipmentFormInput = z.infer<typeof opsShipmentFormSchema>

interface OpsShipmentFormProps {
  onSubmit: (data: OpsShipmentFormInput) => Promise<void> | void
  isLoading?: boolean
  className?: string
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: RemixiconComponentType
  title: string
  children: React.ReactNode
}) {
  return (
    <OpsCard ticks className="p-6">
      <div className="flex items-center gap-2 paper-eyebrow mb-4">
        <Icon aria-hidden className="size-3.5" />
        <span>{title}</span>
      </div>
      {children}
    </OpsCard>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="font-paper-mono text-paper-err text-[length:var(--text-paper-11)] mt-1"
    >
      {message}
    </p>
  )
}

export function OpsShipmentForm({
  onSubmit,
  isLoading,
  className,
}: OpsShipmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpsShipmentFormInput>({
    resolver: zodResolver(opsShipmentFormSchema),
    mode: "onBlur",
    defaultValues: {
      pieces: 1,
      paymentMode: "PAID",
      serviceType: "STANDARD",
      declaredValue: 0,
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className={cn("space-y-4", className)}
      noValidate
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SENDER */}
        <Section icon={RiUserLine} title="Sender">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <OpsFieldLabel htmlFor="senderName">Name</OpsFieldLabel>
              <OpsFieldInput
                id="senderName"
                placeholder="FULL NAME"
                aria-invalid={errors.senderName ? true : undefined}
                {...register("senderName")}
              />
              <FieldError message={errors.senderName?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="senderPhone">Phone</OpsFieldLabel>
              <OpsFieldInput
                id="senderPhone"
                placeholder="10 DIGITS"
                inputMode="tel"
                aria-invalid={errors.senderPhone ? true : undefined}
                {...register("senderPhone")}
              />
              <FieldError message={errors.senderPhone?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="senderPincode">PIN</OpsFieldLabel>
              <OpsFieldInput
                id="senderPincode"
                placeholder="6 DIGITS"
                inputMode="numeric"
                aria-invalid={errors.senderPincode ? true : undefined}
                {...register("senderPincode")}
              />
              <FieldError message={errors.senderPincode?.message} />
            </div>
            <div className="col-span-2">
              <OpsFieldLabel htmlFor="senderAddress">Address</OpsFieldLabel>
              <OpsFieldInput
                id="senderAddress"
                placeholder="STREET / BUILDING / LANE"
                aria-invalid={errors.senderAddress ? true : undefined}
                {...register("senderAddress")}
              />
              <FieldError message={errors.senderAddress?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="senderCity">City</OpsFieldLabel>
              <OpsFieldInput
                id="senderCity"
                placeholder="CITY"
                aria-invalid={errors.senderCity ? true : undefined}
                {...register("senderCity")}
              />
              <FieldError message={errors.senderCity?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="senderState">State</OpsFieldLabel>
              <OpsFieldInput
                id="senderState"
                placeholder="STATE"
                aria-invalid={errors.senderState ? true : undefined}
                {...register("senderState")}
              />
              <FieldError message={errors.senderState?.message} />
            </div>
          </div>
        </Section>

        {/* RECEIVER */}
        <Section icon={RiTeamLine} title="Receiver">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <OpsFieldLabel htmlFor="receiverName">Name</OpsFieldLabel>
              <OpsFieldInput
                id="receiverName"
                placeholder="FULL NAME"
                aria-invalid={errors.receiverName ? true : undefined}
                {...register("receiverName")}
              />
              <FieldError message={errors.receiverName?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="receiverPhone">Phone</OpsFieldLabel>
              <OpsFieldInput
                id="receiverPhone"
                placeholder="10 DIGITS"
                inputMode="tel"
                aria-invalid={errors.receiverPhone ? true : undefined}
                {...register("receiverPhone")}
              />
              <FieldError message={errors.receiverPhone?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="receiverPincode">PIN</OpsFieldLabel>
              <OpsFieldInput
                id="receiverPincode"
                placeholder="6 DIGITS"
                inputMode="numeric"
                aria-invalid={errors.receiverPincode ? true : undefined}
                {...register("receiverPincode")}
              />
              <FieldError message={errors.receiverPincode?.message} />
            </div>
            <div className="col-span-2">
              <OpsFieldLabel htmlFor="receiverAddress">Address</OpsFieldLabel>
              <OpsFieldInput
                id="receiverAddress"
                placeholder="STREET / BUILDING / LANE"
                aria-invalid={errors.receiverAddress ? true : undefined}
                {...register("receiverAddress")}
              />
              <FieldError message={errors.receiverAddress?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="receiverCity">City</OpsFieldLabel>
              <OpsFieldInput
                id="receiverCity"
                placeholder="CITY"
                aria-invalid={errors.receiverCity ? true : undefined}
                {...register("receiverCity")}
              />
              <FieldError message={errors.receiverCity?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="receiverState">State</OpsFieldLabel>
              <OpsFieldInput
                id="receiverState"
                placeholder="STATE"
                aria-invalid={errors.receiverState ? true : undefined}
                {...register("receiverState")}
              />
              <FieldError message={errors.receiverState?.message} />
            </div>
          </div>
        </Section>

        {/* PACKAGE */}
        <Section icon={RiBox3Line} title="Package">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <OpsFieldLabel htmlFor="description">Contents</OpsFieldLabel>
              <OpsFieldInput
                id="description"
                placeholder="DESCRIBE THE GOODS"
                aria-invalid={errors.description ? true : undefined}
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="weight">Weight (kg)</OpsFieldLabel>
              <OpsFieldInput
                id="weight"
                placeholder="0.0"
                inputMode="decimal"
                aria-invalid={errors.weight ? true : undefined}
                {...register("weight")}
              />
              <FieldError message={errors.weight?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="pieces">Pieces</OpsFieldLabel>
              <OpsFieldInput
                id="pieces"
                placeholder="1"
                inputMode="numeric"
                aria-invalid={errors.pieces ? true : undefined}
                {...register("pieces")}
              />
              <FieldError message={errors.pieces?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="declaredValue">Decl. ₹</OpsFieldLabel>
              <OpsFieldInput
                id="declaredValue"
                placeholder="0"
                inputMode="numeric"
                aria-invalid={errors.declaredValue ? true : undefined}
                {...register("declaredValue")}
              />
              <FieldError message={errors.declaredValue?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="length">L (cm)</OpsFieldLabel>
              <OpsFieldInput
                id="length"
                placeholder="0"
                inputMode="decimal"
                aria-invalid={errors.length ? true : undefined}
                {...register("length")}
              />
              <FieldError message={errors.length?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="breadth">B (cm)</OpsFieldLabel>
              <OpsFieldInput
                id="breadth"
                placeholder="0"
                inputMode="decimal"
                aria-invalid={errors.breadth ? true : undefined}
                {...register("breadth")}
              />
              <FieldError message={errors.breadth?.message} />
            </div>
            <div>
              <OpsFieldLabel htmlFor="height">H (cm)</OpsFieldLabel>
              <OpsFieldInput
                id="height"
                placeholder="0"
                inputMode="decimal"
                aria-invalid={errors.height ? true : undefined}
                {...register("height")}
              />
              <FieldError message={errors.height?.message} />
            </div>
          </div>
        </Section>

        {/* SERVICE + PAYMENT */}
        <Section icon={RiMoneyDollarCircleLine} title="Service · Payment">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <OpsFieldLabel htmlFor="serviceType">Service</OpsFieldLabel>
              <OpsFieldSelect id="serviceType" {...register("serviceType")}>
                <option value="STANDARD">STANDARD</option>
                <option value="EXPRESS">EXPRESS</option>
                <option value="PRIORITY">PRIORITY</option>
              </OpsFieldSelect>
            </div>
            <div>
              <OpsFieldLabel htmlFor="paymentMode">Payment</OpsFieldLabel>
              <OpsFieldSelect id="paymentMode" {...register("paymentMode")}>
                <option value="PAID">PAID</option>
                <option value="TO_PAY">TO PAY</option>
                <option value="TBB">TO BE BILLED</option>
              </OpsFieldSelect>
            </div>
          </div>
        </Section>
      </div>

      {/* SUBMIT BAR */}
      <div className="flex items-center justify-end gap-2 border-t border-paper-line pt-4">
        <OpsButton type="reset" variant="ghost">
          Reset
        </OpsButton>
        <OpsButton type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <RiLoaderLine aria-hidden className="size-3 animate-spin motion-reduce:animate-none" />
              Creating…
            </>
          ) : (
            <>
              <RiAddLine aria-hidden className="size-3" />
              Create Shipment
            </>
          )}
        </OpsButton>
      </div>
    </form>
  )
}
