"use client"

import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface TextScrambleProps {
  children: string
  className?: string
  /** Total decode duration in seconds (default: 2.5) */
  duration?: number
  /** Whether to loop the animation (default: false) */
  repeat?: boolean
  /** Re-trigger the full scramble on mouse hover (default: false) */
  hoverRescramble?: boolean
}

const MATRIX_CHARS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789"

/**
 * TextScramble — decodes scrambled katakana/numeric text into the final
 * string using per-character setInterval scrambling + setTimeout lock timing.
 *
 * Pure vanilla JS — no GSAP, no framer-motion.
 * Uses CSS variable tokens (--primary, --foreground) instead of hex.
 */
export function TextScramble({
  children,
  className = "",
  duration = 2.5,
  repeat = false,
  hoverRescramble = false,
}: TextScrambleProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null)
  const [triggerCount, setTriggerCount] = React.useState(0)

  const handleMouseEnter = React.useCallback(() => {
    if (hoverRescramble) {
      setTriggerCount((c) => c + 1)
    }
  }, [hoverRescramble])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (!containerRef.current) return

    const el = containerRef.current
    const finalText = children

    const intervals: ReturnType<typeof setInterval>[] = []
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const runAnimation = () => {
      el.innerHTML = ""

      const tokens = finalText.match(/\S+|\s+/g) ?? []
      const charEntries: Array<{ span: HTMLSpanElement; finalChar: string }> = []

      tokens.forEach((token) => {
        if (/^\s+$/.test(token)) {
          el.appendChild(document.createTextNode(token))
          return
        }

        const wordWrap = document.createElement("span")
        wordWrap.style.whiteSpace = "nowrap"
        wordWrap.style.display = "inline"

        token.split("").forEach((char) => {
          const span = document.createElement("span")
          span.style.display = "inline-block"
          span.style.color = "var(--primary)"
          span.style.textShadow = "0 0 10px var(--primary)"
          span.style.transition = "color 0.2s ease-out, text-shadow 0.5s ease-out"
          span.textContent =
            MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] || char
          wordWrap.appendChild(span)
          charEntries.push({ span, finalChar: char })
        })

        el.appendChild(wordWrap)
      })

      const charStates = new Array(charEntries.length).fill(false)
      const maxDelay = duration * 0.78

      charEntries.forEach(({ span, finalChar }, i) => {
        const positionalDelay = (i / charEntries.length) * maxDelay
        const lockDelay = positionalDelay + Math.random() * 0.35

        const scrambleInterval = setInterval(() => {
          if (!charStates[i]) {
            span.textContent =
              MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)] || finalChar
          }
        }, 50)
        intervals.push(scrambleInterval)

        const lockTimeout = setTimeout(() => {
          clearInterval(scrambleInterval)
          charStates[i] = true
          span.textContent = finalChar

          span.style.color = "var(--foreground)"
          span.style.textShadow =
            "0 0 18px var(--primary), 0 0 36px var(--primary)"

          const settleTimeout = setTimeout(() => {
            span.style.textShadow = "none"
            span.style.color = "inherit"
          }, 380)
          timeouts.push(settleTimeout)
        }, lockDelay * 1000)
        timeouts.push(lockTimeout)
      })
    }

    runAnimation()

    let repeatInterval: ReturnType<typeof setInterval> | undefined
    if (repeat) {
      repeatInterval = setInterval(() => {
        intervals.forEach(clearInterval)
        timeouts.forEach(clearTimeout)
        intervals.length = 0
        timeouts.length = 0
        runAnimation()
      }, (duration + 2) * 1000)
    }

    return () => {
      if (repeatInterval) clearInterval(repeatInterval)
      intervals.forEach(clearInterval)
      timeouts.forEach(clearTimeout)
    }
  }, [children, duration, repeat, triggerCount])

  return (
    <span
      className={cn("relative inline-block cursor-default", className)}
      aria-label={children}
      aria-live="off"
      onMouseEnter={handleMouseEnter}
    >
      {/* Invisible placeholder — avoids CLS */}
      <span className="invisible select-none pointer-events-none" aria-hidden="true">
        {children}
      </span>
      {/* Animated container */}
      <span
        ref={containerRef}
        className="absolute inset-0 inline"
        aria-hidden="true"
      />
    </span>
  )
}
