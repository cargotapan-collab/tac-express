"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { RiCheckLine } from "@workspace/ui/icons"

export interface WizardStep {
  id: string
  label: string
  description?: string
}

interface WizardStepperProps {
  steps: WizardStep[]
  currentIndex: number
  onStepClick?: (index: number) => void
  className?: string
}

function WizardStepper({ steps, currentIndex, onStepClick, className }: WizardStepperProps) {
  return (
    <ol
      data-slot="wizard-stepper"
      className={cn(
        "flex w-full border border-border bg-card shadow-brutal-sm overflow-hidden",
        className
      )}
    >
      {steps.map((step, idx) => {
        const isActive = idx === currentIndex
        const isCompleted = idx < currentIndex
        const clickable = typeof onStepClick === "function" && idx <= currentIndex

        return (
          <li
            key={step.id}
            data-slot="wizard-step"
            className={cn(
              "group/step flex-1 relative border-r border-border last:border-r-0",
              isActive ? "bg-primary/5" : undefined
            )}
            aria-current={isActive ? "step" : undefined}
          >
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(idx)}
              className={cn(
                "w-full text-left px-4 py-3 flex items-center gap-3 transition-colors",
                clickable ? "hover:bg-accent/50" : "cursor-default",
                isActive && "bg-primary/5"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-xs font-semibold tabular-nums",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                      ? "border-primary text-primary bg-card"
                      : "border-border text-muted-foreground bg-card"
                )}
              >
                {isCompleted ? <RiCheckLine className="h-3.5 w-3.5" aria-hidden="true" /> : idx + 1}
              </span>
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    "font-mono text-2xs uppercase tracking-widest",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Step {idx + 1}
                </span>
                <span
                  className={cn(
                    "font-sans text-sm font-medium truncate",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
            </button>
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { WizardStepper }
