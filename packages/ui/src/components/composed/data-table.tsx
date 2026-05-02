"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { cn } from "@workspace/ui/lib/utils"
import { RiArrowUpLine, RiArrowDownLine, RiArrowLeftSLine, RiArrowRightSLine } from "@workspace/ui/icons"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  pageSize?: number
}

function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pageSize = 20,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
    initialState: { pagination: { pageSize } },
  })

  return (
    <div data-slot="data-table" className="space-y-3">
      {searchKey && (
        <div className="flex items-center gap-2">
          <label htmlFor="data-table-search" className="sr-only">
            {searchPlaceholder}
          </label>
          <input
            id="data-table-search"
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
            className={cn(
              "h-8 w-64 border border-border bg-background px-3 text-xs font-mono uppercase tracking-wider",
              "placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            )}
          />
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {table.getFilteredRowModel().rows.length} result
            {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <div className="tac-fui-border overflow-hidden">
        <table aria-label="Data table" className="w-full caption-bottom text-sm font-mono">
          <thead className="border-b border-border bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                  <th
                    key={header.id}
                    aria-sort={
                      !header.column.getCanSort()
                        ? undefined
                        : sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                        ? "descending"
                        : "none"
                    }
                    className={cn(
                      "h-9 px-3 text-left font-mono text-2xs uppercase tracking-wider text-muted-foreground",
                      header.column.getCanSort() && "cursor-pointer select-none hover:text-foreground"
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {sorted === "asc" && <RiArrowUpLine className="h-3 w-3" aria-hidden="true" />}
                      {sorted === "desc" && <RiArrowDownLine className="h-3 w-3" aria-hidden="true" />}
                    </span>
                  </th>
                )})}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  // v6: surface-hover row tint + 2px primary edge on selection
                  className={cn(
                    "bg-card transition-[background-color,border-color] duration-[80ms] ease-linear",
                    "hover:bg-surface-hover",
                    "data-[state=selected]:bg-primary-subtle data-[state=selected]:border-l-2 data-[state=selected]:border-l-primary",
                  )}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  aria-selected={row.getIsSelected() ? true : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <div className="flex items-center gap-1">
          <button
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="flex h-7 w-7 items-center justify-center border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RiArrowLeftSLine className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            aria-label="Next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="flex h-7 w-7 items-center justify-center border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RiArrowRightSLine className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

export { DataTable }
export type { DataTableProps }
