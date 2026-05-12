"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useCreateShipment } from "@workspace/services/hooks/use-shipments"
import {
  OpsShipmentForm,
  type OpsShipmentFormInput,
} from "@workspace/ui/components/composed/ops-console/forms"

/**
 * Live wrapper for the paper New Shipment form. Wiring mirrors the v6
 * `CreateShipmentPageClient` so the underlying mutation contract + toast
 * conventions are identical. This is the **canonical paper form pattern** —
 * other forms (manifest wizard, invoice wizard, customer, rate card) should
 * follow the same shape:
 *
 *   1. Server `page.tsx` mounts the live wrapper inside an OpsFrame.
 *   2. Live wrapper destructures `mutateAsync` + `isPending` from the hook.
 *   3. `onSubmit` maps the form schema → service input, calls `mutateAsync`,
 *      shows `toast.success(...)` or `toast.error(...)`, then `router.push`.
 */
export function OpsCreateShipmentLive() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateShipment()

  const onSubmit = async (data: OpsShipmentFormInput) => {
    try {
      const volumetric = (data.length * data.breadth * data.height) / 5000
      const chargeable = Math.max(data.weight, volumetric)
      const shipment = await mutateAsync({
        sender_name: data.senderName,
        sender_phone: data.senderPhone,
        sender_address: data.senderAddress,
        sender_city: data.senderCity,
        sender_state: data.senderState,
        sender_pincode: data.senderPincode,
        receiver_name: data.receiverName,
        receiver_phone: data.receiverPhone,
        receiver_address: data.receiverAddress,
        receiver_city: data.receiverCity,
        receiver_state: data.receiverState,
        receiver_pincode: data.receiverPincode,
        dead_weight: data.weight,
        volumetric_weight: volumetric,
        chargeable_weight: chargeable,
        financials: { declaredValue: data.declaredValue },
        description: data.description,
        payment_mode: data.paymentMode,
        service_level: data.serviceType,
      })
      toast.success(`Shipment ${shipment.awbNumber} created`)
      router.push(`/ops-console/shipments/${shipment.id}`)
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : JSON.stringify(err)
      toast.error(`Failed to create shipment: ${msg}`)
      console.error("[OpsCreateShipmentLive]", { message: msg, raw: err })
    }
  }

  return <OpsShipmentForm onSubmit={onSubmit} isLoading={isPending} />
}
