import * as React from "react"
import { Icon } from "@workspace/ui/icons"

const stats = [
  { id: 1, value: "15+", label: "Years of Operation", icon: "check" as const },
  { id: 2, value: "2", label: "Primary Hubs", icon: "hub" as const },
  { id: 3, value: "4", label: "Core Services", icon: "package" as const },
  { id: 4, value: "IXI ↔ DEL", label: "Primary Air Route", icon: "barcode" as const },
]

export function StatsBar() {
  return (
    <section className="bg-bg-base border-y border-border-default py-8 relative z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-border/30">
          {stats.map((stat) => (
            <div key={stat.id} className="flex-1 flex flex-col items-center justify-center text-center px-4 w-full pt-4 md:pt-0">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={stat.icon} className="size-4 text-muted-foreground" />
                <span className="font-sans text-3xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </span>
              </div>
              <div className="font-mono text-2xs text-muted-foreground tracking-wider uppercase font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
