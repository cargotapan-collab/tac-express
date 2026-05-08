import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

/**
 * PageShell — canonical content-width wrapper for every dashboard route.
 *
 * Pre-PageShell, dashboard pages diverged: settings capped at `max-w-4xl`
 * and aligned left (right-side empty space); manifests/scanning had no cap
 * and sprawled across the full 1600px hardware frame; management /
 * notifications had no cap but sparse content read as wasted real estate.
 *
 * PageShell solves the inconsistency at the source: every page wraps its
 * content in a single shell that centers at `max-w-page-content` (80rem /
 * 1280px) and supplies the standard vertical rhythm between PageHeader
 * and the body.
 *
 * Use the `width` prop only when a route legitimately needs to escape the
 * default — e.g., a print preview that should hit the full hardware frame.
 */

interface PageShellProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: React.ReactNode
  /**
   * Content max-width. Defaults to `"content"` (the canonical `--spacing-page-content`,
   * 80rem / 1280px). Use `"control"` to opt into the wider 100rem mission-control
   * frame, or `"full"` to drop the cap entirely.
   */
  width?: "content" | "control" | "full"
  /** Vertical rhythm between PageHeader and body. Defaults to `space-y-6`. */
  spacing?: "tight" | "default" | "loose"
}

const WIDTH_CLASS: Record<NonNullable<PageShellProps["width"]>, string> = {
  content: "max-w-page-content",
  control: "max-w-control",
  full: "",
}

const SPACING_CLASS: Record<NonNullable<PageShellProps["spacing"]>, string> = {
  tight: "space-y-4",
  default: "space-y-6",
  loose: "space-y-8",
}

export function PageShell({
  className,
  children,
  width = "content",
  spacing = "default",
  ...props
}: PageShellProps) {
  return (
    <div
      data-slot="page-shell"
      data-width={width}
      className={cn(
        "mx-auto w-full",
        WIDTH_CLASS[width],
        SPACING_CLASS[spacing],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
