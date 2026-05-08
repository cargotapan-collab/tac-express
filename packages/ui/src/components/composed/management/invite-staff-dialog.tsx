"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/primitives/dialog"
import { Input } from "@workspace/ui/components/primitives/input"
import { Label } from "@workspace/ui/components/primitives/label"
import { RiUserAddLine } from "@workspace/ui/icons"
import { UserRole } from "@workspace/types"

/**
 * InviteStaffDialog — captures email + role + optional hub for an
 * account-creation invitation. Form is wired via react-hook-form +
 * zodResolver per the project's tac-forms convention (mirrors
 * customer-form, shipment-form, sign-in-form patterns).
 *
 * Server-side delivery (Supabase admin invite-by-email) needs a
 * service-role key configured server-side. The dialog is fully
 * shape-correct so the consumer can swap a real action into onInvite
 * once the server-side wiring lands.
 */

const inviteStaffSchema = z.object({
  email: z.string().email("Valid email required"),
  role: z.nativeEnum(UserRole),
  // Empty string in the form maps to null (no default hub) on submit.
  hubCode: z.string(),
})

type InviteStaffFormValues = z.infer<typeof inviteStaffSchema>

export interface InviteStaffValues {
  email: string
  role: UserRole
  hubCode: string | null
}

interface InviteStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hubOptions: { value: string; label: string }[]
  onInvite: (values: InviteStaffValues) => void | Promise<void>
}

const SELECT_CLASS =
  "h-9 w-full border border-border bg-background px-3 font-mono text-sm uppercase tracking-wider text-foreground focus:outline-none focus:ring-1 focus:ring-ring"

export function InviteStaffDialog({
  open,
  onOpenChange,
  hubOptions,
  onInvite,
}: InviteStaffDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<InviteStaffFormValues>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: { email: "", role: UserRole.OPS, hubCode: "" },
    mode: "onChange",
  })

  React.useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  async function onSubmit(values: InviteStaffFormValues) {
    await onInvite({
      email: values.email.trim(),
      role: values.role,
      hubCode: values.hubCode || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Invite staff</DialogTitle>
            <DialogDescription>
              Send an account-creation link to a teammate. They&apos;ll set
              their own password on first sign-in.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                autoFocus
                autoComplete="email"
                placeholder="teammate@tacexpress.in"
                {...register("email")}
                className="h-9 font-mono text-sm"
                aria-invalid={Boolean(errors.email) || undefined}
              />
              {errors.email ? (
                <p className="font-mono text-2xs text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                {...register("role")}
                className={SELECT_CLASS}
              >
                {Object.values(UserRole).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-hub">Hub (optional)</Label>
              <select
                id="invite-hub"
                {...register("hubCode")}
                className={SELECT_CLASS}
              >
                <option value="">— No default hub —</option>
                {hubOptions.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <span className="font-mono uppercase tracking-wider">Cancel</span>
            </Button>
            <Button type="submit" size="sm" disabled={!isValid || isSubmitting}>
              <RiUserAddLine aria-hidden="true" />
              <span className="ml-1.5 font-mono uppercase tracking-wider">
                {isSubmitting ? "Sending…" : "Send invitation"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
