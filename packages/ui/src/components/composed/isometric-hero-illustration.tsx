"use client"
import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface IsometricHeroIllustrationProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean
}

export function IsometricHeroIllustration({
  className,
  animated = true,
  ...props
}: IsometricHeroIllustrationProps) {
  return (
    <div className={cn("w-full h-full flex items-center justify-center p-8", className)}>
      <svg
        viewBox="0 0 600 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-full drop-shadow-sm"
        {...props}
      >
        {/* Ambient Grid Background */}
        <g className="stroke-border-strong opacity-30" strokeWidth="1" strokeDasharray="4 4">
          <line x1="0" y1="200" x2="600" y2="200" />
          <line x1="300" y1="0" x2="300" y2="400" />
          <polygon points="100,200 300,100 500,200 300,300" fill="none" />
          <polygon points="20,200 300,60 580,200 300,340" fill="none" />
        </g>

        {/* Global Hub Map (Abstract) */}
        <path d="M150,180 Q200,120 300,160 T450,150" fill="none" className="stroke-muted-foreground opacity-20" strokeWidth="2" />
        <path d="M120,220 Q220,260 300,210 T480,230" fill="none" className="stroke-muted-foreground opacity-20" strokeWidth="2" />

        {/* Central Command Base Layer */}
        <path d="M 200,280 L 300,330 L 400,280 L 300,230 Z" className="fill-bg-surface stroke-border-strong" strokeWidth="1" />
        <path d="M 210,275 L 300,320 L 390,275 L 300,230 Z" className="fill-card stroke-border-strong" strokeWidth="1" />
        <path d="M 200,280 L 200,290 L 300,340 L 300,330 Z" className="fill-bg-panel stroke-border-strong" strokeWidth="1" />
        <path d="M 300,330 L 300,340 L 400,290 L 400,280 Z" className="fill-bg-panel stroke-border-strong" strokeWidth="1" />

        {/* Main Data Core */}
        <g className="animate-in fade-in zoom-in duration-1000">
          <path d="M 250,220 L 300,245 L 350,220 L 300,195 Z" className="fill-bg-surface stroke-border-strong" strokeWidth="1.5" />
          <path d="M 250,220 L 250,260 L 300,285 L 300,245 Z" className="fill-bg-panel stroke-border-strong" strokeWidth="1.5" />
          <path d="M 300,245 L 300,285 L 350,260 L 350,220 Z" className="fill-bg-base stroke-border-strong" strokeWidth="1.5" />
          {/* Core Accent Lines */}
          <line x1="260" y1="235" x2="260" y2="255" className="stroke-primary" strokeWidth="2" />
          <line x1="340" y1="235" x2="340" y2="255" className="stroke-primary" strokeWidth="2" />
        </g>

        {/* Active Route Streams (Mixed animation lines) */}
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left Route */}
          <path d="M120,180 L 180,150 L 250,185" className="stroke-border-strong" strokeWidth="1" />
          <path d="M120,180 L 180,150 L 250,185" className="stroke-foreground" strokeWidth="2" strokeDasharray="8 8" 
                style={animated ? { animation: "dash-scroll 2s linear infinite" } : {}} />
          
          {/* Right Route */}
          <path d="M480,180 L 420,150 L 350,185" className="stroke-border-strong" strokeWidth="1" />
          <path d="M480,180 L 420,150 L 350,185" className="stroke-foreground" strokeWidth="2" strokeDasharray="8 8" 
                style={animated ? { animation: "dash-scroll-rev 2s linear infinite" } : {}} />
                
          {/* Bottom Route (Outgoing) */}
          <path d="M300,285 L 300,360 L 400,390" className="stroke-border-strong" strokeWidth="1" />
          <path d="M300,285 L 300,360 L 400,390" className="stroke-primary" strokeWidth="2" strokeDasharray="10 10" 
                style={animated ? { animation: "dash-scroll 1.5s linear infinite" } : {}} />

          {/* Left Outgoing */}
          <path d="M250,260 L 180,295 L 80,245" className="stroke-border-strong" strokeWidth="1" />
          <path d="M250,260 L 180,295 L 80,245" className="stroke-primary" strokeWidth="2" strokeDasharray="10 10" 
                style={animated ? { animation: "dash-scroll 1.5s linear infinite" } : {}} />
        </g>

        {/* Floating Data Nodes (Packages/Points) */}
        <g>
          {/* Node 1 (Input Left) */}
          <rect x="110" y="170" width="20" height="20" transform="scale(1, 0.5) rotate(45 120 180)" 
                className="fill-bg-surface stroke-border-strong" strokeWidth="2" />
          {animated && <circle cx="120" cy="180" r="4" className="fill-primary animate-pulse" />}
          
          {/* Node 2 (Input Right) */}
          <rect x="470" y="170" width="20" height="20" transform="scale(1, 0.5) rotate(45 480 180)" 
                className="fill-bg-surface stroke-border-strong" strokeWidth="2" />
          {animated && <circle cx="480" cy="180" r="4" className="fill-primary animate-pulse" style={{ animationDelay: '500ms'}}/>}
          
          {/* Node 3 (Output Bottom Right) */}
          <rect x="390" y="380" width="20" height="20" transform="scale(1, 0.5) rotate(45 400 390)" 
                className="fill-bg-surface stroke-border-strong" strokeWidth="2" />
          {animated && <circle cx="400" cy="390" r="4" className="fill-status-active animate-pulse" style={{ animationDelay: '200ms'}}/>}

          {/* Node 4 (Output Bottom Left) */}
          <rect x="70" y="235" width="20" height="20" transform="scale(1, 0.5) rotate(45 80 245)" 
                className="fill-bg-surface stroke-border-strong" strokeWidth="2" />
          {animated && <circle cx="80" cy="245" r="4" className="fill-status-active animate-pulse" style={{ animationDelay: '800ms'}}/>}
        </g>

        {/* UI HUD Overlays */}
        <g className="animate-in fade-in duration-1000 delay-500">
          <rect x="50" y="60" width="120" height="40" className="fill-card stroke-border-strong" strokeWidth="1" />
          <line x1="60" y1="75" x2="140" y2="75" className="stroke-muted-foreground" strokeWidth="2" />
          <line x1="60" y1="85" x2="100" y2="85" className="stroke-muted-foreground opacity-50" strokeWidth="2" />
          <circle cx="155" cy="80" r="3" className="fill-status-active" />

          <rect x="430" y="80" width="100" height="60" className="fill-card stroke-border-strong" strokeWidth="1" />
          <rect x="440" y="90" width="20" height="40" className="fill-muted stroke-border-strong" strokeWidth="1" />
          <rect x="465" y="110" width="20" height="20" className="fill-primary opacity-80" />
          <rect x="490" y="100" width="20" height="30" className="fill-muted stroke-border-strong" strokeWidth="1" />
        </g>

        <style>
          {`
            @keyframes dash-scroll {
              to { stroke-dashoffset: -16; }
            }
            @keyframes dash-scroll-rev {
              to { stroke-dashoffset: 16; }
            }
          `}
        </style>
      </svg>
    </div>
  )
}
