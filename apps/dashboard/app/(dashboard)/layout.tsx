import { DashboardSidebar } from "@workspace/ui/components/composed/dashboard-sidebar"
import { DashboardHeader } from "@workspace/ui/components/composed/dashboard-header"
import { CommandPalette } from "@workspace/ui/components/composed/command-palette"
import { DensityProvider } from "@workspace/ui/components/composed/density-provider"

import { IdleGuard } from "@/components/idle-guard"
import { SessionGuard } from "@/components/session-guard"

function DashboardBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.03] z-0">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dashboardGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--primary)" strokeWidth="0.5" />
            <circle cx="40" cy="40" r="1" fill="var(--primary)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dashboardGrid)" />
      </svg>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // v6: DensityProvider sets `data-density` on the dashboard root so
    // descendant tables/lists/panels can adapt their spacing rhythm.
    <DensityProvider>
      <div className="flex h-screen bg-background overflow-hidden relative selection:bg-primary/30">
        <DashboardBackground />
        <CommandPalette />
        <SessionGuard />
        <IdleGuard />
        <DashboardSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
          <DashboardHeader />
          <main className="flex-1 overflow-hidden bg-transparent p-3 md:p-4 lg:p-5 flex flex-col">
          {/* Hardware Viewport Frame (Mission Control Aesthetic) */}
          <div className="flex-1 w-full max-w-control mx-auto tac-fui-border bg-surface shadow-brutal flex flex-col relative overflow-hidden group tac-scanline">
            {/* FUI Hardware Accents */}
            <div className="absolute top-0 left-0 w-full h-1 tac-hazard-stripes z-10" />
            <div className="absolute top-0 left-0 w-12 h-0.5 bg-primary z-20 opacity-80" />
            <div className="absolute top-0 left-0 w-0.5 h-12 bg-primary z-20 opacity-80" />
            <div className="absolute bottom-0 right-0 w-12 h-0.5 bg-border z-20" />
            <div className="absolute bottom-0 right-0 w-0.5 h-12 bg-border z-20" />
            
            {/* Scrollable Content Area — v6: @container/dashboard-content lets
                descendant sections (KPI Grid, Welcome Hero, charts) adapt
                via @md:/@lg: modifiers based on the panel's actual width
                rather than the viewport. */}
            <div className="@container/dashboard-content flex-1 overflow-y-auto overflow-x-hidden px-5 py-6 sm:px-8 lg:px-10 lg:py-8 relative z-10 scrollbar-hide">
              {children}
            </div>
          </div>
        </main>
        </div>
      </div>
    </DensityProvider>
  )
}