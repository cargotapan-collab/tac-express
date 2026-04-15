"use client"
import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface IsometricNetworkIllustrationProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean
}

export function IsometricNetworkIllustration({
  className,
  animated = true,
  ...props
}: IsometricNetworkIllustrationProps) {
  return (
    <div className={cn("w-full h-full flex items-center justify-center p-6", className)}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-full drop-shadow-sm"
        {...props}
      >
        {/* Core Geography Mesh */}
        <g className="stroke-muted-foreground opacity-15" strokeWidth="0.5">
          <path d="M 50,150 Q 150,50 250,100 T 350,200 Q 250,280 150,250 T 50,150 Z" />
          <path d="M 100,100 L 200,200 L 300,120 L 150,220 Z" />
        </g>

        {/* Global Connection Links */}
        <g strokeLinejoin="round" fill="none">
          <path d="M 120,120 L 200,160 L 280,100" className="stroke-border-strong" strokeWidth="1" />
          <path d="M 120,120 L 200,160 L 280,100" className="stroke-foreground opacity-70" strokeWidth="1.5" strokeDasharray="4 4" 
                style={animated ? { animation: "network-flow 2s linear infinite" } : {}} />
                
          <path d="M 200,160 L 200,240" className="stroke-border-strong" strokeWidth="1" />
          <path d="M 200,160 L 200,240" className="stroke-primary" strokeWidth="1.5" strokeDasharray="4 4" 
                style={animated ? { animation: "network-flow 1.5s linear infinite" } : {}} />
                
          <path d="M 280,100 L 320,180 L 200,240" className="stroke-border-strong" strokeWidth="1" />
          <path d="M 280,100 L 320,180 L 200,240" className="stroke-foreground opacity-40" strokeWidth="1" strokeDasharray="2 4" />
        </g>

        {/* Primary Data Centers (Nodes) */}
        {/* Node 1 (Top Left) */}
        <g transform="translate(120, 120)">
          <rect x="-15" y="-10" width="30" height="20" rx="0" className="fill-bg-surface stroke-border-strong" strokeWidth="1.5" />
          <rect x="-10" y="-5" width="20" height="10" rx="0" className="fill-bg-panel stroke-border-strong" strokeWidth="1" />
          {animated && <circle cx="0" cy="0" r="3" className="fill-primary animate-pulse" />}
        </g>

        {/* Node 2 (Top Right) */}
        <g transform="translate(280, 100)">
          <rect x="-15" y="-10" width="30" height="20" rx="0" className="fill-bg-surface stroke-border-strong" strokeWidth="1.5" />
          <rect x="-10" y="-5" width="20" height="10" rx="0" className="fill-bg-panel stroke-border-strong" strokeWidth="1" />
          {animated && <circle cx="0" cy="0" r="3" className="fill-primary animate-pulse" style={{ animationDelay: '500ms'}} />}
        </g>

        {/* Node 3 (Bottom Center) - Main Hub */}
        <g transform="translate(200, 240)">
          <rect x="-25" y="-15" width="50" height="30" rx="0" className="fill-bg-surface stroke-border-strong" strokeWidth="1.5" />
          <rect x="-20" y="-10" width="40" height="20" rx="0" className="fill-card stroke-border-strong" strokeWidth="1" />
          {animated && (
            <>
              <circle cx="-10" cy="0" r="3" className="fill-primary animate-pulse" />
              <circle cx="10" cy="0" r="3" className="fill-status-active animate-pulse" style={{ animationDelay: '700ms'}} />
            </>
          )}
        </g>

        {/* Floating Data Arrays */}
        <g className="opacity-60">
          <rect x="50" y="50" width="40" height="10" className="fill-muted stroke-border-strong" strokeWidth="1" />
          <line x1="55" y1="55" x2="75" y2="55" className="stroke-foreground" strokeWidth="1.5" />
          
          <rect x="300" y="240" width="50" height="20" className="fill-muted stroke-border-strong" strokeWidth="1" />
          <line x1="305" y1="245" x2="340" y2="245" className="stroke-foreground" strokeWidth="1.5" />
          <line x1="305" y1="252" x2="330" y2="252" className="stroke-muted-foreground" strokeWidth="1.5" />
        </g>

        <style>
          {`
            @keyframes network-flow {
              to { stroke-dashoffset: -8; }
            }
          `}
        </style>
      </svg>
    </div>
  )
}
