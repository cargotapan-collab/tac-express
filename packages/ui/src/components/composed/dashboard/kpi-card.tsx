"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
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

const accentClasses: Record<NonNullable<KPICardProps["accent"]>, { bg: string; icon: string }> = {
  primary: { bg: "bg-primary/10", icon: "text-primary" },
  success: { bg: "bg-accent-success/10", icon: "text-accent-success" },
  warning: { bg: "bg-accent-warning/10", icon: "text-accent-warning" },
  danger: { bg: "bg-accent-danger/10", icon: "text-accent-danger" },
}

const deltaClasses: Record<NonNullable<KPICardProps["delta"]>, string> = {
  positive: "bg-accent-success/10 text-accent-success",
  negative: "bg-accent-danger/10 text-accent-danger",
  neutral: "bg-muted text-muted-foreground",
}

const SPRING = { duration: 0.5, ease: [0.16, 1, 0.3, 1] } as const

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
      className={cn("flex flex-col gap-3 p-5 tac-fui-panel group relative overflow-hidden tac-fui-hover cursor-default", className)}
      {...props}
    >
      {/* Subtle edge highlight on hover */}
      <div className={cn("absolute inset-y-0 left-0 w-[2px] opacity-0 transition-opacity group-hover:opacity-100", colors.bg.replace('/10', ''))} />
      {/* Icon square + label */}
      <div className="flex flex-col gap-2.5">
        <motion.div
          className={cn("flex h-10 w-10 items-center justify-center shrink-0 tac-signal-glow", colors.bg)}
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: 0.05 }}
        >
          <span className={cn("h-5 w-5", colors.icon)}>{icon}</span>
        </motion.div>
        <motion.span
          className="t-overline text-muted-foreground"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {label}
        </motion.span>
      </div>

      {/* Value */}
      <motion.div
        className="flex items-baseline gap-1.5 mt-1"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.15 }}
      >
        <span className="t-data text-foreground drop-shadow-sm">
          {typeof value === "number" ? value.toLocaleString() : value}
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
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          {deltaLabel}
        </motion.span>
      )}
    </div>
  )
}

export { KPICard }
