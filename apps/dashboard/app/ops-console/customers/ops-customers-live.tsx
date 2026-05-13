"use client"

import * as React from "react"

import { useCustomers } from "@workspace/services/hooks/use-customers"
import type { Customer } from "@workspace/types"
import {
  OpsCustomersView,
  type CustomerRow,
} from "@workspace/ui/components/composed/ops-console/pages"

function toRow(c: Customer): CustomerRow {
  return {
    id: c.id,
    name: c.name,
    email: c.email ?? "",
    phone: c.phone,
    location: c.city,
    state: c.state,
    gstin: c.gstin,
    shipments: c.totalShipments,
    revenue: `₹${c.totalRevenue.toLocaleString("en-IN")}`,
    outstanding: `₹${(c.totalRevenue - c.totalRevenue).toLocaleString("en-IN")}`,
  }
}

export function OpsCustomersLive() {
  const { data = [] } = useCustomers({})
  return <OpsCustomersView rows={data.map(toRow)} />
}
