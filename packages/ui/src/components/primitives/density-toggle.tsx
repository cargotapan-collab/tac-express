"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

export type Density = "compact" | "default" | "comfortable"

interface DensityToggleProps {
  value: Density
  onChange: (value: Density) => void
  className?: string
}

const OPTIONS: { value: Density; label: string }[] = [
  { value: "compact", label: "C" },
  { value: "default", label: "D" },
  { value: "comfortable", label: "F" },
]

function DensityToggle({ value, onChange, className }: DensityToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Table density"
      data-slot="density-toggle"
      className={cn("inline-flex items-center border border-border bg-card", className)}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          aria-label={`Density: ${opt.value}`}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex size-7 items-center justify-center font-mono text-xs tac-fui-hover",
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
