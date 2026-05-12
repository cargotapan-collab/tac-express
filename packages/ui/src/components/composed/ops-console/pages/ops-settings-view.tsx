"use client"

import * as React from "react"
import Link from "next/link"

import {
  RiKeyboardLine,
  RiKey2Line,
  RiSendPlaneLine,
  RiArrowRightLine,
} from "@workspace/ui/icons"
import { OpsFrame } from "../ops-frame"
import { OpsPageHead } from "../ops-page-head"
import { OpsButton } from "../ops-button"
import { OpsCard } from "../ops-card"
import { OpsTabs } from "../ops-tabs"
import { OpsFieldInput, OpsFieldLabel } from "../ops-field"
import { OpsKbd } from "../ops-kbd"

interface OpsSettingsViewProps {
  email: string
  displayName: string
  hubCode: string
  completionPct: number
  pendingItems: string[]
  version: string
  environment: string
}

const TABS = ["Profile", "Security", "Theme", "Integrations", "Audit"] as const

const SHORTCUTS: Array<[label: string, keys: string[]]> = [
  ["Open search", ["⌘", "K"]],
  ["Toggle theme", ["⌘", "⇧", "L"]],
  ["Notifications", ["⌘", "⇧", "N"]],
  ["Sign out", ["⌘", "⇧", "Q"]],
]

function OpsSettingsView({
  email,
  displayName,
  hubCode,
  completionPct,
  pendingItems,
  version,
  environment,
}: OpsSettingsViewProps) {
  const [tab, setTab] = React.useState<string>("Profile")

  return (
    <OpsFrame>
      <OpsPageHead
        eyebrow="Account"
        title="Settings"
        sub="Manage your profile, security, theme, and integrations"
      />
      <OpsTabs items={[...TABS]} value={tab} onChange={setTab} />

      {/* Profile tab — the live editable form + completion + shortcuts. */}
      {tab === "Profile" && (
        <div className="grid grid-cols-[1.5fr_1fr] gap-[18px]">
          <OpsCard ticks>
            <div className="paper-label mb-3.5">Profile</div>
            <div className="flex flex-col gap-3.5">
              <div>
                <OpsFieldLabel htmlFor="paper-settings-email">Email</OpsFieldLabel>
                <OpsFieldInput
                  id="paper-settings-email"
                  defaultValue={email.toUpperCase()}
                />
              </div>
              <div>
                <OpsFieldLabel htmlFor="paper-settings-name">
                  Display Name
                </OpsFieldLabel>
                <OpsFieldInput
                  id="paper-settings-name"
                  placeholder="Type your name"
                  defaultValue={displayName}
                />
              </div>
              <div>
                <OpsFieldLabel htmlFor="paper-settings-hub">Hub Code</OpsFieldLabel>
                <OpsFieldInput
                  id="paper-settings-hub"
                  placeholder="E.G. IMPHAL"
                  defaultValue={hubCode}
                />
              </div>
              <div className="flex justify-end mt-1.5">
                <OpsButton variant="primary">Save Changes</OpsButton>
              </div>
            </div>
          </OpsCard>

          <div className="flex flex-col gap-3.5">
            <OpsCard ticks>
              <div className="paper-label">Profile Completion</div>
              <div className="font-paper-display font-extrabold text-[length:var(--text-paper-28)] mt-2">
                {completionPct}%
              </div>
              <div className="paper-label mt-1.5">
                {pendingItems.length} pending
              </div>
              <div className="mt-2.5 font-paper-mono text-paper-fg-3 text-[length:var(--text-paper-12)] flex flex-col gap-1">
                {pendingItems.map((p) => (
                  <div key={p}>■ {p}</div>
                ))}
              </div>
            </OpsCard>

            <OpsCard ticks>
              <div className="paper-label flex items-center gap-2">
                <RiKeyboardLine aria-hidden className="size-3.5" />
                Keyboard Shortcuts
              </div>
              {SHORTCUTS.map(([label, keys]) => (
                <div
                  key={label}
                  className="flex items-center justify-between mt-2"
                >
                  <span className="font-paper-mono uppercase text-paper-fg-3 text-[length:var(--text-paper-11)] tracking-[length:var(--tracking-paper-08)]">
                    {label}
                  </span>
                  <span className="font-paper-mono text-[length:var(--text-paper-11)]">
                    {keys.map((k) => (
                      <OpsKbd key={k}>{k}</OpsKbd>
                    ))}
                  </span>
                </div>
              ))}
            </OpsCard>

            <OpsCard>
              <div className="paper-label">System Information</div>
              <div className="flex items-center justify-between mt-2">
                <span className="paper-label">Version</span>
                <span className="font-paper-mono text-[length:var(--text-paper-13)]">
                  {version}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="paper-label">Environment</span>
                <span className="font-paper-mono text-[length:var(--text-paper-13)]">
                  {environment}
                </span>
              </div>
            </OpsCard>
          </div>
        </div>
      )}

      {/* Integrations tab — API Keys + Webhooks deep-links to v6 sub-pages. */}
      {tab === "Integrations" && (
        <OpsCard ticks>
          <div className="paper-label mb-3">Integrations</div>
          {/* Sub-pages live in the v6 surface until paper variants ship —
              linking here makes them discoverable from the Ops Console. */}
          <ul className="flex flex-col divide-y divide-paper-line border-y border-paper-line">
            <li>
              <Link
                href="/settings/api-keys"
                className="flex items-center gap-3 py-2.5 px-1 hover:bg-paper-3 transition-colors duration-fast ease-linear focus-visible:outline-none focus-visible:tac-focus-premium"
              >
                <RiKey2Line aria-hidden className="size-4 text-paper-violet" />
                <div className="flex-1 min-w-0">
                  <div className="font-paper-display font-semibold text-[length:var(--text-paper-13)]">
                    API Keys
                  </div>
                  <div className="paper-label mt-0.5">
                    Service tokens & access control
                  </div>
                </div>
                <RiArrowRightLine
                  aria-hidden
                  className="size-3.5 text-paper-fg-3"
                />
              </Link>
            </li>
            <li>
              <Link
                href="/settings/webhooks"
                className="flex items-center gap-3 py-2.5 px-1 hover:bg-paper-3 transition-colors duration-fast ease-linear focus-visible:outline-none focus-visible:tac-focus-premium"
              >
                <RiSendPlaneLine aria-hidden className="size-4 text-paper-violet" />
                <div className="flex-1 min-w-0">
                  <div className="font-paper-display font-semibold text-[length:var(--text-paper-13)]">
                    Webhooks
                  </div>
                  <div className="paper-label mt-0.5">
                    Event subscriptions & delivery logs
                  </div>
                </div>
                <RiArrowRightLine
                  aria-hidden
                  className="size-3.5 text-paper-fg-3"
                />
              </Link>
            </li>
          </ul>
        </OpsCard>
      )}

      {/* Audit tab — link to v6 audit log */}
      {tab === "Audit" && (
        <OpsCard ticks>
          <div className="paper-label mb-3">Audit Log</div>
          <p className="font-paper-display text-[length:var(--text-paper-13)] mb-4">
            Compliance + activity history for this account and the organization.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center gap-1.5 paper-label text-paper-violet hover:underline focus-visible:outline-none focus-visible:tac-focus-premium"
          >
            Open Audit Log
            <RiArrowRightLine aria-hidden className="size-3.5" />
          </Link>
        </OpsCard>
      )}

      {/* Security + Theme tabs are not yet implemented — surface that
          honestly instead of pretending a tab works. */}
      {(tab === "Security" || tab === "Theme") && (
        <OpsCard ticks>
          <div className="paper-label mb-3">{tab}</div>
          <p className="font-paper-display text-[length:var(--text-paper-13)] text-paper-fg-3">
            {tab === "Security"
              ? "Password rotation, 2FA setup, and session management ship in the next sprint. For account-recovery contact your administrator."
              : "Theme is controlled by the C / M / S toggle in the top bar. A persistent per-user theme preference lands in the next sprint."}
          </p>
        </OpsCard>
      )}
    </OpsFrame>
  )
}

export { OpsSettingsView }
export type { OpsSettingsViewProps }
