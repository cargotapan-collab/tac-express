import * as React from "react"
import { Icon } from "@workspace/ui/icons"

const steps = [
  {
    num: "01",
    title: "Book Your Shipment",
    description: "Log in to the TAC Express dashboard and raise a booking. Add consignee details, package dimensions, and generate your AWB number instantly.",
    icon: "package" as const,
  },
  {
    num: "02",
    title: "Pickup & Dispatch",
    description: "Schedule a doorstep pickup across Imphal or New Delhi. Our team collects, packages if needed, and dispatches via air or surface based on your choice.",
    icon: "barcode" as const,
  },
  {
    num: "03",
    title: "Track to Delivery",
    description: "Monitor your shipment in real time using your AWB number. Get updates at every milestone — from dispatch to arrival at the destination hub and final delivery.",
    icon: "dashboard" as const,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-bg-base py-32 border-t border-border-default">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs font-medium tracking-widest text-muted-foreground/70 mb-4 block uppercase">How It Works</span>
          <h2 className="font-sans text-3xl md:text-5xl font-semibold text-foreground tracking-tight mb-6">
            Your shipment, step by step.
          </h2>
          <p className="text-lg text-muted-foreground">
            From booking to final delivery — a simple, transparent process managed end-to-end by our Imphal and New Delhi teams.
          </p>
        </div>

        {/* Pipeline Illustration Container */}
        <div className="mb-16 w-full aspect-[21/9] max-h-[400px] relative flex items-center justify-center overflow-hidden">
          <img
            src="/assets/illustrations/pipeline-flow.png"
            alt="Three-step logistics pipeline: book, pickup, deliver"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain object-center"
          />
        </div>

        {/* Connected Steps */}
        <div className="relative">
          {/* Connecting Line — strong, full width */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-[2px] bg-border-strong" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div 
                key={i} 
                className="relative flex flex-col items-center text-center group"
              >
                {/* Icon Node — grounded */}
                <div className="relative z-10 flex items-center justify-center size-24 mb-8 bg-card border border-border-strong shadow-sm transition-colors duration-300 group-hover:border-foreground/30">
                  <div className="absolute top-2 left-2 text-2xs font-mono font-semibold text-muted-foreground">{step.num}</div>
                  <Icon name={step.icon} className="size-7 text-foreground transition-all duration-300" />
                </div>
                
                <h3 className="font-sans text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
