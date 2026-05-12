"use client"

import * as React from "react"
import Link from "next/link"

import { RiAddLine, RiSearchLine } from "@workspace/ui/icons"
import { OpsFrame } from "../ops-frame"
import { OpsPageHead } from "../ops-page-head"
import { OpsButton } from "../ops-button"
import { OpsFieldInput } from "../ops-field"
import {
  OpsTable,
  OpsTableHead,
  OpsTableBody,
  OpsTableRow,
  OpsTableHeader,
  OpsTableCell,
} from "../ops-table"

interface CustomerRow {
  name: string
  email: string
  phone: string
  location: string
  state: string
  gstin?: string
  shipments: number
  revenue: string
  outstanding: string
}

interface OpsCustomersViewProps {
  rows: CustomerRow[]
}

function OpsCustomersView({ rows }: OpsCustomersViewProps) {
  const [query, setQuery] = React.useState("")
  const filtered = rows.filter((r) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return (
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.includes(q)
    )
  })

  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Business"
        title="Customers"
        sub={`${rows.length} total customers`}
        actions={
          // Points at the v6 customers list which hosts the create dialog
          // (with GSTIN validation + statement download). The paper variant
          // at /ops-console/customers/create is a simplified preview.
          <OpsButton asChild variant="primary">
            <Link href="/customers">
              <RiAddLine aria-hidden className="size-3" />
              New Customer
            </Link>
          </OpsButton>
        }
      />
      <div className="relative mb-3.5 max-w-xl">
        <RiSearchLine
          aria-hidden
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-paper-fg-4"
        />
        <OpsFieldInput
          aria-label="Search customers"
          placeholder="SEARCH.DB(NAME, PHONE, EMAIL)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex items-center justify-between mb-3.5">
        <OpsButton>Filter Customers</OpsButton>
        <span className="paper-label">{filtered.length} results</span>
      </div>
      <OpsTable>
        <OpsTableHead>
          <tr>
            <OpsTableHeader>Name</OpsTableHeader>
            <OpsTableHeader>Phone</OpsTableHeader>
            <OpsTableHeader>Location</OpsTableHeader>
            <OpsTableHeader>GSTIN</OpsTableHeader>
            <OpsTableHeader>Shipments</OpsTableHeader>
            <OpsTableHeader>Revenue</OpsTableHeader>
            <OpsTableHeader>Outstanding</OpsTableHeader>
          </tr>
        </OpsTableHead>
        <OpsTableBody>
          {filtered.map((r) => (
            <OpsTableRow key={r.email}>
              <OpsTableCell>
                <div className="font-paper-mono font-semibold uppercase text-[length:var(--text-paper-12)]">
                  {r.name}
                </div>
                <div className="font-paper-mono text-paper-fg-3 text-[length:var(--text-paper-11)]">
                  {r.email}
                </div>
              </OpsTableCell>
              <OpsTableCell mono>{r.phone}</OpsTableCell>
              <OpsTableCell>
                <div>{r.location}</div>
                <div className="font-paper-mono text-paper-fg-3 text-[length:var(--text-paper-11)]">
                  {r.state}
                </div>
              </OpsTableCell>
              <OpsTableCell mono muted>
                {r.gstin ?? "—"}
              </OpsTableCell>
              <OpsTableCell mono>{r.shipments}</OpsTableCell>
              <OpsTableCell mono>{r.revenue}</OpsTableCell>
              <OpsTableCell mono>{r.outstanding}</OpsTableCell>
            </OpsTableRow>
          ))}
        </OpsTableBody>
      </OpsTable>
    </OpsFrame>
  )
}

export { OpsCustomersView }
export type { OpsCustomersViewProps, CustomerRow }
