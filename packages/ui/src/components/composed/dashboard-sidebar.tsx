"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@workspace/ui/lib/utils"
import { useRBAC } from "@workspace/ui/hooks/use-rbac"
import { useSidebarBadges } from "@workspace/services/hooks/use-dashboard"
import {
  RiDashboardLine,
  RiBox3Line,
  RiFileList3Line,
  RiScanLine,
  RiBuilding4Line,
  RiAlertLine,
  RiExchangeFundsLine,
  RiTeamLine,
  RiBarChart2Line,
  RiSettingsLine,
  RiNotification3Line,
  RiShieldCheckLine,
  RiMenuLine,
  RiCalculatorLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiUserLine,
} from "@workspace/ui/icons"

type BadgeKey = "openExceptions" | "openManifests" | "pendingInvoices" | "unreadNotifications"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  module?: string
  badgeKey?: BadgeKey
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Platform",
    items: [
      { label: "Dashboard", href: "/home", icon: RiDashboardLine, module: "*" },
      { label: "Analytics", href: "/analytics", icon: RiBarChart2Line, module: "analytics" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Shipments", href: "/shipments", icon: RiBox3Line, module: "shipments" },
      {
        label: "Manifests",
        href: "/manifests",
        icon: RiFileList3Line,
        module: "manifests",
        badgeKey: "openManifests",
      },
      { label: "Scanning", href: "/scanning", icon: RiScanLine, module: "scanning" },
      { label: "Inventory", href: "/inventory", icon: RiBuilding4Line, module: "inventory" },
      {
        label: "Exceptions",
        href: "/exceptions",
        icon: RiAlertLine,
        module: "exceptions",
        badgeKey: "openExceptions",
      },
    ],
  },
  {
    title: "Business",
    items: [
      {
        label: "Finance",
        href: "/finance",
        icon: RiExchangeFundsLine,
        module: "finance",
        badgeKey: "pendingInvoices",
      },
      { label: "Rate Cards", href: "/rate-cards", icon: RiCalculatorLine, module: "finance" },
      { label: "Customers", href: "/customers", icon: RiTeamLine, module: "customers" },
      {
        label: "Management",
        href: "/management",
        icon: RiShieldCheckLine,
        module: "management",
      },
    ],
  },
]

const NAV_BOTTOM_ITEMS: NavItem[] = [
  {
    label: "Notifications",
    href: "/notifications",
    icon: RiNotification3Line,
    badgeKey: "unreadNotifications",
  },
  { label: "Settings", href: "/settings", icon: RiSettingsLine },
]

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span
      data-slot="nav-badge"
      className="ml-auto inline-flex min-w-[1.25rem] h-4 items-center justify-center px-1 font-mono text-3xs bg-sidebar-primary text-sidebar-primary-foreground font-bold"
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

function SidebarNavItem({
  item,
  collapsed,
  badgeCount,
}: {
  item: NavItem
  collapsed: boolean
  badgeCount?: number
}) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
  const Icon = item.icon
  const showBadge = !collapsed && typeof badgeCount === "number" && badgeCount > 0

  return (
    <Link
      href={item.href}
      data-slot="nav-item"
      data-active={isActive}
      title={collapsed ? item.label : undefined}
      className={cn(
        // v6: motion-instant transitions, focus-premium on keyboard nav
        "group/nav-item flex h-9 items-center gap-3 border-l-4 px-3 relative",
        "transition-[background-color,border-color,color] duration-[80ms] ease-linear",
        "focus-visible:outline-none focus-visible:tac-focus-premium",
        "font-sans text-xs font-bold tracking-[0.1em] uppercase",
        isActive
          ? "border-sidebar-primary bg-primary-subtle text-sidebar-primary"
          : "border-transparent text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:border-sidebar-border/50"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}
      {showBadge && <NavBadge count={badgeCount!} />}
      {isActive && !collapsed && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-sidebar-primary opacity-80" aria-hidden="true" />
      )}
      {collapsed && typeof badgeCount === "number" && badgeCount > 0 && (
        <span
          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 bg-sidebar-primary"
          aria-hidden="true"
        />
      )}
    </Link>
  )
}

function SidebarGroup({
  group,
  collapsed,
  badges,
  canAccess,
}: {
  group: NavGroup
  collapsed: boolean
  badges?: Record<BadgeKey, number>
  canAccess: (module: string) => boolean
}) {
  const [open, setOpen] = React.useState(true)

  const items = group.items.filter((item) => {
    if (!item.module || item.module === "*") return true
    return canAccess(item.module)
  })

  if (items.length === 0) return null

  return (
    <div data-slot="nav-group" className="flex flex-col gap-0">
      {!collapsed && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex items-center justify-between px-3 pb-3 pt-8 first:pt-6",
            "font-mono text-3xs tracking-widest uppercase font-bold text-sidebar-foreground/40",
            "hover:text-sidebar-foreground/80 transition-colors"
          )}
          aria-expanded={open}
        >
          <span className="flex items-center gap-1.5">
            <span className="text-sidebar-primary/50">{"//"}</span>
            {group.title}
          </span>
          <RiArrowDownSLine
            className={cn("h-3 w-3 transition-transform", open ? "rotate-0" : "-rotate-90")}
            aria-hidden="true"
          />
        </button>
      )}
      {(open || collapsed) &&
        items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            collapsed={collapsed}
            badgeCount={item.badgeKey && badges ? badges[item.badgeKey] : undefined}
          />
        ))}
    </div>
  )
}

function DashboardSidebar() {
  const [collapsed, setCollapsed] = React.useState(false)
  const rbac = useRBAC()
  const badgesQuery = useSidebarBadges()

  const canAccess = React.useCallback(
    (module: string) => {
      if (rbac.isLoading) return true
      if (!rbac.role) return false
      return rbac.canAccessModule(module)
    },
    [rbac]
  )

  return (
    <aside
      data-slot="dashboard-sidebar"
      className={cn(
        "flex flex-col h-screen border-r-2 border-sidebar-border bg-sidebar transition-all duration-200 relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 tac-scanline" />
      
      {/* TeamSwitcher / Logo */}
      <div className="flex h-16 items-center border-b-2 border-sidebar-border px-4 shrink-0 relative z-10">
        {!collapsed ? (
          <div className="flex flex-1 items-center gap-2.5 min-w-0">
            <div className="min-w-0 flex-1 ml-1">
              <div className="flex items-center group overflow-hidden">
                <span className="font-sans font-black italic text-primary text-sm tracking-tighter uppercase">TAC</span>
                <span className="font-sans font-bold italic text-sidebar-foreground text-sm tracking-tighter uppercase ml-1">
                  E<span className="text-accent-warning">X</span>PRESS
                </span>
                <div className="w-3.5 h-3.5 flex items-center justify-center text-accent-warning ml-1 shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" className="w-full h-full transform translate-x-0 group-hover:translate-x-1 transition-transform">
                     <polyline points="2,12 20,12" />
                     <polyline points="12,4 20,12 12,20" />
                  </svg>
                </div>
              </div>
              <p className="font-mono text-3xs tracking-widest uppercase text-sidebar-foreground/50 truncate mt-0.5">imphal // prod</p>
            </div>
            <RiArrowRightSLine className="h-4 w-4 text-sidebar-foreground/50 shrink-0" aria-hidden="true" />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center bg-sidebar-primary mx-auto border border-sidebar-border group">
             <div className="w-4 h-4 flex items-center justify-center text-accent-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" className="w-full h-full transform translate-x-0 group-hover:translate-x-1 transition-transform">
                   <polyline points="2,12 20,12" />
                   <polyline points="12,4 20,12 12,20" />
                </svg>
             </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        data-slot="nav-primary"
        className="flex-1 overflow-y-auto py-1"
      >
        {NAV_GROUPS.map((group) => (
          <SidebarGroup
            key={group.title}
            group={group}
            collapsed={collapsed}
            badges={badgesQuery.data}
            canAccess={canAccess}
          />
        ))}
      </nav>

      {/* Bottom nav items */}
      <div data-slot="nav-bottom" className="border-t border-sidebar-border py-1">
        {NAV_BOTTOM_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            collapsed={collapsed}
            badgeCount={item.badgeKey && badgesQuery.data ? badgesQuery.data[item.badgeKey] : undefined}
          />
        ))}
      </div>

      {/* NavUser + collapse toggle */}
      <div className="border-t-2 border-sidebar-border p-4 flex items-center gap-3 shrink-0 relative z-10">
        {!collapsed && (
          <>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border">
              <RiUserLine className="h-4 w-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 ml-1">
              <p className="font-sans text-xs font-bold tracking-[0.1em] uppercase text-sidebar-foreground truncate">
                {rbac.name || "Operator"}
              </p>
              <p className="font-mono text-3xs tracking-widest uppercase text-sidebar-primary truncate mt-0.5">
                {rbac.role?.replace("_", " ") ?? "guest"}
              </p>
            </div>
          </>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "flex h-7 w-7 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors shrink-0",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <RiMenuLine className="h-4 w-4" />
        </button>
      </div>
    </aside>
  )
}

export { DashboardSidebar }
