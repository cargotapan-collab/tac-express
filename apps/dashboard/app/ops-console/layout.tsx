import type { Metadata } from "next"

import { OpsShell } from "@workspace/ui/components/composed/ops-console"

export const metadata: Metadata = {
  title: "TAC Express — Ops Console",
  description:
    "Hub operations console — warm-paper terminal aesthetic. Implementation of the Anthropic Design handoff bundle (May 2026).",
}

/**
 * Ops Console layout — a deliberately separate visual mode from the Violet
 * Grid v6 dashboard. The `.ops-console` className on the OpsShell scopes the
 * paper-* design tokens so they never bleed into Violet Grid surfaces.
 *
 * Source: .design-bundle (Anthropic Design handoff, May 2026).
 */
export default function OpsConsoleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Crumbs auto-derived from the pathname by the shell — see OpsShell.
  return <OpsShell>{children}</OpsShell>
}
