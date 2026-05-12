"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useCreateCustomer } from "@workspace/services/hooks/use-customers"
import {
  OpsCustomerForm,
  type OpsCustomerFormInput,
} from "@workspace/ui/components/composed/ops-console/forms"

export function OpsCreateCustomerLive() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateCustomer()

  const onSubmit = async (data: OpsCustomerFormInput) => {
    try {
      const customer = await mutateAsync({
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        gstin: data.gstin || undefined,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || undefined,
        city: data.city,
        state: data.state,
        zip: data.zip,
      })
      toast.success(`Customer ${customer.name} created`)
      router.push(`/ops-console/customers/${customer.id}`)
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : String(err)
      toast.error(`Failed to create customer: ${msg}`)
    }
  }

  return <OpsCustomerForm onSubmit={onSubmit} isLoading={isPending} />
}
