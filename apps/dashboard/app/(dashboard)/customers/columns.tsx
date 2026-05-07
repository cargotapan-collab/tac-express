"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Customer } from "@workspace/types"
import { cn } from "@workspace/ui/lib/utils"

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const c = row.original
      return (
        <div className="min-w-0 flex flex-col gap-0.5">
          <span className="t-mono uppercase text-foreground truncate">
            {c.name}
          </span>
          {c.email ? (
            <span className="t-mono-sm text-muted-foreground truncate">{c.email}</span>
          ) : (
            <span className="t-mono-sm text-muted-foreground @md:hidden truncate">
              {[c.city, c.state].filter(Boolean).join(" · ") || "—"}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => {
      return (
        <span className="t-mono text-foreground whitespace-nowrap">
          {row.getValue("phone")}
        </span>
      )
    },
  },
  {
    id: "location",
    header: () => <span className="hidden @md:inline">Location</span>,
    cell: ({ row }) => {
      const c = row.original
      return (
        <span className="hidden @md:flex flex-col gap-0.5 whitespace-nowrap">
          <span className="t-mono text-foreground">{c.city || "—"}</span>
          {c.state && (
            <span className="t-mono-sm text-muted-foreground">{c.state}</span>
          )}
        </span>
      )
    },
  },
  {
    accessorKey: "gstin",
    header: () => <span className="hidden @lg:inline">GSTIN</span>,
    cell: ({ row }) => {
      const gstin = row.getValue("gstin") as string | undefined
      return (
        <span
          className={cn(
            "hidden @lg:inline t-mono whitespace-nowrap",
            gstin ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {gstin || "—"}
        </span>
      )
    },
  },
  {
    accessorKey: "totalShipments",
    header: () => <div className="text-right">Shipments</div>,
    cell: ({ row }) => {
      const total = row.getValue("totalShipments") as number
      return (
        <div
          className={cn(
            "t-mono text-right",
            total === 0 ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {total}
        </div>
      )
    },
  },
  {
    accessorKey: "totalRevenue",
    header: () => <div className="hidden @lg:block text-right">Revenue</div>,
    cell: ({ row }) => {
      const revenue = row.getValue("totalRevenue") as number
      return (
        <div
          className={cn(
            "hidden @lg:block t-mono text-right",
            revenue > 0 ? "text-foreground" : "text-muted-foreground"
          )}
        >
          ₹{revenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </div>
      )
    },
  },
  {
    accessorKey: "outstandingBalance",
    header: () => <div className="text-right">Outstanding</div>,
    cell: ({ row }) => {
      const balance = row.getValue("outstandingBalance") as number
      return (
        <div
          className={cn(
            "t-mono text-right whitespace-nowrap",
            balance > 0
              ? "text-accent-warning"
              : "text-muted-foreground"
          )}
        >
          ₹{balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </div>
      )
    },
  },
]
