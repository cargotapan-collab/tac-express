"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@workspace/ui/lib/utils"

const opsButtonVariants = cva(
  // Base — mono uppercase, sharp corners, hairline border, paper hover.
  [
    "inline-flex items-center justify-center gap-1.5",
    "font-paper-mono font-medium uppercase tracking-paper-12",
    "border cursor-pointer",
    "transition-colors duration-fast ease-linear",
    "focus-visible:outline-none focus-visible:tac-focus-premium",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        default: "border-paper-line bg-paper-card text-paper-fg-1 hover:bg-paper-3",
        primary:
          "border-paper-violet-2 bg-paper-violet text-white hover:bg-paper-violet-2 shadow-[0_1px_0_rgba(14,15,18,0.06)]",
        ghost: "border-transparent bg-transparent text-paper-fg-1 hover:bg-paper-3",
        tab: "border-paper-line bg-transparent text-paper-fg-1 hover:bg-paper-3 data-[state=on]:border-paper-violet-2 data-[state=on]:bg-paper-violet data-[state=on]:text-white",
        danger:
          "border-paper-err/40 bg-paper-err-bg text-paper-err hover:bg-paper-err/15",
        dark: "border-paper-ink bg-paper-ink text-white hover:opacity-90",
      },
      size: {
        default: "px-3.5 py-2 text-paper-11",
        sm: "px-2.5 py-1.5 text-paper-10",
        lg: "px-4 py-3 text-paper-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

interface OpsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof opsButtonVariants> {
  asChild?: boolean
}

function OpsButton({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: OpsButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="ops-button"
      className={cn(opsButtonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { OpsButton, opsButtonVariants }
export type { OpsButtonProps }
