"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { cn } from "@workspace/ui/lib/utils"

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
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  })

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
      <Field label="Address Line 1" error={errors.addressLine1?.message}>
        <Input {...register("addressLine1")} placeholder="123, MG Road" />
      </Field>
      <Field label="Address Line 2" error={errors.addressLine2?.message}>
        <Input {...register("addressLine2")} placeholder="Near Town Hall (optional)" />
      </Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="City" error={errors.city?.message}>
          <Input {...register("city")} placeholder="Imphal" />
        </Field>
        <Field label="State" error={errors.state?.message}>
          <Input {...register("state")} placeholder="Manipur" />
        </Field>
        <Field label="ZIP / Pincode" error={errors.zip?.message}>
          <Input {...register("zip")} placeholder="795001" />
        </Field>
      </div>
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