import * as React from "react"
import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  secondaryAction?: ReactNode
  className?: string
}

function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "tac-fui-panel relative flex flex-col items-center justify-center px-8 py-16 text-center",
        className,
      )}
    >
      {/* corner brackets */}
      <span aria-hidden className="pointer-events-none absolute top-2 left-2 size-3 border-t-2 border-l-2 border-primary/60" />
      <span aria-hidden className="pointer-events-none absolute top-2 right-2 size-3 border-t-2 border-r-2 border-primary/60" />
      <span aria-hidden className="pointer-events-none absolute bottom-2 left-2 size-3 border-b-2 border-l-2 border-primary/60" />
      <span aria-hidden className="pointer-events-none absolute bottom-2 right-2 size-3 border-b-2 border-r-2 border-primary/60" />

      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center border border-border bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <p className="tac-mono-label mb-1">No data</p>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

export { EmptyState }
