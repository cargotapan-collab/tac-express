"use client"

import * as React from "react"

import {
  useStaffList,
  useUpdateRole,
  useSetActiveStatus,
} from "@workspace/services/hooks/use-admin"
import {
  useHubs,
  useCreateHub,
  useUpdateHub,
  useToggleHubActive,
} from "@workspace/services/hooks/use-hubs"
import { useNotificationStore } from "@workspace/services/stores/notification.store"
import { UserRole, type HubInput } from "@workspace/types"

import { StaffTable } from "@workspace/ui/components/composed/admin/staff-table"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { PageShell } from "@workspace/ui/components/composed/page-shell"
import { HubsManager } from "@workspace/ui/components/composed/management/hubs-manager"
import { RolesMatrix } from "@workspace/ui/components/composed/management/roles-matrix"
import { StaffStats } from "@workspace/ui/components/composed/management/staff-stats"
import { Button } from "@workspace/ui/components/button"
import { EmptyState } from "@workspace/ui/components/primitives/empty-state"
import { Input } from "@workspace/ui/components/primitives/input"
import { Label } from "@workspace/ui/components/primitives/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/primitives/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/primitives/dialog"
import {
  RiTeamLine,
  RiBuilding4Line,
  RiCalculatorLine,
  RiShieldCheckLine,
  RiUserAddLine,
} from "@workspace/ui/icons"

export function ManagementClient() {
  const { data: staff, isLoading: staffLoading } = useStaffList()
  const updateRole = useUpdateRole()
  const setActiveStatus = useSetActiveStatus()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const { data: hubs = [], isLoading: hubsLoading } = useHubs(false)
  const createHub = useCreateHub()
  const updateHub = useUpdateHub()
  const toggleHubActive = useToggleHubActive()

  const [inviteOpen, setInviteOpen] = React.useState(false)

  function handleInvite(input: {
    email: string
    role: UserRole
    hubCode: string | null
  }) {
    // Email-based admin invitation requires Supabase's admin auth API which
    // needs a server-side service-role key; that wiring is being scoped in
    // a follow-up PR. The dialog already collects the right shape, so the
    // client integration becomes a one-line swap when the server action
    // lands. For now we surface an honest "captured, delivery pending"
    // notification rather than fake a success.
    addNotification({
      type: "info",
      title: "Invitation captured",
      message: `${input.email} · ${input.role}${
        input.hubCode ? ` · ${input.hubCode}` : ""
      }. Email delivery via the Supabase admin API is configured in a follow-up PR.`,
    })
    setInviteOpen(false)
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    try {
      await updateRole.mutateAsync({ userId, role })
      addNotification({ type: "success", title: "Role updated", message: role })
    } catch (err) {
      addNotification({
        type: "error",
        title: "Failed to update role",
        message: String(err),
      })
    }
  }

  async function handleToggleActive(userId: string, isActive: boolean) {
    try {
      await setActiveStatus.mutateAsync({ userId, isActive })
      addNotification({
        type: "success",
        title: isActive ? "User activated" : "User deactivated",
        message: userId,
      })
    } catch (err) {
      addNotification({ type: "error", title: "Failed", message: String(err) })
    }
  }

  async function handleCreateHub(input: HubInput) {
    try {
      await createHub.mutateAsync(input)
      addNotification({
        type: "success",
        title: "Hub created",
        message: `${input.code} · ${input.name}`,
      })
    } catch (err) {
      addNotification({
        type: "error",
        title: "Failed to create hub",
        message: String(err),
      })
    }
  }

  async function handleUpdateHub(id: string, patch: Partial<HubInput>) {
    try {
      await updateHub.mutateAsync({ id, patch })
      addNotification({
        type: "success",
        title: "Hub updated",
        message: patch.name ?? id,
      })
    } catch (err) {
      addNotification({
        type: "error",
        title: "Failed to update hub",
        message: String(err),
      })
    }
  }

  function handleToggleHubActive(id: string, isActive: boolean) {
    toggleHubActive.mutate(
      { id, isActive },
      {
        onSuccess: () => {
          addNotification({
            type: "success",
            title: isActive ? "Hub activated" : "Hub deactivated",
            message: id,
          })
        },
      }
    )
  }

  const hubOptions = React.useMemo(
    () =>
      hubs
        .filter((h) => h.isActive)
        .map((h) => ({ value: h.code, label: `${h.code} · ${h.name}` })),
    [hubs],
  )

  return (
    <PageShell>
      <PageHeader
        overline="Administration"
        title="Operations & Access"
        description="Staff, hubs, tariffs, and role-based permissions in one place."
        actions={
          <Button
            type="button"
            size="sm"
            onClick={() => setInviteOpen(true)}
          >
            <RiUserAddLine aria-hidden="true" />
            <span className="ml-1.5 font-mono uppercase tracking-wider">
              Invite staff
            </span>
          </Button>
        }
      />

      <Tabs defaultValue="staff">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="staff">
            <RiTeamLine />
            Staff
          </TabsTrigger>
          <TabsTrigger value="hubs">
            <RiBuilding4Line />
            Hubs
          </TabsTrigger>
          <TabsTrigger value="tariffs">
            <RiCalculatorLine />
            Tariffs
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <RiShieldCheckLine />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4 pt-4">
          <StaffStats staff={staff ?? []} />
          <StaffTable
            staff={staff ?? []}
            isLoading={staffLoading}
            onRoleChange={handleRoleChange}
            onToggleActive={handleToggleActive}
          />
        </TabsContent>

        <TabsContent value="hubs" className="pt-4">
          <HubsManager
            hubs={hubs}
            loading={hubsLoading}
            onCreate={handleCreateHub}
            onUpdate={handleUpdateHub}
            onToggleActive={handleToggleHubActive}
          />
        </TabsContent>

        <TabsContent value="tariffs" className="pt-4">
          <EmptyState
            icon={<RiCalculatorLine />}
            title="Tariffs & Rate Cards"
            description="Slab-based rate-card editor with peak/fuel/remote-area surcharges lights up in Phase 5.5."
          />
        </TabsContent>

        <TabsContent value="permissions" className="pt-4">
          <RolesMatrix />
        </TabsContent>
      </Tabs>

      <InviteStaffDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        hubOptions={hubOptions}
        onInvite={handleInvite}
      />
    </PageShell>
  )
}

/**
 * Invite-staff dialog — collects email, role, and optional hub code so a
 * privileged administrator can dispatch an account-creation invitation.
 *
 * The actual server-side delivery (Supabase admin API → email) needs a
 * service-role key configured server-side; that's a follow-up PR. The
 * dialog is fully wired to the captured-values shape so swapping in the
 * real action is a one-line change in handleInvite.
 */
interface InviteStaffDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hubOptions: { value: string; label: string }[]
  onInvite: (input: {
    email: string
    role: UserRole
    hubCode: string | null
  }) => void
}

function InviteStaffDialog({
  open,
  onOpenChange,
  hubOptions,
  onInvite,
}: InviteStaffDialogProps) {
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<UserRole>(UserRole.OPS)
  const [hubCode, setHubCode] = React.useState<string>("")

  React.useEffect(() => {
    if (!open) {
      // Reset on close so the next open starts fresh.
      setEmail("")
      setRole(UserRole.OPS)
      setHubCode("")
    }
  }, [open])

  const isValid = email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  function handleSubmit() {
    if (!isValid) return
    onInvite({
      email: email.trim(),
      role,
      hubCode: hubCode || null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 font-mono text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="h-9 w-full border border-border bg-background px-3 font-mono text-sm uppercase tracking-wider text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
              value={hubCode}
              onChange={(e) => setHubCode(e.target.value)}
              className="h-9 w-full border border-border bg-background px-3 font-mono text-sm uppercase tracking-wider text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
          <Button
            type="button"
            size="sm"
            disabled={!isValid}
            onClick={handleSubmit}
          >
            <RiUserAddLine aria-hidden="true" />
            <span className="ml-1.5 font-mono uppercase tracking-wider">
              Send invitation
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
