"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import type { Density } from "@workspace/ui/lib/density"

interface DensityToggleProps {
  value: Density
  onChange: (value: Density) => void
  className?: string
}

/**
 * v6 — DensityToggle
 *
 * Radio-group control for the three density modes defined by `DensityProvider`
 * and wired through `[data-density]` cascade selectors in globals.css:
 * `compact` (tight) / `comfortable` (default) / `spacious` (relaxed).
 *
 * Single-letter labels match the brutalist mission-control aesthetic.
 */
const OPTIONS: { value: Density; label: string; description: string }[] = [
  { value: "compact", label: "C", description: "Compact density" },
  { value: "comfortable", label: "M", description: "Comfortable density" },
  { value: "spacious", label: "S", description: "Spacious density" },
]

function DensityToggle({ value, onChange, className }: DensityToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Interface density"
      data-slot="density-toggle"
      className={cn("inline-flex items-center border border-border bg-card", className)}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          aria-label={opt.description}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex size-7 items-center justify-center t-mono-sm tac-fui-hover focus-visible:outline-none focus-visible:tac-focus-premium",
            value === opt.value && "bg-primary text-primary-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export { DensityToggle }
