import * as React from "react"
import { PublicNav } from "@workspace/ui/components/composed/public-nav"
import { Footer } from "@workspace/ui/components/composed/footer"
import { NoiseOverlay } from "@workspace/ui/components/composed/noise-overlay"
import { ScrollProgress } from "@workspace/ui/components/composed/scroll-progress"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/30">
      <NoiseOverlay opacity={0.05} />
      <ScrollProgress />
      <PublicNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
