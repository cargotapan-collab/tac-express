"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { cn } from "@workspace/ui/lib/utils"
import {
  RiFileList3Line,
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

export const opsManifestFormSchema = z.object({
  originHub: z.string().min(2, "Required"),
  destHub: z.string().min(2, "Required"),
  transportMode: z.enum(["ROAD", "RAIL", "AIR"]),
  departureDate: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
})

export type OpsManifestFormInput = z.infer<typeof opsManifestFormSchema>

interface OpsManifestFormProps {
  onSubmit: (data: OpsManifestFormInput) => Promise<void> | void
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

export function OpsManifestForm({ onSubmit, isLoading, className }: OpsManifestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpsManifestFormInput>({
    resolver: zodResolver(opsManifestFormSchema),
    mode: "onBlur",
    defaultValues: { transportMode: "ROAD" },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d))} className={cn("space-y-4", className)} noValidate>
      <OpsCard ticks className="p-6">
        <div className="flex items-center gap-2 paper-eyebrow mb-4">
          <RiFileList3Line aria-hidden className="size-3.5" />
          <span>Manifest Setup</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <OpsFieldLabel htmlFor="m-origin">Origin Hub</OpsFieldLabel>
            <OpsFieldInput id="m-origin" placeholder="E.G. IMPHAL" {...register("originHub")} />
            <FieldError message={errors.originHub?.message} />
          </div>
          <div>
            <OpsFieldLabel htmlFor="m-dest">Destination Hub</OpsFieldLabel>
            <OpsFieldInput id="m-dest" placeholder="E.G. NEW_DELHI" {...register("destHub")} />
            <FieldError message={errors.destHub?.message} />
          </div>
          <div>
            <OpsFieldLabel htmlFor="m-mode">Transport Mode</OpsFieldLabel>
            <OpsFieldSelect id="m-mode" {...register("transportMode")}>
              <option value="ROAD">ROAD</option>
              <option value="RAIL">RAIL</option>
              <option value="AIR">AIR</option>
            </OpsFieldSelect>
          </div>
          <div>
            <OpsFieldLabel htmlFor="m-departure">Departure Date (optional)</OpsFieldLabel>
            <OpsFieldInput id="m-departure" type="date" {...register("departureDate")} />
          </div>
          <div className="col-span-2">
            <OpsFieldLabel htmlFor="m-notes">Notes (optional)</OpsFieldLabel>
            <OpsFieldInput id="m-notes" placeholder="ROUTE NOTES / DRIVER / VEHICLE" {...register("notes")} />
          </div>
        </div>
      </OpsCard>

      <div className="border border-dashed border-paper-line bg-paper-2/40 p-4 font-paper-mono text-[length:var(--text-paper-12)] text-paper-fg-3">
        After creation, you can add shipments to the manifest from the detail page.
        Multi-step builder (scan AWB → review) lives at <span className="paper-id">/manifests/create</span> on the v6 flow until ported.
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-paper-line pt-4">
        <OpsButton type="reset" variant="ghost">Reset</OpsButton>
        <OpsButton type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? (
            <><RiLoaderLine aria-hidden className="size-3 animate-spin motion-reduce:animate-none" />Creating…</>
          ) : (
            <><RiAddLine aria-hidden className="size-3" />Create Manifest</>
          )}
        </OpsButton>
      </div>
    </form>
  )
}
