"use client"

import * as React from "react"

import { RiUserAddLine } from "@workspace/ui/icons"
import { OpsFrame } from "../ops-frame"
import { OpsPageHead } from "../ops-page-head"
import { OpsButton } from "../ops-button"
import { OpsBadge } from "../ops-badge"
import { OpsCard } from "../ops-card"
import { OpsTabs } from "../ops-tabs"
import { OpsFieldSelect } from "../ops-field"
import {
  OpsTable,
  OpsTableHead,
  OpsTableBody,
  OpsTableRow,
  OpsTableHeader,
  OpsTableCell,
} from "../ops-table"

interface StaffRow {
  name: string
  email: string
  role: "SUPER_ADMIN" | "OPERATOR"
  hub?: string
  active: boolean
}

interface OpsManagementViewProps {
  totalStaff: number
  active: number
  inactive: number
  hubsCovered: number
  staff: StaffRow[]
}

const TABS = ["Staff", "Hubs", "Tariffs", "Permissions"] as const

function OpsManagementView({
  totalStaff,
  active,
  inactive,
  hubsCovered,
  staff,
}: OpsManagementViewProps) {
  const [tab, setTab] = React.useState<string>("Staff")
  const stats: Array<[label: string, value: number]> = [
    ["Total Staff", totalStaff],
    ["Active", active],
    ["Inactive", inactive],
    ["Hubs Covered", hubsCovered],
  ]

  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Administration"
        title="Operations & Access"
        sub="Staff, hubs, tariffs, and role-based permissions in one place."
        actions={
          <OpsButton variant="primary">
            <RiUserAddLine aria-hidden className="size-3" />
            Invite Staff
          </OpsButton>
        }
      />
      <OpsTabs items={[...TABS]} value={tab} onChange={setTab} />

      <div className="grid grid-cols-4 gap-4 mb-4">
        {stats.map(([label, value]) => (
          <OpsCard key={label}>
            <div className="paper-label">{label}</div>
            <div className="paper-stat-value mt-2">{value}</div>
          </OpsCard>
        ))}
      </div>

      <OpsTable>
        <OpsTableHead>
          <tr>
            <OpsTableHeader>Name</OpsTableHeader>
            <OpsTableHeader>Email</OpsTableHeader>
            <OpsTableHeader>Role</OpsTableHeader>
            <OpsTableHeader>Hub</OpsTableHeader>
            <OpsTableHeader>Status</OpsTableHeader>
          </tr>
        </OpsTableHead>
        <OpsTableBody>
          {staff.map((s) => (
            <OpsTableRow key={s.email}>
              <OpsTableCell mono className="font-bold uppercase">
                {s.name}
              </OpsTableCell>
              <OpsTableCell mono>{s.email}</OpsTableCell>
              <OpsTableCell>
                <OpsFieldSelect
                  defaultValue={s.role}
                  aria-label={`Role for ${s.name}`}
                  className="w-40 py-1.5 px-2.5"
                >
                  <option>SUPER_ADMIN</option>
                  <option>OPERATOR</option>
                </OpsFieldSelect>
              </OpsTableCell>
              <OpsTableCell mono muted>
                {s.hub ?? "—"}
              </OpsTableCell>
              <OpsTableCell>
                <OpsBadge tone={s.active ? "violet" : "neutral"}>
                  {s.active ? "Active" : "Inactive"}
                </OpsBadge>
              </OpsTableCell>
            </OpsTableRow>
          ))}
        </OpsTableBody>
      </OpsTable>
    </OpsFrame>
  )
}

export { OpsManagementView }
export type { OpsManagementViewProps, StaffRow }
