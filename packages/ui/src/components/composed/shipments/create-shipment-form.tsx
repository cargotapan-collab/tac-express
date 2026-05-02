"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@workspace/ui/lib/utils"

const createShipmentSchema = z.object({
  senderName: z.string().min(2, "Name required"),
  senderPhone: z.string().min(10, "Valid phone required"),
  senderAddress: z.string().min(5, "Address required"),
  senderCity: z.string().min(2, "City required"),
  senderState: z.string().min(2, "State required"),
  senderPincode: z.string().length(6, "6-digit pincode required"),
  receiverName: z.string().min(2, "Name required"),
  receiverPhone: z.string().min(10, "Valid phone required"),
  receiverAddress: z.string().min(5, "Address required"),
  receiverCity: z.string().min(2, "City required"),
  receiverState: z.string().min(2, "State required"),
  receiverPincode: z.string().length(6, "6-digit pincode required"),
  weight: z.coerce.number().positive("Weight must be positive"),
  length: z.coerce.number().positive(),
  breadth: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
  declaredValue: z.coerce.number().min(0),
  description: z.string().min(2, "Description required"),
  paymentMode: z.enum(["TO_PAY", "PAID", "TBB"]),
  serviceType: z.enum(["STANDARD", "EXPRESS", "PRIORITY"]),
})

type CreateShipmentInput = z.infer<typeof createShipmentSchema>

const STEPS = ["Sender", "Receiver", "Package", "Review"] as const

interface CreateShipmentFormProps {
  onSubmit: (data: CreateShipmentInput) => Promise<void>
  isLoading?: boolean
  className?: string
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="font-mono text-2xs text-destructive mt-0.5">{message}</p>
}

function FormField({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  )
}

const inputClass = cn(
  "w-full h-8 border border-border bg-background px-3 text-sm font-sans",
  "placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
)

const selectClass = cn(inputClass, "cursor-pointer")

function CreateShipmentForm({ onSubmit, isLoading, className }: CreateShipmentFormProps) {
  const [step, setStep] = React.useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<CreateShipmentInput>({
    resolver: zodResolver(createShipmentSchema),
    mode: "onBlur",
  })

  const stepFields: (keyof CreateShipmentInput)[][] = [
    ["senderName", "senderPhone", "senderAddress", "senderCity", "senderState", "senderPincode"],
    ["receiverName", "receiverPhone", "receiverAddress", "receiverCity", "receiverState", "receiverPincode"],
    ["weight", "length", "breadth", "height", "declaredValue", "description", "paymentMode", "serviceType"],
    [],
  ]

  async function handleNext() {
    const valid = await trigger(stepFields[step] as (keyof CreateShipmentInput)[])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0))
  }

  const values = getValues()

  return (
    <div data-slot="create-shipment-form" className={cn("space-y-6", className)}>
      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, idx) => {
          const isDone = idx < step
          const isCurrent = idx === step
          return (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "h-6 w-6 border flex items-center justify-center font-mono text-2xs",
                    isDone && "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary text-primary",
                    !isDone && !isCurrent && "border-border text-muted-foreground"
                  )}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                <span className={cn(
                  "font-mono text-3xs uppercase tracking-wider",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn("h-px w-12 mb-4", idx < step ? "bg-primary" : "bg-border")} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0 — Sender */}
        {step === 0 && (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" error={errors.senderName?.message}>
              <input {...register("senderName")} className={inputClass} placeholder="John Doe" />
            </FormField>
            <FormField label="Phone" error={errors.senderPhone?.message}>
              <input {...register("senderPhone")} className={inputClass} placeholder="9876543210" />
            </FormField>
            <FormField label="Address" error={errors.senderAddress?.message} >
              <input {...register("senderAddress")} className={inputClass} placeholder="Street address" />
            </FormField>
            <FormField label="City" error={errors.senderCity?.message}>
              <input {...register("senderCity")} className={inputClass} placeholder="Mumbai" />
            </FormField>
            <FormField label="State" error={errors.senderState?.message}>
              <input {...register("senderState")} className={inputClass} placeholder="Maharashtra" />
            </FormField>
            <FormField label="Pincode" error={errors.senderPincode?.message}>
              <input {...register("senderPincode")} className={inputClass} placeholder="400001" maxLength={6} />
            </FormField>
          </div>
        )}

        {/* Step 1 — Receiver */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" error={errors.receiverName?.message}>
              <input {...register("receiverName")} className={inputClass} placeholder="Jane Doe" />
            </FormField>
            <FormField label="Phone" error={errors.receiverPhone?.message}>
              <input {...register("receiverPhone")} className={inputClass} placeholder="9876543210" />
            </FormField>
            <FormField label="Address" error={errors.receiverAddress?.message}>
              <input {...register("receiverAddress")} className={inputClass} placeholder="Street address" />
            </FormField>
            <FormField label="City" error={errors.receiverCity?.message}>
              <input {...register("receiverCity")} className={inputClass} placeholder="Imphal" />
            </FormField>
            <FormField label="State" error={errors.receiverState?.message}>
              <input {...register("receiverState")} className={inputClass} placeholder="Manipur" />
            </FormField>
            <FormField label="Pincode" error={errors.receiverPincode?.message}>
              <input {...register("receiverPincode")} className={inputClass} placeholder="795001" maxLength={6} />
            </FormField>
          </div>
        )}

        {/* Step 2 — Package */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Weight (kg)" error={errors.weight?.message}>
              <input {...register("weight")} type="number" step="0.01" className={inputClass} placeholder="1.50" />
            </FormField>
            <FormField label="Declared Value (₹)" error={errors.declaredValue?.message}>
              <input {...register("declaredValue")} type="number" className={inputClass} placeholder="500" />
            </FormField>
            <FormField label="Length (cm)" error={errors.length?.message}>
              <input {...register("length")} type="number" className={inputClass} placeholder="30" />
            </FormField>
            <FormField label="Breadth (cm)" error={errors.breadth?.message}>
              <input {...register("breadth")} type="number" className={inputClass} placeholder="20" />
            </FormField>
            <FormField label="Height (cm)" error={errors.height?.message}>
              <input {...register("height")} type="number" className={inputClass} placeholder="15" />
            </FormField>
            <FormField label="Description" error={errors.description?.message}>
              <input {...register("description")} className={inputClass} placeholder="Electronic items" />
            </FormField>
            <FormField label="Payment Mode" error={errors.paymentMode?.message}>
              <select {...register("paymentMode")} className={selectClass}>
                <option value="TO_PAY">To Pay</option>
                <option value="PAID">Paid</option>
                <option value="TBB">To Be Billed</option>
              </select>
            </FormField>
            <FormField label="Service Type" error={errors.serviceType?.message}>
              <select {...register("serviceType")} className={selectClass}>
                <option value="STANDARD">Standard</option>
                <option value="EXPRESS">Express</option>
                <option value="PRIORITY">Priority</option>
              </select>
            </FormField>
          </div>
        )}

        {/* Step 3 — Review */}
        {step === 3 && (
          <div className="space-y-4 border border-border bg-card p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Review Details</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {[
                ["Sender", values.senderName],
                ["Sender Phone", values.senderPhone],
                ["Sender Address", `${values.senderAddress}, ${values.senderCity} - ${values.senderPincode}`],
                ["Receiver", values.receiverName],
                ["Receiver Phone", values.receiverPhone],
                ["Receiver Address", `${values.receiverAddress}, ${values.receiverCity} - ${values.receiverPincode}`],
                ["Weight", `${values.weight} kg`],
                ["Dimensions", `${values.length}×${values.breadth}×${values.height} cm`],
                ["Declared Value", `₹${values.declaredValue}`],
                ["Payment", values.paymentMode],
                ["Service", values.serviceType],
                ["Contents", values.description],
              ].map(([label, val]) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <span className="font-mono text-3xs uppercase tracking-wider text-muted-foreground">{label}</span>
                  <span className="font-sans text-sm text-foreground">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className={cn(
              "h-8 px-4 border border-border font-mono text-xs uppercase tracking-wider",
              "text-muted-foreground hover:text-foreground hover:border-foreground transition-colors",
              "disabled:opacity-40 disabled:cursor-not-allowed"
            )}
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="h-8 px-6 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="h-8 px-6 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isLoading ? "Creating..." : "Create Shipment"}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export { CreateShipmentForm }
export type { CreateShipmentInput }
