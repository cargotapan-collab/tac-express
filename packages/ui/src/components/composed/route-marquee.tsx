import * as React from "react"
import { Marquee } from "@workspace/ui/components/composed/marquee"

const MARQUEE_ITEMS = [
  "Air Cargo: Imphal (IXI) \u21c4 New Delhi (DEL)",
  "Surface Cargo: Imphal \u2192 New Delhi",
  "Pick & Drop: Available in Imphal",
  "Air Cargo: New Delhi (DEL) \u21c4 Imphal (IXI)",
  "Surface Cargo: New Delhi \u2192 Imphal",
  "Packaging: Professional & Secure",
  "Established 2009 \u00b7 15+ Years of Service",
  "Expanding to Northeast India States",
  "Track Your Shipment: AWB Number",
  "Air Cargo: Imphal \u21c4 Delhi \u00b7 Daily Flights",
  "Pick & Drop: Available in New Delhi",
  "Domestic Cargo \u00b7 GST Compliant Billing",
]

export function RouteMarquee() {
  return (
    <section data-slot="route-marquee" className="bg-bg-panel border-y border-border-default overflow-hidden relative z-30">
      <div className="w-full flex">
        <Marquee duration={60} pauseOnHover>
          {MARQUEE_ITEMS.map((item, i) => (
            <div key={i} className="flex items-center">
              <span className="mx-6 font-mono text-2xs md:text-xs whitespace-nowrap py-2.5 uppercase tracking-widest text-muted-foreground/80 font-medium select-none">
                {item}
              </span>
              <div className="w-1.5 h-1.5 rounded-none bg-border-strong mx-2" />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
