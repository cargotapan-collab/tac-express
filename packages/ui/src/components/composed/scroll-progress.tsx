"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

/**
 * ScrollProgress — fixed top-of-page progress bar.
 * Uses requestAnimationFrame — no framer-motion / no gsap.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const barRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    let raf: number

    const update = () => {
      const el = barRef.current
      if (!el) return

      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? scrollTop / docHeight : 0

      el.style.transform = `scaleX(${progress})`
      raf = requestAnimationFrame(update)
    }

    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      ref={barRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] h-[2px] bg-foreground origin-left will-change-transform",
        className
      )}
      style={{ transform: "scaleX(0)" }}
      aria-hidden="true"
    />
  )
}
