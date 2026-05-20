"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"
import { Icon } from "@workspace/ui/icons"

/**
 * <AwbInput> — the shared AWB / cargo-ID entry control.
 *
 * Extracted (WS-3 PR-WS-3b) as the SECOND consumer of the hero's
 * tracking-input pattern appeared — the <TrackingResultDialog> retry
 * field — per the playbook § 4 "extract on the second consumer" rule.
 *
 * Two sizes:
 *   - "hero"    — the landing hero's primary control. Tall (h-14), the
 *                 STANDBY status chip, the LOCATE submit button.
 *   - "default" — the dialog retry field. Compact (h-11), icon-only
 *                 submit, no status chip.
 *
 * Controlled component: the consumer owns `value` + `onChange`. `onSubmit`
 * fires with the trimmed+uppercased value on form submit. `loading` shows
 * a spinner on the submit button and disables it. `error` renders an
 * accessible error message wired via aria-describedby + aria-invalid.
 */

// The shell is width-agnostic — callers control max-width at the call site
// (hero wraps it in a max-w-2xl motion.div; the dialog lets it fill).
const SHELL_CLASS =
  "relative w-full bg-card border-2 border-border focus-within:border-primary focus-within:shadow-brutal-sm tac-fui-hover transition-colors p-1"

const fieldVariants = cva(
  "font-mono border-none focus-visible:ring-0 rounded-none bg-transparent text-foreground uppercase placeholder:text-muted-foreground font-bold tracking-paper-20 focus-visible:outline-none focus-visible:tac-focus-premium",
  {
    variants: {
      size: {
        hero: "h-14 text-sm px-6",
        default: "h-11 text-xs px-4",
      },
    },
    defaultVariants: { size: "default" },
  },
)

interface AwbInputProps extends VariantProps<typeof fieldVariants> {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  loading?: boolean
  error?: string | null
  placeholder?: string
  autoFocus?: boolean
  /** Unique id base — the input gets `${id}-input`, error gets `${id}-error`. */
  id?: string
  className?: string
}

function AwbInput({
  value,
  onChange,
  onSubmit,
  loading = false,
  error = null,
  placeholder = "ENTER AWB / CARGO ID...",
  autoFocus = false,
  size = "default",
  id = "awb",
  className,
}: AwbInputProps) {
  const inputId = `${id}-input`
  const errorId = `${id}-error`

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(value.trim().toUpperCase())
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(SHELL_CLASS, className)}
      data-slot="awb-input"
    >
      <div className="flex flex-col sm:flex-row gap-0">
        <div className="relative flex-1">
          <label htmlFor={inputId} className="sr-only">
            AWB or cargo ID
          </label>
          <Input
            id={inputId}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? true : undefined}
            className={cn(fieldVariants({ size }))}
          />
          {size === "hero" && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex items-center">
              <span className="tac-mono-label text-primary">
                {loading ? "LOCATING" : "STANDBY"}
              </span>
            </div>
          )}
        </div>
        {size === "hero" ? (
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            aria-busy={loading}
            // eslint-disable-next-line no-restricted-syntax -- design-locked: see docs/design-exceptions.md
            className="h-14 rounded-none font-mono font-bold text-sm tracking-[0.3em] uppercase bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background w-full sm:w-auto px-10 transition-colors border-l border-secondary/20 focus-visible:outline-none focus-visible:tac-focus-premium"
          >
            {loading ? (
              <Icon name="loader" className="mr-3 w-5 h-5 animate-spin motion-reduce:animate-none" />
            ) : (
              <Icon name="scan" className="mr-3 w-5 h-5" />
            )}
            {loading ? "LOCATING" : "LOCATE"}
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-label="Track AWB"
            className="h-11 rounded-none font-mono font-bold text-xs tracking-paper-20 uppercase px-4 w-full sm:w-auto border-l border-border focus-visible:outline-none focus-visible:tac-focus-premium"
          >
            <Icon
              name={loading ? "loader" : "search"}
              className={cn("w-4 h-4", loading && "animate-spin motion-reduce:animate-none")}
            />
          </Button>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="absolute left-1 -bottom-6 tac-mono-label text-accent-danger"
        >
          {error}
        </p>
      )}
    </form>
  )
}

export { AwbInput }
export type { AwbInputProps }
