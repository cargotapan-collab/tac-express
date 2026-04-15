import * as React from "react"
import { Icon } from "@workspace/ui/icons"

const features = [
  {
    title: "Air Cargo",
    description: "Fast, reliable air freight between Imphal (IXI) and New Delhi (DEL). We handle the full cycle — pickup, airline coordination, documentation, and last-mile delivery at destination.",
    icon: "location" as const,
    span: "lg:col-span-8 lg:row-span-2",
    ref: "Air Cargo / 01",
    illustration: "/assets/illustrations/air-cargo.png",
    illustrationAlt: "Cargo airplane flying the Imphal to New Delhi route",
    illustrationClass: "w-full h-full object-contain object-center",
  },
  {
    title: "Surface Cargo",
    description: "Cost-effective road freight for bulk and heavy shipments on the Imphal–Delhi corridor. Reliable scheduling with door-to-door service.",
    icon: "invoice" as const,
    span: "lg:col-span-4",
    ref: "Surface / 02",
    illustration: "/assets/illustrations/surface-cargo.png",
    illustrationAlt: "Cargo truck on the road for surface freight",
    illustrationClass: "w-full h-full object-contain object-center",
  },
  {
    title: "Packaging & Pick-up",
    description: "Professional packaging solutions and scheduled pick-up from your doorstep across Imphal and New Delhi.",
    icon: "barcode" as const,
    span: "lg:col-span-4",
    ref: "Pickup / 03",
    illustration: "/assets/illustrations/packaging-pickup.png",
    illustrationAlt: "Stacked shipping boxes and professional packaging",
    illustrationClass: "w-full h-full object-contain object-center",
  },
  {
    title: "Live Shipment Tracking",
    description: "Track every consignment in real time using your AWB number. Stay updated from dispatch to delivery across our entire network.",
    icon: "robot" as const,
    span: "lg:col-span-12",
    ref: "Tracking / 04",
    illustration: "/assets/illustrations/shipment-tracking.png",
    illustrationAlt: "Live shipment tracking timeline dashboard",
    illustrationClass: "w-full h-full object-cover object-center",
  },
]

export function FeatureBento() {
  return (
    <section data-slot="feature-bento" id="features" className="py-32 bg-bg-base relative border-t border-border-default">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="mb-20 max-w-3xl">
          <span className="font-mono text-xs font-medium tracking-widest text-muted-foreground/70 mb-4 block uppercase">Our Services</span>
          <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-foreground">
            Everything your shipment needs, <br className="hidden sm:block" />
            <span className="text-muted-foreground">under one roof.</span>
          </h2>
        </div>

        {/* Elegant SaaS Bento Grid 2.0 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className={`glass-card p-6 md:p-8 transition-colors duration-300 hover:border-border-strong group ${feature.span} relative flex flex-col justify-between overflow-hidden cursor-default min-h-80`}
            >
              <div className="flex items-start justify-between mb-4 relative z-10 shrink-0">
                <div className="size-12 rounded-none border border-border-strong flex items-center justify-center bg-card text-foreground shadow-sm transition-all duration-300">
                  <Icon name={feature.icon} className="size-5 text-foreground transition-all duration-300" />
                </div>
                <span className="font-mono text-2xs font-medium text-muted-foreground tracking-wider px-3 py-1 rounded-none border border-border-strong bg-card relative z-10 backdrop-blur-md">
                  {feature.ref}
                </span>
              </div>
              
              {/* Illustration Zone */}
              <div className="relative z-0 flex-1 w-full min-h-[140px] flex items-center justify-center pointer-events-none overflow-hidden">
                <img
                  src={feature.illustration}
                  alt={feature.illustrationAlt}
                  loading="lazy"
                  decoding="async"
                  className={feature.illustrationClass}
                />
              </div>
              
              <div className="relative z-10 mt-6 shrink-0 inline-block bg-card/60 backdrop-blur-md p-2 -mx-2 border border-transparent group-hover:border-border-subtle transition-colors">
                <h3 className="font-sans text-2xl mb-2 font-semibold tracking-tight text-foreground">{feature.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-sm">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
