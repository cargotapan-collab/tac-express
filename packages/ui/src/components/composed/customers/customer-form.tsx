"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
  RiUserLine,
  RiMapPinLine,
} from "@workspace/ui/icons"

const customerSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z.string().min(10, "Valid phone required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  gstin: z.string().optional().or(z.literal("")),
  addressLine1: z.string().min(1, "Address required"),
  addressLine2: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  zip: z.string().min(4, "ZIP required"),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormValues>
  onSubmit: (values: CustomerFormValues) => Promise<void>
  isLoading?: boolean
}

type StepKey = "identity" | "address"
type StepDef = {
  id: StepKey
  label: string
  caption: string
  icon: React.ElementType
  fields: (keyof CustomerFormValues)[]
}

const STEPS: StepDef[] = [
  {
    id: "identity",
    label: "Identity",
    caption: "Who are they?",
    icon: RiUserLine,
    fields: ["name", "phone", "email", "gstin"],
  },
  {
    id: "address",
    label: "Address",
    caption: "Where are they?",
    icon: RiMapPinLine,
    fields: ["addressLine1", "addressLine2", "city", "state", "zip"],
  },
]

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="font-mono text-2xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="font-mono text-2xs text-muted-foreground/60">{hint}</p>
      ) : null}
    </div>
  )
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full border border-border bg-background px-3 font-sans text-sm text-foreground",
        "placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring",
        className
      )}
      {...props}
    />
  )
}

function Stepper({ current }: { current: number }) {
  return (
    <ol
      data-slot="customer-form-stepper"
      aria-label="New customer progress"
      className="flex w-full border border-border bg-card overflow-hidden"
    >
      {STEPS.map((step, idx) => {
        const isActive = idx === current
        const isCompleted = idx < current
        const Icon = step.icon
        return (
          <li
            key={step.id}
            data-state={isActive ? "active" : isCompleted ? "done" : "pending"}
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "group/step flex-1 relative border-r border-border last:border-r-0",
              isActive && "bg-primary/5"
            )}
          >
            <div className="px-4 py-3 flex items-center gap-3">
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-xs font-semibold tabular-nums",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                      ? "border-primary text-primary bg-card"
                      : "border-border text-muted-foreground bg-card"
                )}
              >
                {isCompleted ? (
                  <RiCheckLine className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  idx + 1
                )}
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    "font-mono text-2xs uppercase tracking-widest",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Step {idx + 1} / {STEPS.length}
                </span>
                <span
                  className={cn(
                    "font-sans text-sm font-medium truncate flex items-center gap-1.5",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {step.label}
                </span>
              </div>
            </div>
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  isLoading,
}: CustomerFormProps) {
  const [step, setStep] = React.useState(0)
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues,
    mode: "onTouched",
  })

  const isLastStep = step === STEPS.length - 1
  const currentStep = STEPS[step]!

  const handleNext = async () => {
    const valid = await trigger(currentStep.fields, { shouldFocus: true })
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleBack = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      data-slot="customer-form"
    >
      <Stepper current={step} />

      <div className="bg-background border border-border p-5 space-y-4">
        <div className="flex items-baseline justify-between border-b border-border pb-3">
          <p className="font-serif text-base text-foreground">
            {currentStep.caption}
          </p>
          <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground tabular-nums">
            {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
          </span>
        </div>

        {step === 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Full Name / Company Name"
                error={errors.name?.message}
              >
                <Input
                  {...register("name")}
                  placeholder="Acme Logistics"
                  autoComplete="organization"
                />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <Input
                  {...register("phone")}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </Field>
              <Field
                label="Email"
                hint="Optional — used for invoices & alerts"
                error={errors.email?.message}
              >
                <Input
                  {...register("email")}
                  placeholder="contact@acme.com"
                  type="email"
                  autoComplete="email"
                />
              </Field>
              <Field
                label="GSTIN"
                hint="Optional — required for tax invoicing"
                error={errors.gstin?.message}
              >
                <Input
                  {...register("gstin")}
                  placeholder="29ABCDE1234F1Z5"
                  autoComplete="off"
                />
              </Field>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Field
              label="Address Line 1"
              error={errors.addressLine1?.message}
            >
              <Input
                {...register("addressLine1")}
                placeholder="123, MG Road"
                autoComplete="address-line1"
              />
            </Field>
            <Field
              label="Address Line 2"
              hint="Landmark, suite, floor (optional)"
              error={errors.addressLine2?.message}
            >
              <Input
                {...register("addressLine2")}
                placeholder="Near Town Hall"
                autoComplete="address-line2"
              />
            </Field>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="City" error={errors.city?.message}>
                <Input
                  {...register("city")}
                  placeholder="Imphal"
                  autoComplete="address-level2"
                />
              </Field>
              <Field label="State" error={errors.state?.message}>
                <Input
                  {...register("state")}
                  placeholder="Manipur"
                  autoComplete="address-level1"
                />
              </Field>
              <Field label="ZIP / Pincode" error={errors.zip?.message}>
                <Input
                  {...register("zip")}
                  placeholder="795001"
                  autoComplete="postal-code"
                  inputMode="numeric"
                />
              </Field>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={step === 0 || isLoading}
          className="font-mono text-2xs uppercase tracking-widest"
        >
          <RiArrowLeftLine className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          Back
        </Button>

        <span className="font-mono text-2xs uppercase tracking-widest text-muted-foreground/60">
          {currentStep.label}
        </span>

        {isLastStep ? (
          <Button
            type="submit"
            disabled={isLoading}
            className="font-mono text-2xs font-bold uppercase tracking-widest"
          >
            {isLoading ? "Saving…" : "Save Customer"}
            {!isLoading && (
              <RiCheckLine className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="font-mono text-2xs font-bold uppercase tracking-widest"
          >
            Next
            <RiArrowRightLine className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
          </Button>
        )}
      </div>
    </form>
  )
}
