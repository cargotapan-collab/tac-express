"use client"

import * as React from "react"
import { Icon } from "@workspace/ui/icons"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"

export function TrackingBox() {
  const [trackingId, setTrackingId] = React.useState("")

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackingId.trim()) return
    // In actual implementation, this will route to /track/[id]
    console.log("Tracking:", trackingId)
  }

  return (
    <section data-slot="tracking-box" id="tracking" className="relative z-20 py-24 px-4 bg-bg-base border-b border-border-default">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="font-sans text-3xl font-semibold tracking-tight text-foreground mb-3">Track Your Shipment</h2>
          <p className="text-muted-foreground">Enter your AWB number or consignment ID to get real-time status updates.</p>
        </div>

        <div className="glass-card p-2 md:p-3 max-w-3xl mx-auto transition-all focus-within:ring-1 focus-within:ring-foreground/50 focus-within:border-foreground/50">
          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Icon 
                name="barcode" 
                className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground/60" 
                size={22}
              />
              <Input
                className="h-16 pl-14 text-xl font-mono placeholder:text-muted-foreground/30 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 !outline-none shadow-none"
                placeholder="Enter tracking ID..."
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center justify-center px-2 py-1 bg-muted/40 rounded-none border border-border/30">
                <div className="size-1.5 rounded-none bg-foreground mr-2" />
                <span className="font-mono text-3xs uppercase tracking-widest text-muted-foreground font-semibold">Ready</span>
              </div>
            </div>
            <Button type="submit" size="lg" className="btn-primary h-14 px-8 w-full sm:w-auto text-base font-medium active:scale-95">
              Locate Cargo
            </Button>
          </form>
        </div>
        
        <div className="mt-6 flex justify-center text-xs font-mono text-muted-foreground">
          <button className="flex items-center gap-2 hover:text-foreground transition-colors hover:bg-muted/50 px-3 py-1.5 rounded-none border border-transparent hover:border-border/50">
            <Icon name="qr" size={16} />
            <span>Use Camera Scanner</span>
          </button>
        </div>
      </div>
    </section>
  )
}

