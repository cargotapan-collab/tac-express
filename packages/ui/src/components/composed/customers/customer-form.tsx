"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@workspace/ui/lib/utils"
import {
  SmartAddressFields,
  type SmartAddressValue,
} from "@workspace/ui/components/composed/smart-address-fields"

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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
      {error && <p className="font-mono text-2xs text-destructive">{error}</p>}
    </div>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
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

export function CustomerForm({ defaultValues, onSubmit, isLoading }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  })

  // Bridge the SmartAddressFields controlled API to RHF's setValue / watch.
  // Register hidden inputs for the validated address keys so RHF's resolver
  // can read them; SmartAddressFields drives state via setValue.
  React.useEffect(() => {
    register("addressLine1")
    register("addressLine2")
    register("city")
    register("state")
    register("zip")
  }, [register])

  const watched = watch(["addressLine1", "addressLine2", "city", "state", "zip"])
  const addressValue: SmartAddressValue = {
    line1: watched[0],
    line2: watched[1],
    city: watched[2],
    state: watched[3],
    zip: watched[4],
  }

  const handleAddressChange = React.useCallback(
    (next: SmartAddressValue) => {
      setValue("addressLine1", next.line1 ?? "", { shouldDirty: true, shouldValidate: false })
      setValue("addressLine2", next.line2 ?? "", { shouldDirty: true, shouldValidate: false })
      setValue("city", next.city ?? "", { shouldDirty: true, shouldValidate: false })
      setValue("state", next.state ?? "", { shouldDirty: true, shouldValidate: false })
      setValue("zip", next.zip ?? "", { shouldDirty: true, shouldValidate: false })
    },
    [setValue],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name / Company Name" error={errors.name?.message}>
          <Input {...register("name")} placeholder="Acme Logistics" />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input {...register("phone")} placeholder="+91 98765 43210" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input {...register("email")} placeholder="contact@acme.com" type="email" />
        </Field>
        <Field label="GSTIN" error={errors.gstin?.message}>
          <Input {...register("gstin")} placeholder="29ABCDE1234F1Z5" />
        </Field>
      </div>

      <SmartAddressFields
        label="Billing address"
        value={addressValue}
        onChange={handleAddressChange}
        idPrefix="customer-addr"
        errors={{
          line1: errors.addressLine1?.message,
          line2: errors.addressLine2?.message,
          city: errors.city?.message,
          state: errors.state?.message,
          zip: errors.zip?.message,
        }}
      />

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="h-9 px-6 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Saving..." : "Save Customer"}
        </button>
      </div>
    </form>
  )
}
