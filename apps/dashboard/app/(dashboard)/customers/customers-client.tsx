"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useCustomers, useCreateCustomer } from "@workspace/services/hooks/use-customers"
import { CustomerForm } from "@workspace/ui/components/composed/customers/customer-form"
import type { CustomerFormValues } from "@workspace/ui/components/composed/customers/customer-form"
import { PageHeader } from "@workspace/ui/components/composed/page-header"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"
import { RiAddLine, RiSearchLine, RiUserLine } from "@workspace/ui/icons"
import { cn } from "@workspace/ui/lib/utils"
import { useNotificationStore } from "@workspace/services/stores/notification.store"

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
            className="font-mono text-[10px] tracking-widest uppercase tac-fui-hover rounded-none"
          >
            <RiAddLine aria-hidden="true" className="mr-1.5" />
            <span className="hidden sm:inline">New Customer</span>
          </Button>
        }
      />

      {showForm && (
        <div className="bg-card p-5 space-y-3 tac-fui-panel">
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
            New Customer
          </p>
          <CustomerForm onSubmit={handleCreate} isLoading={createCustomer.isPending} />
        </div>
      )}

      <div className="relative">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH.DB(name, phone, email)..."
          className="w-full h-10 pl-9 pr-3 font-mono text-xs uppercase bg-card border-primary/30 rounded-none focus-visible:ring-primary focus-visible:border-primary tac-fui-border"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-card animate-pulse tac-fui-panel" />
          ))}
        </div>
      ) : customers?.length === 0 ? (
        <div className="border-dashed h-40 flex flex-col items-center justify-center gap-2 tac-fui-border">
          <RiUserLine className="h-8 w-8 text-muted-foreground/30" />
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">No customers found</p>
        </div>
      ) : (
        <div className="tac-fui-border overflow-hidden">
          <div className="bg-muted/50 grid grid-cols-[1fr_auto_auto_auto_auto] px-3 py-2 gap-4">
            {["Name", "Phone", "City", "Shipments", "Outstanding"].map((h) => (
              <span key={h} className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">{h}</span>
            ))}
          </div>
          <div className="divide-y divide-border">
            {customers?.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/customers/${c.id}`)}
                className="w-full grid grid-cols-[1fr_auto_auto_auto_auto] px-3 py-3 gap-4 items-center text-left hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="font-mono text-sm uppercase tracking-wider text-foreground">{c.name}</p>
                  {c.email && <p className="font-mono text-2xs text-muted-foreground">{c.email}</p>}
                </div>
                <span className="font-mono text-xs text-foreground">{c.phone}</span>
                <span className="font-mono text-xs text-muted-foreground">{c.city}</span>
                <span className={cn("font-mono text-xs text-foreground text-right", c.totalShipments === 0 && "text-muted-foreground")}>
                  {c.totalShipments}
                </span>
                <span className={cn("font-mono text-xs text-right", c.outstandingBalance > 0 ? "text-accent-warning font-semibold" : "text-muted-foreground")}>
                  ₹{c.outstandingBalance.toLocaleString("en-IN")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
