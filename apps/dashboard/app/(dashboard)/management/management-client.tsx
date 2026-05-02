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
import type { UserRole, HubInput } from "@workspace/types"

import { StaffTable } from "@workspace/ui/components/composed/admin/staff-table"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { HubsManager } from "@workspace/ui/components/composed/management/hubs-manager"
import { RolesMatrix } from "@workspace/ui/components/composed/management/roles-matrix"
import { EmptyState } from "@workspace/ui/components/primitives/empty-state"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/primitives/tabs"
import {
  RiTeamLine,
  RiBuilding4Line,
  RiCalculatorLine,
  RiShieldCheckLine,
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

  return (
    <div className="space-y-6">
      <PageHeader
        overline="Administration"
        title="Operations & Access"
        description="Staff, hubs, tariffs, and role-based permissions in one place."
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

        <TabsContent value="staff" className="pt-4">
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
    </div>
  )
}
