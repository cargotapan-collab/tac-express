"use client"

import * as React from "react"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
} from "@workspace/ui/icons"

/**
 * Wizard — canonical multi-step indicator primitive for TAC Express.
 *
 * Replaces ad-hoc step indicators across:
 *   - composed/finance/wizard-stepper.tsx           (deleted in the same PR as this file)
 *   - composed/manifests/manifest-builder/wizard-stepper.tsx (pending migration)
 *   - composed/customers/customer-form.tsx · inline `Stepper` (pending extraction)
 *   - composed/shipments/create-shipment-form.tsx · inline `STEPS` (pending migration)
 *
 * Pairs with <WizardActions> for the canonical back/next/submit row.
 * The consumer owns step state — this primitive is presentational.
 *
 * Logistics best-practice defaults:
 *   - Click-back to completed steps via `onStepClick`. Operators backtrack
 *     constantly; this is industry standard (DHL MyDHL+, FedEx Ship Manager).
 *   - "Step N / M" overline gives explicit position context above each label.
 *   - aria-current="step" on the active step for assistive tech.
 *   - data-state on each step exposes done/active/pending for downstream styling.
 */

interface WizardStep {
  id: string
  label: string
  description?: string
  /** Optional icon rendered next to the label (e.g. RiUserLine for an "Identity" step). */
  icon?: React.ComponentType<{ className?: string }>
}

interface WizardProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "children"> {
  steps: WizardStep[]
  currentIndex: number
  /**
   * Called when the user clicks a step. Steps are clickable when `idx <= currentIndex`.
   * Omit to disable click-navigation entirely.
   */
  onStepClick?: (index: number) => void
}

function Wizard({
  steps,
  currentIndex,
  onStepClick,
  className,
  ...props
}: WizardProps) {
  const total = steps.length
  const clamped = Math.max(0, Math.min(currentIndex, total - 1))

  return (
    <ol
      data-slot="wizard"
      className={cn(
        "flex w-full overflow-hidden border border-border bg-card shadow-brutal-sm",
        className
      )}
      {...props}
    >
      {steps.map((step, idx) => {
        const isActive = idx === clamped
        const isCompleted = idx < clamped
        const clickable = typeof onStepClick === "function" && idx <= clamped
        const Icon = step.icon

        return (
          <li
            key={step.id}
            data-slot="wizard-step"
            data-state={isActive ? "active" : isCompleted ? "done" : "pending"}
            className={cn(
              "group/step relative min-w-0 flex-1 border-r border-border last:border-r-0",
              isActive && "bg-primary/5"
            )}
            aria-current={isActive ? "step" : undefined}
          >
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onStepClick?.(idx)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left",
                "transition-colors duration-[80ms] ease-linear",
                "focus:outline-none focus-visible:outline-1 focus-visible:outline-primary focus-visible:[outline-offset:-1px]",
                clickable ? "hover:bg-accent/50" : "cursor-default"
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center border font-mono text-xs font-semibold tabular-nums",
                  isCompleted && "border-primary bg-primary text-primary-foreground",
                  isActive && !isCompleted && "border-primary bg-card text-primary",
                  !isActive && !isCompleted && "border-border bg-card text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <RiCheckLine className="size-3.5" aria-hidden="true" />
                ) : (
                  idx + 1
                )}
              </span>

              <div className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    "font-mono text-2xs uppercase tracking-widest",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Step {idx + 1} / {total}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5 truncate font-sans text-sm font-medium",
                    isActive || isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {Icon ? <Icon className="size-3.5" /> : null}
                  {step.label}
                </span>
                {step.description ? (
                  <span className="mt-0.5 truncate font-sans text-2xs text-muted-foreground">
                    {step.description}
                  </span>
                ) : null}
              </div>
            </button>

            {isActive ? (
              <span
                aria-hidden="true"
                className="absolute right-0 bottom-0 left-0 h-0.5 bg-primary"
              />
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

interface WizardActionsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  currentIndex: number
  totalSteps: number
  /**
   * Consumer routes the back action. At step 0 the button is labelled "CANCEL"
   * — typically dismiss the wizard. At step > 0 it is labelled "← BACK"
   * — typically `onIndexChange(currentIndex - 1)`.
   */
  onBack: () => void
  /**
   * Consumer routes the forward action. At the final step the button is
   * labelled with `finalLabel` — typically `onSubmit()`. Otherwise "NEXT →"
   * — typically `onIndexChange(currentIndex + 1)`.
   */
  onNext: () => void
  isSubmitting?: boolean
  /** Override final-step detection. Otherwise `currentIndex === totalSteps - 1`. */
  isFinalStep?: boolean
  /** Final-step submit-button label. Default `"SUBMIT"`. Pass e.g. `"CREATE INVOICE"`. */
  finalLabel?: string
  /** Label shown while `isSubmitting` is true. Default `"SUBMITTING…"`. */
  submittingLabel?: string
  /** Show "Step N of M" between buttons. Default `true`. */
  showStepCounter?: boolean
  /** Disable the next/submit button regardless of submission state. */
  nextDisabled?: boolean
}

function WizardActions({
  currentIndex,
  totalSteps,
  onBack,
  onNext,
  isSubmitting = false,
  isFinalStep,
  finalLabel = "SUBMIT",
  submittingLabel = "SUBMITTING…",
  showStepCounter = true,
  nextDisabled = false,
  className,
  ...props
}: WizardActionsProps) {
  const final = isFinalStep ?? currentIndex === totalSteps - 1
  const isFirst = currentIndex === 0

  return (
    <div
      data-slot="wizard-actions"
      className={cn("flex items-center justify-between gap-3", className)}
      {...props}
    >
      <Button type="button" variant="outline" size="sm" onClick={onBack}>
        {!isFirst ? <RiArrowLeftLine aria-hidden="true" /> : null}
        <span className={cn("font-mono uppercase tracking-wider", !isFirst && "ml-1.5")}>
          {isFirst ? "CANCEL" : "BACK"}
        </span>
      </Button>

      {showStepCounter ? (
        <div
          data-slot="wizard-step-counter"
          aria-live="polite"
          className="font-mono text-2xs uppercase tracking-widest text-muted-foreground"
        >
          Step {currentIndex + 1} of {totalSteps}
        </div>
      ) : null}

      <Button
        type="button"
        size="sm"
        onClick={onNext}
        disabled={isSubmitting || nextDisabled}
      >
        <span className="mr-1.5 font-mono uppercase tracking-wider">
          {isSubmitting ? submittingLabel : final ? finalLabel : "NEXT"}
        </span>
        {final ? (
          <RiCheckLine aria-hidden="true" />
        ) : (
          <RiArrowRightLine aria-hidden="true" />
        )}
      </Button>
    </div>
  )
}

export { Wizard, WizardActions }
export type { WizardStep, WizardProps, WizardActionsProps }
