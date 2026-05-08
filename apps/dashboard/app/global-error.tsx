"use client"

/**
 * Global error boundary — catches React render-time exceptions that
 * weren't caught by a nested error.tsx, AND captures them to Sentry so
 * we have a stack-traceable record. Without this file, render-phase
 * crashes show the Next.js error overlay in dev but produce zero
 * telemetry in production.
 *
 * Per Next.js App Router contract:
 *  - Must be a Client Component
 *  - Must render its own <html>/<body> (replaces the entire tree)
 *  - Receives the thrown error with an optional `digest` string for
 *    server-component crashes
 */

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
}

export default function GlobalError({ error }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <div className="max-w-md space-y-3 text-center">
            <h1 className="font-mono text-sm uppercase tracking-widest text-destructive">
              Something went wrong
            </h1>
            <p className="font-sans text-sm text-muted-foreground">
              The dashboard hit an unexpected error and couldn't render this
              page. Our ops team has been notified — please reload and try
              again.
            </p>
            {error.digest && (
              <p className="font-mono text-2xs text-muted-foreground/70">
                Reference: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
