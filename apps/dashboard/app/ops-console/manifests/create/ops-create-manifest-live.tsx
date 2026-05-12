"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useCreateManifest } from "@workspace/services/hooks/use-manifests"
import {
  OpsManifestForm,
  type OpsManifestFormInput,
} from "@workspace/ui/components/composed/ops-console/forms"

export function OpsCreateManifestLive() {
  const router = useRouter()
  const { mutateAsync, isPending } = useCreateManifest()

  const onSubmit = async (data: OpsManifestFormInput) => {
    try {
      const manifest = await mutateAsync({
        originHub: data.originHub.toUpperCase(),
        destHub: data.destHub.toUpperCase(),
        transportMode: data.transportMode,
        departureDate: data.departureDate || undefined,
        notes: data.notes || undefined,
      } as Parameters<typeof mutateAsync>[0])
      toast.success(`Manifest ${manifest.manifestNumber} created`)
      router.push(`/ops-console/manifests/${manifest.id}`)
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : String(err)
      toast.error(`Failed to create manifest: ${msg}`)
    }
  }

  return <OpsManifestForm onSubmit={onSubmit} isLoading={isPending} />
}
