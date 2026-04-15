import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface SectionDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Divider style — all straight lines, no curves */
  variant?: "line" | "dashed" | "gradient-fade" | "double"
  /** Accent with primary color */
  accent?: boolean
}

/**
 * SectionDivider — straight-line section separator variants.
 * NO curves (project rules). All use semantic tokens.
 */
export function SectionDivider({
  variant = "line",
  accent = false,
  className,
  ...props
}: SectionDividerProps) {
  const colorClass = accent ? "border-foreground bg-foreground" : "border-border bg-border"

  switch (variant) {
    case "dashed":
      return (
        <div
          className={cn("w-full", className)}
          aria-hidden="true"
          {...props}
        >
          <div className={cn(
            "max-w-7xl mx-auto border-t border-dashed",
            accent ? "border-foreground" : "border-border"
          )} />
        </div>
      )

    case "gradient-fade":
      return (
        <div
          className={cn("w-full h-px", className)}
          aria-hidden="true"
          {...props}
        >
          <div className={cn(
            "h-full w-full bg-gradient-to-r from-transparent via-current to-transparent",
            accent ? "text-foreground/50" : "text-border"
          )} />
        </div>
      )

    case "double":
      return (
        <div
          className={cn("w-full flex flex-col gap-1", className)}
          aria-hidden="true"
          {...props}
        >
          <div className={cn("h-px w-full", colorClass)} />
          <div className={cn("h-px w-full opacity-40", colorClass)} />
        </div>
      )

    case "line":
    default:
      return (
        <div
          className={cn("w-full", className)}
          aria-hidden="true"
          {...props}
        >
          <div className={cn(
            "max-w-7xl mx-auto border-t",
            accent ? "border-foreground" : "border-border"
          )} />
        </div>
      )
  }
}
