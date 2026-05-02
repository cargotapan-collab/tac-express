"use client"

import { useRouter } from "next/navigation"
import { CreateShipmentForm } from "@workspace/ui/components/composed/shipments/create-shipment-form"
import { useCreateShipment } from "@workspace/services/hooks/use-shipments"
import { toast } from "sonner"

export function CreateShipmentPageClient() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateShipment()

  return (
    <CreateShipmentForm
      isLoading={isPending}
      onSubmit={async (data) => {
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
          router.push(`/shipments/${shipment.id}`)
        } catch (err) {
          const msg = err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : JSON.stringify(err)
          toast.error(`Failed to create shipment: ${msg}`)
          console.error("[createShipment]", { message: msg, raw: err })
        }
      }}
    />
  )
}
