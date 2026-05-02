"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

interface WizardStepperProps {
  steps: { id: string; label: string }[]
  current: number
  className?: string
}

export function WizardStepper({
  steps,
  current,
  className,
}: WizardStepperProps) {
  return (
    <nav
      aria-label="Wizard progress"
      data-slot="wizard-stepper"
      className={cn("flex items-center gap-px", className)}
    >
      {steps.map((step, i) => {
        const state =
          i < current ? "done" : i === current ? "active" : "pending"
        return (
          <React.Fragment key={step.id}>
            <div
              data-state={state}
              className={cn(
                "flex flex-1 items-center gap-2 border border-border bg-background px-3 py-2 transition-colors",
                state === "active" &&
                  "border-primary bg-primary/5 text-primary",
                state === "done" && "border-border bg-muted/40 text-foreground",
                state === "pending" && "text-muted-foreground"
              )}
              aria-current={state === "active" ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center border border-current font-mono text-[10px] font-semibold",
                  state === "active" && "bg-primary text-primary-foreground",
                  state === "done" && "bg-foreground text-background"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest">
                {step.label}
              </span>
            </div>
          </React.Fragment>
        )
      })}
    </nav>
  )
}
