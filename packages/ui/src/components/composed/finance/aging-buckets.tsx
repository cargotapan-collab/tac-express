"use client"

import * as React from "react"
import { differenceInDays, parseISO } from "date-fns"

import { cn } from "@workspace/ui/lib/utils"
import type { Invoice } from "@workspace/types"

export interface AgingBucket {
  label: string
  /** Inclusive lower bound (in days past due). */
  minDays: number
  /** Inclusive upper bound (in days past due); use Infinity for the open-ended bucket. */
  maxDays: number
  count: number
  total: number
  tone: "ok" | "warning" | "danger" | "critical"
}

interface AgingBucketsProps {
  invoices: Invoice[]
  /** Locale for currency formatting. Defaults to en-IN with INR. */
  locale?: string
  currency?: string
  /** Optional click handler; receives the bucket so the consumer can apply
   * a list-page filter (e.g. setFilter({ aging: '31-60' })). */
  onSelect?: (bucket: AgingBucket) => void
  className?: string
}

const BUCKET_DEFS: Pick<AgingBucket, "label" | "minDays" | "maxDays" | "tone">[] = [
  { label: "Current", minDays: -Infinity, maxDays: 0, tone: "ok" },
  { label: "0-30", minDays: 1, maxDays: 30, tone: "warning" },
  { label: "31-60", minDays: 31, maxDays: 60, tone: "warning" },
  { label: "61-90", minDays: 61, maxDays: 90, tone: "danger" },
  { label: "90+", minDays: 91, maxDays: Infinity, tone: "critical" },
]

export function computeAging(invoices: Invoice[]): AgingBucket[] {
  const now = new Date()
  const buckets: AgingBucket[] = BUCKET_DEFS.map((d) => ({
    ...d,
    count: 0,
    total: 0,
  }))

  for (const inv of invoices) {
    if (inv.status === "PAID" || inv.status === "CANCELLED") continue
    const due = inv.dueDate ? parseISO(inv.dueDate) : parseISO(inv.createdAt)
    const daysPastDue = differenceInDays(now, due)
    const bucket = buckets.find(
      (b) => daysPastDue >= b.minDays && daysPastDue <= b.maxDays
    )
    if (bucket) {
      bucket.count += 1
      bucket.total += inv.balance ?? inv.totalAmount ?? 0
    }
  }
  return buckets
}

export function AgingBuckets({
  invoices,
  locale = "en-IN",
  currency = "INR",
  onSelect,
  className,
}: AgingBucketsProps) {
  const buckets = React.useMemo(() => computeAging(invoices), [invoices])
  const totalOutstanding = buckets
    .filter((b) => b.label !== "Current")
    .reduce((s, b) => s + b.total, 0)

  const fmt = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }),
    [locale, currency]
  )

  return (
    <section
      data-slot="aging-buckets"
      className={cn("space-y-3", className)}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Receivables aging
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Outstanding{" "}
          <span className="font-heading text-base font-semibold text-foreground">
            {fmt.format(totalOutstanding)}
          </span>
        </p>
      </header>

      <dl className="grid grid-cols-2 gap-px bg-border/40 lg:grid-cols-5">
        {buckets.map((b) => (
          <BucketTile
            key={b.label}
            bucket={b}
            fmt={fmt}
            onSelect={onSelect ? () => onSelect(b) : undefined}
          />
        ))}
      </dl>
    </section>
  )
}

function BucketTile({
  bucket,
  fmt,
  onSelect,
}: {
  bucket: AgingBucket
  fmt: Intl.NumberFormat
  onSelect?: () => void
}) {
  const Inner = (
    <div
      className={cn(
        "flex h-full flex-col gap-1 bg-background p-4 transition-colors",
        onSelect && "cursor-pointer hover:bg-muted/40",
        bucket.tone === "warning" && "border-l-2 border-l-status-warning/30",
        bucket.tone === "danger" && "border-l-2 border-l-destructive/40",
        bucket.tone === "critical" && "border-l-2 border-l-destructive"
      )}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {bucket.label} {bucket.label !== "Current" ? "days" : ""}
      </p>
      <p
        className={cn(
          "mt-0.5 font-heading text-lg font-semibold tracking-tight",
          bucket.tone === "warning" && "text-status-warning",
          bucket.tone === "danger" && "text-destructive",
          bucket.tone === "critical" && "text-destructive font-black"
        )}
      >
        {fmt.format(bucket.total)}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {bucket.count} invoice{bucket.count === 1 ? "" : "s"}
      </p>
    </div>
  )

  return onSelect ? (
    <button
      type="button"
      onClick={onSelect}
      className="text-left"
      aria-label={`Filter to ${bucket.label} aging bucket`}
    >
      {Inner}
    </button>
  ) : (
    <div>{Inner}</div>
  )
}
