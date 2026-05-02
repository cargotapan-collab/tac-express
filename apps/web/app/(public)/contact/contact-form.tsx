"use client"

import * as React from "react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"
import { Textarea } from "@workspace/ui/components/primitives/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { RiSendPlaneLine } from "@workspace/ui/icons"

const REASONS = [
  { value: "sales", label: "Sales — pricing & onboarding" },
  { value: "support", label: "Support — existing shipment" },
  { value: "partner", label: "Partner program" },
  { value: "press", label: "Press / media" },
  { value: "other", label: "Other" },
] as const

export function ContactForm() {
  const [submitted, setSubmitted] = React.useState(false)
  const [reason, setReason] = React.useState<string>(REASONS[0].value)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    // Real implementation would post to /api/contact (TODO).
  }

  if (submitted) {
    return (
      <div className="tac-fui-panel border-l-4 border-l-accent-success p-8 text-center">
        <p className="tac-mono-label text-accent-success">Sent</p>
        <h2 className="mt-2 text-2xl font-bold">Thanks — we&apos;ll get back to you.</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sales replies within 4 hours during India business hours. Support replies within 1 hour.
        </p>
      </div>
    )
  }

  return (
    <form className="tac-fui-panel space-y-4 p-6" onSubmit={onSubmit}>
      <p className="border-b border-border pb-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Send us a note
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Your name" required>
          <Input name="name" required />
        </Field>
        <Field label="Work email" required>
          <Input name="email" type="email" required />
        </Field>
        <Field label="Company">
          <Input name="company" />
        </Field>
        <Field label="Reason">
          <Select name="reason" value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field label="Message" required>
        <Textarea name="message" rows={5} required />
      </Field>
      <div className="flex justify-end">
        <Button type="submit">
          <RiSendPlaneLine className="mr-2 size-4" aria-hidden="true" />
          Send message
        </Button>
      </div>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="space-y-1">
      <span className="block font-mono text-2xs uppercase tracking-wider text-muted-foreground">
        {label}{required && <span aria-hidden className="ml-0.5 text-accent-danger">*</span>}
      </span>
      {children}
    </label>
  )
}
