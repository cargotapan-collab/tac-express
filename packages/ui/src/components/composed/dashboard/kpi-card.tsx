"use client"

import * as React from "react"
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react"
import { cn } from "@workspace/ui/lib/utils"

interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon: React.ReactNode
  deltaLabel?: string
  delta?: "positive" | "negative" | "neutral"
  suffix?: string
  loading?: boolean
  accent?: "primary" | "success" | "warning" | "danger"
}

const accentClasses: Record<NonNullable<KPICardProps["accent"]>, { bg: string; icon: string; edge: string }> = {
  primary: { bg: "bg-primary-subtle", icon: "text-primary", edge: "bg-primary" },
  success: { bg: "bg-accent-success/10", icon: "text-accent-success", edge: "bg-accent-success" },
  warning: { bg: "bg-accent-warning/10", icon: "text-accent-warning", edge: "bg-accent-warning" },
  danger: { bg: "bg-accent-danger/10", icon: "text-accent-danger", edge: "bg-accent-danger" },
}

const deltaClasses: Record<NonNullable<KPICardProps["delta"]>, string> = {
  positive: "bg-accent-success/10 text-accent-success",
  negative: "bg-accent-danger/10 text-accent-danger",
  neutral: "bg-muted text-muted-foreground",
}

/**
 * v6 motion vocabulary: expressive layer (320ms, spring) for entrance choreography.
 * Matches `--motion-expressive` in globals.css.
 */
const SPRING_EXPRESSIVE = { duration: 0.32, ease: [0.34, 1.56, 0.64, 1] } as const

/**
 * Numeric count-up animation. Spring-driven, respects prefers-reduced-motion.
 * Returns the formatted string the parent should render.
 */
function useCountUp(target: number, reduceMotion: boolean | null): string {
  const spring = useSpring(reduceMotion ? target : 0, {
    duration: 800,
    bounce: 0,
  })
  React.useEffect(() => {
    spring.set(target)
  }, [spring, target])

  const display = useTransform(spring, (latest) =>
    Math.round(latest).toLocaleString()
  )
  const [text, setText] = React.useState(reduceMotion ? target.toLocaleString() : "0")
  React.useEffect(() => {
    return display.on("change", (v) => setText(v))
  }, [display])
  return text
}

function KPICard({
  label,
  value,
  icon,
  deltaLabel,
  delta = "neutral",
  suffix,
  loading,
  accent = "primary",
  className,
  ...props
}: KPICardProps) {
  const shouldReduceMotion = useReducedMotion()
  const colors = accentClasses[accent]

  // Numeric count-up only when value is a number; otherwise pass through.
  const numericValue = typeof value === "number" ? value : null
  const animatedNumber = useCountUp(numericValue ?? 0, shouldReduceMotion)
  const renderedValue =
    numericValue !== null
      ? animatedNumber
      : value

  if (loading) {
    return (
      <div
        data-slot="kpi-card"
        className={cn("flex flex-col gap-3 p-5 animate-pulse tac-fui-panel", className)}
      >
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 bg-muted" />
        </div>
        <div className="h-10 w-24 bg-muted" />
        <div className="h-4 w-16 bg-muted" />
      </div>
    )
  }

  return (
    <div
      data-slot="kpi-card"
      // v6: tac-hover-lift (multi-axis: bg + border + sub-pixel translate). Container query for adaptive nested layout.
      className={cn(
        "@container/kpi-card flex flex-col gap-3 p-5 tac-fui-panel group relative overflow-hidden tac-hover-lift cursor-default",
        className,
      )}
      {...props}
    >
      {/* v6: data-accent-edge slot — accent strip on the left, animates in on hover */}
      <span
        data-accent-edge
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 w-0.5 opacity-0 group-hover:opacity-100",
          "transition-opacity duration-[80ms] ease-linear",
          colors.edge,
        )}
      />
      {/* Icon square + label */}
      <div className="flex flex-col gap-2.5">
        <motion.div
          className={cn("flex h-10 w-10 items-center justify-center shrink-0 tac-signal-glow", colors.bg)}
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING_EXPRESSIVE, delay: 0.05 }}
        >
          <span className={cn("h-5 w-5", colors.icon)}>{icon}</span>
        </motion.div>
        <motion.span
          className="t-overline text-muted-foreground"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, delay: 0.1 }}
        >
          {label}
        </motion.span>
      </div>

      {/* Value — count-up if numeric, otherwise plain */}
      <motion.div
        className="flex items-baseline gap-1.5 mt-1"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_EXPRESSIVE, delay: 0.15 }}
      >
        <span className="t-data text-foreground" aria-live="polite">
          {renderedValue}
        </span>
        {suffix && (
          <span className="t-mono text-muted-foreground">{suffix}</span>
        )}
      </motion.div>

      {/* Delta badge */}
      {deltaLabel && (
        <motion.span
          className={cn("inline-flex w-fit items-center px-2 py-0.5 t-mono-sm", deltaClasses[delta])}
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, delay: 0.25 }}
        >
          {deltaLabel}
        </motion.span>
      )}
    </div>
  )
}

export { KPICard }
