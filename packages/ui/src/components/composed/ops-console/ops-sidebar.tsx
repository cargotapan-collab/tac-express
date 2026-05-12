"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { useUnreadNotificationCount } from "@workspace/services/hooks/use-notifications"
import { useSidebarBadges } from "@workspace/services/hooks/use-dashboard"
import { useSession } from "@workspace/ui/hooks/use-session"
import { cn } from "@workspace/ui/lib/utils"
import {
  RiDashboardLine,
  RiBarChart2Line,
  RiBox3Line,
  RiFileList3Line,
  RiScanLine,
  RiStore2Line,
  RiAlertLine,
  RiMoneyDollarCircleLine,
  RiCalculatorLine,
  RiTeamLine,
  RiShieldCheckLine,
  RiNotification3Line,
  RiSettingsLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiMenuLine,
  RiCheckboxCircleLine,
  RiHistoryLine,
  RiClipboardLine,
  type RemixiconComponentType,
} from "@workspace/ui/icons"

type NavItem = {
  href: string
  label: string
  icon: RemixiconComponentType
  badge?: string
}

type NavGroup = {
  name: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    name: "Platform",
    items: [
      { href: "/ops-console", label: "Dashboard", icon: RiDashboardLine },
      { href: "/ops-console/analytics", label: "Analytics", icon: RiBarChart2Line },
    ],
  },
  {
    name: "Operations",
    items: [
      { href: "/ops-console/shipments", label: "Shipments", icon: RiBox3Line },
      { href: "/ops-console/manifests", label: "Manifests", icon: RiFileList3Line },
      { href: "/ops-console/scanning", label: "Scanning", icon: RiScanLine },
      { href: "/ops-console/inventory", label: "Inventory", icon: RiStore2Line },
      { href: "/ops-console/exceptions", label: "Exceptions", icon: RiAlertLine },
    ],
  },
  {
    name: "Business",
    items: [
      { href: "/ops-console/finance", label: "Finance", icon: RiMoneyDollarCircleLine },
      { href: "/ops-console/rates", label: "Rate Cards", icon: RiCalculatorLine },
      { href: "/ops-console/customers", label: "Customers", icon: RiTeamLine },
      { href: "/ops-console/management", label: "Management", icon: RiShieldCheckLine },
    ],
  },
  {
    // Operational reporting + audit surfaces. Routes intentionally point at the
    // v6 `(dashboard)/*` pages until paper variants ship — preserves the full
    // feature surface (LAW 1 forbids removing functionality) while making the
    // tools discoverable from the paper sidebar.
    name: "Audit & Reports",
    items: [
      { href: "/arrival-audit", label: "Arrival Audit", icon: RiCheckboxCircleLine },
      { href: "/audit", label: "Audit Log", icon: RiHistoryLine },
      { href: "/shift-report", label: "Shift Report", icon: RiClipboardLine },
    ],
  },
]

const FOOT_ITEMS: NavItem[] = [
  { href: "/ops-console/notifications", label: "Notifications", icon: RiNotification3Line },
  { href: "/ops-console/settings", label: "Settings", icon: RiSettingsLine },
]

function NavRow({
  item,
  active,
  badgeOverride,
}: {
  item: NavItem
  active: boolean
  /** Runtime badge (e.g. unread count) — wins over static `item.badge`. */
  badgeOverride?: string | null
}) {
  const Icon = item.icon
  const badge = badgeOverride ?? item.badge
  return (
    <Link
      href={item.href}
      data-active={active || undefined}
      className={cn(
        "relative flex items-center gap-2.5 px-4 py-2 cursor-pointer",
        "font-paper-mono text-[12px] font-semibold uppercase tracking-[0.08em]",
        "text-paper-fg-2 hover:bg-paper-3 hover:text-paper-fg-1",
        "focus-visible:outline-none focus-visible:tac-focus-premium",
        "transition-colors duration-fast ease-linear",
        active && "bg-paper-violet-50 text-paper-violet",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-[3px] bg-paper-violet"
        />
      )}
      <Icon aria-hidden className="size-4" />
      <span>{item.label}</span>
      {active && !badge && (
        <span aria-hidden className="ml-auto size-1.5 bg-paper-violet" />
      )}
      {badge && (
        <span
          aria-label={`${badge} unread`}
          className="ml-auto bg-paper-violet text-white font-paper-mono text-[9px] tracking-[0.04em] px-1.5 py-0.5"
        >
          {badge}
        </span>
      )}
    </Link>
  )
}

/** Format a numeric count as a badge string with a "99+" cap. */
function formatBadge(n: number | undefined): string | null {
  if (typeof n !== "number" || n <= 0) return null
  return n > 99 ? "99+" : String(n)
}

function OpsSidebar() {
  const pathname = usePathname()
  const { user } = useSession()
  const { data: unreadCount } = useUnreadNotificationCount(user?.id)
  const { data: sidebarBadges } = useSidebarBadges()
  const unreadBadge = formatBadge(unreadCount)
  // Per-route badge map — keyed by href so NavRow can look up its badge by
  // its own destination without nav-config knowledge of business logic.
  const liveBadges = React.useMemo<Record<string, string | null>>(
    () => ({
      "/ops-console/manifests": formatBadge(sidebarBadges?.openManifests),
      "/ops-console/exceptions": formatBadge(sidebarBadges?.openExceptions),
      "/ops-console/finance": formatBadge(sidebarBadges?.pendingInvoices),
    }),
    [sidebarBadges],
  )

  // Active rule — exact match wins; the dashboard root also matches `/ops-console`.
  const isActive = (href: string) =>
    href === "/ops-console"
      ? pathname === "/ops-console"
      : pathname === href || pathname?.startsWith(href + "/")

  return (
    <aside
      data-slot="ops-sidebar"
      className="bg-paper-2 border-r border-paper-line flex flex-col sticky top-0 h-screen w-60"
    >
      {/* Brand */}
      <div className="relative flex items-start gap-1.5 p-4 border-b border-paper-line">
        <div className="flex-1">
          <div className="font-paper-mono font-extrabold text-[16px] leading-none tracking-[-0.01em]">
            <span className="text-paper-ink">TAC</span>{" "}
            <span className="text-paper-orange">EXPRESS →</span>
          </div>
          <div className="font-paper-mono font-medium text-[9px] tracking-[0.18em] uppercase text-paper-fg-3 mt-1.5">
            Imphal // Prod
          </div>
        </div>
        <button
          type="button"
          aria-label="Collapse sidebar"
          className="size-[22px] border border-paper-line bg-paper-card grid place-items-center text-paper-fg-3 hover:bg-paper-3 transition-colors duration-fast ease-linear focus-visible:outline-none focus-visible:tac-focus-premium"
        >
          <RiArrowRightSLine aria-hidden className="size-3" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_GROUPS.map((group) => (
          <div key={group.name}>
            <div className="flex items-center justify-between px-[18px] py-1 mt-2 font-paper-mono font-medium text-[10px] tracking-[0.14em] uppercase text-paper-fg-3">
              <span>{"// "}{group.name}</span>
              <RiArrowDownSLine aria-hidden className="size-3 text-paper-fg-4" />
            </div>
            {group.items.map((item) => (
              <NavRow
                key={item.href}
                item={item}
                active={isActive(item.href)}
                badgeOverride={liveBadges[item.href] ?? undefined}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer items */}
      <div className="border-t border-paper-line py-2.5">
        {FOOT_ITEMS.map((item) => (
          <NavRow
            key={item.href}
            item={item}
            active={isActive(item.href)}
            badgeOverride={
              item.href === "/ops-console/notifications" ? unreadBadge : undefined
            }
          />
        ))}
      </div>

      {/* User */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-t border-paper-line">
        <div className="size-8 bg-paper-ink text-white grid place-items-center font-paper-mono font-semibold text-[12px]">
          N
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-paper-mono font-bold text-[11px] tracking-[0.08em] truncate">
            ADMIN
          </div>
          <div className="font-paper-mono font-medium text-[9px] tracking-[0.14em] text-paper-fg-3">
            Super Admin
          </div>
        </div>
        <button
          type="button"
          aria-label="Open user menu"
          className="text-paper-fg-3 hover:text-paper-fg-1 focus-visible:outline-none focus-visible:tac-focus-premium"
        >
          <RiMenuLine aria-hidden className="size-4" />
        </button>
      </div>
    </aside>
  )
}

export { OpsSidebar }
