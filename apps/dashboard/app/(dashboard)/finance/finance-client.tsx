"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useInvoices } from "@workspace/services/hooks/use-invoices"
import { InvoiceStatusBadge } from "@workspace/ui/components/composed/finance/invoice-status-badge"
import { AgingBuckets } from "@workspace/ui/components/composed/finance/aging-buckets"
import { Button } from "@workspace/ui/components/button"
import { RiAddLine } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { InvoiceStatus, Invoice } from "@workspace/types"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/primitives/table"

const STATUS_FILTERS: InvoiceStatus[] = [
  InvoiceStatus.DRAFT,
  InvoiceStatus.ISSUED,
  InvoiceStatus.PAID,
  InvoiceStatus.OVERDUE,
]

export function FinanceClient() {
  const router = useRouter()
  const [activeStatus, setActiveStatus] = React.useState<InvoiceStatus | undefined>()
  const [activeBucket, setActiveBucket] = React.useState<string | undefined>()

  const { data, isLoading, error } = useInvoices(activeStatus ? { status: [activeStatus] } : {})

  const { data: allInvoices } = useInvoices({})

  const columns = React.useMemo<ColumnDef<Invoice>[]>(() => [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {row.original.invoiceNumber}
        </span>
      ),
    },
    {
      accessorKey: "awbNumber",
      header: "AWB",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.awbNumber ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <span className="font-mono text-xs uppercase tracking-wider text-foreground">
          {row.original.customerName}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <InvoiceStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => {
        const inv = row.original
        return (
          <span className={cn("font-mono text-xs", inv.status === "OVERDUE" ? "text-destructive font-semibold" : "text-foreground")}>
            ₹{inv.totalAmount?.toLocaleString() ?? "—"}
          </span>
        )
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.dueDate
            ? new Date(row.original.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
            : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/finance/${row.original.id}`)}
            className="font-mono text-2xs uppercase tracking-wider h-7 px-2"
          >
            View
          </Button>
        </div>
      ),
    },
  ], [router])

  // TanStack Table's useReactTable() returns row-model methods that close
  // over the data ref. React Compiler skips memoizing this hook by design;
  // values used downstream (table.getRowModel(), etc.) are read fresh on
  // every render anyway, so the skip is correct and safe.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      {allInvoices && allInvoices.length > 0 && (
        <AgingBuckets
          invoices={allInvoices}
          activeLabel={activeBucket}
          onSelect={(b) => {
            const same = activeBucket === b.label
            if (same) {
              setActiveBucket(undefined)
              setActiveStatus(undefined)
              return
            }
            setActiveBucket(b.label)
            setActiveStatus(b.label === "Current" ? InvoiceStatus.ISSUED : InvoiceStatus.OVERDUE)
          }}
        />
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant={!activeStatus ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveStatus(undefined)
                setActiveBucket(undefined)
              }}
              className="h-7 px-3 font-mono text-2xs uppercase tracking-wider"
            >
              All
            </Button>
            {STATUS_FILTERS.map((s) => (
              <Button
                key={s}
                variant={activeStatus === s ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActiveStatus(s === activeStatus ? undefined : s)
                  setActiveBucket(undefined)
                }}
                className="h-7 px-3 font-mono text-2xs uppercase tracking-wider"
              >
                {s}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => router.push("/finance/create")}
            className="font-mono text-xs font-bold uppercase tracking-wider"
          >
            <RiAddLine className="h-3.5 w-3.5 mr-1" />
            New Invoice
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted/30 animate-pulse tac-fui-panel" />
            ))}
          </div>
        )}

        {error && (
          <div className="border-destructive/30 bg-destructive/5 px-4 py-3 tac-fui-border">
            <p className="font-mono text-xs text-destructive">Failed to load invoices</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="tac-fui-panel overflow-hidden @container" data-density="compact">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <p className="font-mono text-2xs uppercase tracking-widest text-muted-foreground">No invoices found.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
