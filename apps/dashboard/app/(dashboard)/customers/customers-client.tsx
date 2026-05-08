"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCustomers, useCreateCustomer } from "@workspace/services/hooks/use-customers"
import { CustomerForm } from "@workspace/ui/components/composed/customers/customer-form"
import type { CustomerFormValues } from "@workspace/ui/components/composed/customers/customer-form"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"
import { RiAddLine, RiSearchLine } from "@workspace/ui/icons"
import { useNotificationStore } from "@workspace/services/stores/notification.store"
import { DataTable } from "@workspace/ui/components/composed/data-table"
import { columns } from "./columns"

export function CustomersClient() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [showForm, setShowForm] = React.useState(false)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const debouncedSearch = React.useDeferredValue(search)

  const { data: customers, isLoading } = useCustomers({ search: debouncedSearch || undefined })
  const createCustomer = useCreateCustomer()

  async function handleCreate(values: CustomerFormValues) {
    try {
      await createCustomer.mutateAsync({
        name: values.name,
        phone: values.phone,
        email: values.email || undefined,
        gstin: values.gstin || undefined,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2 || undefined,
        city: values.city,
        state: values.state,
        zip: values.zip,
      })
      addNotification({ type: "success", title: "Customer created", message: values.name })
      setShowForm(false)
    } catch (err) {
      addNotification({ type: "error", title: "Failed to create customer", message: String(err) })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        overline="Business"
        title="Customers"
        description={`${customers?.length ?? 0} total customer${(customers?.length ?? 0) === 1 ? "" : "s"}`}
        actions={
          <Button 
            size="sm" 
            onClick={() => setShowForm((v) => !v)}
            className="font-mono text-xs font-bold uppercase tracking-wider rounded-none"
          >
            <RiAddLine aria-hidden="true" className="mr-1.5" />
            <span className="hidden sm:inline">New Customer</span>
          </Button>
        }
      />

      {showForm && (
        <div className="mx-auto w-full max-w-3xl bg-card p-5 space-y-4 tac-fui-panel">
          <div className="flex items-baseline justify-between border-b border-border pb-2">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              New Customer
            </p>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="font-mono text-2xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
          <CustomerForm onSubmit={handleCreate} isLoading={createCustomer.isPending} />
        </div>
      )}

      <div className="relative tac-fui-panel p-1">
        <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH.DB(name, phone, email)..."
          className="w-full h-10 pl-10 pr-3 t-mono uppercase bg-transparent border-0 focus-visible:tac-focus-premium rounded-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-card animate-pulse tac-fui-panel" />
          ))}
        </div>
      ) : (
        <DataTable
          data={customers ?? []}
          columns={columns}
          searchKey="name"
          searchPlaceholder="Filter customers"
          onRowClick={(customer) => router.push(`/customers/${customer.id}`)}
        />
      )}
    </div>
  )
}
