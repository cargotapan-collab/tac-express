import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface GridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Column count for vertical lines (default: 4 = 25% each) */
  columns?: number
  /** Mask type to fade edges (default: "linear") */
  mask?: "linear" | "radial" | "none"
}

/**
 * GridBackground — CSS linear-gradient grid lines with edge mask.
 * Uses semantic `--color-border` tokens. RSC-compatible.
 */
export function GridBackground({ columns = 4, mask = "linear", className, ...props }: GridBackgroundProps) {
  const pct = `${100 / columns}%`
  const maskStyle = mask === "none"
    ? ""
    : mask === "radial" 
      ? "[mask-image:radial-gradient(circle_at_center,black_50%,transparent_100%)]"
      : "[mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]"
  return (
    <div
      className={cn("absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40", className)}
      aria-hidden="true"
      {...props}
    >
      <div
        className={cn("absolute inset-0 max-w-7xl mx-auto h-full", maskStyle)}
        style={{
          backgroundImage: `linear-gradient(to right, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: `${pct} 100%`,
        }}
      />
    </div>
  )
}
