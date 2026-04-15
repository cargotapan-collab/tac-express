import * as React from "react"
import Link from "next/link"
import { Icon } from "@workspace/ui/icons"
import { Button } from "@workspace/ui/components/button"
import { GridBackground } from "@workspace/ui/components/composed/grid-background"

export function CtaBanner() {
  return (
    <section data-slot="cta-banner" className="relative overflow-hidden py-32 bg-bg-panel border-t border-border-default">
      {/* Strict flat background */}
      <div className="absolute inset-0 z-0 bg-bg-panel" />
      <GridBackground columns={12} className="opacity-5" mask="none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 border border-border-strong px-3 py-1 mb-8 rounded-none bg-background">
            <div className="w-1.5 h-1.5 bg-foreground rounded-none" />
            <span className="font-mono text-xs font-medium text-foreground tracking-wide">Serving Imphal &amp; New Delhi Since 2009</span>
          </div>
          
          <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 tracking-tight text-foreground leading-tight">
            Move cargo with confidence.
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground font-sans max-w-2xl mb-10 leading-relaxed">
            Businesses and individuals across Manipur and Delhi trust TAC Express for fast,
            reliable air and surface cargo. Get started today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
            <Button size="lg" className="btn-primary w-full sm:w-auto h-14 px-10 text-base" asChild>
              <Link href="/sign-in">
                Book a Shipment <Icon name="arrowRight" className="ml-2" size={18} />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 text-base font-medium transition-colors border-border-strong hover:bg-muted" asChild>
              <Link href="mailto:contact@tacexpress.in">
                Contact Sales
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </section>
  )
}
