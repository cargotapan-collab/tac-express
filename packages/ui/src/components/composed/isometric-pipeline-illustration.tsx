"use client"
import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface IsometricPipelineIllustrationProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean
}

export function IsometricPipelineIllustration({
  className,
  animated = true,
  ...props
}: IsometricPipelineIllustrationProps) {
  return (
    <div className={cn("w-full h-full flex items-center justify-center p-6", className)}>
      <svg
        viewBox="0 0 1000 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-full drop-shadow-sm"
        {...props}
      >
        {/* Core Line / Flow Track */}
        <path d="M 100,150 L 900,150" className="stroke-border-strong opacity-40" strokeWidth="2" />
        <path d="M 100,150 L 900,150" className="stroke-primary" strokeWidth="3" strokeDasharray="10 15" 
              style={animated ? { animation: "pipeline-flow 1.5s linear infinite" } : {}} />

        {/* Platform 1: Booking/Entry */}
        <g transform="translate(200, 150)">
          <polygon points="-60,0 0,-30 60,0 0,30" className="fill-bg-surface stroke-border-strong" strokeWidth="1.5" />
          <rect x="-20" y="-50" width="40" height="40" className="fill-card stroke-border-strong" strokeWidth="1" />
          <line x1="-10" y1="-40" x2="10" y2="-40" className="stroke-foreground" strokeWidth="1.5" />
          <line x1="-10" y1="-30" x2="5" y2="-30" className="stroke-muted-foreground" strokeWidth="1.5" />
          {animated && <circle cx="0" cy="0" r="4" className="fill-primary animate-pulse" />}
        </g>

        {/* Platform 2: Processing/Scanning */}
        <g transform="translate(500, 150)">
          <polygon points="-60,0 0,-30 60,0 0,30" className="fill-card stroke-primary" strokeWidth="1.5" />
          {animated && <polygon points="-60,0 0,-30 60,0 0,30" className="fill-primary opacity-10 animate-pulse" />}
          {/* Scanner Arch */}
          <path d="M -30,-15 L -30,-60 L 30,-60 L 30,-15" fill="none" className="stroke-border-strong" strokeWidth="2" />
          <path d="M -40,-15 L -30,-15 M 30,-15 L 40,-15" className="stroke-primary" strokeWidth="2" />
          {/* Active Scan Laser */}
          {animated && <line x1="-30" y1="-30" x2="30" y2="-30" className="stroke-primary opacity-60" strokeWidth="2" />}
        </g>

        {/* Platform 3: Logistics/Tracking */}
        <g transform="translate(800, 150)">
          <polygon points="-60,0 0,-30 60,0 0,30" className="fill-bg-surface stroke-border-strong" strokeWidth="1.5" />
          <rect x="-25" y="-40" width="50" height="30" className="fill-card stroke-border-strong" strokeWidth="1" />
          {/* Globe/Map Abstract */}
          <circle cx="0" cy="-25" r="10" fill="none" className="stroke-muted-foreground opacity-50" strokeWidth="1" />
          <path d="M -10,-25 Q 0,-35 10,-25 Q 0,-15 -10,-25" fill="none" className="stroke-muted-foreground opacity-50" strokeWidth="0.5" />
          {animated && <circle cx="0" cy="0" r="4" className="fill-status-active animate-pulse" style={{ animationDelay: '500ms'}} />}
        </g>

        {/* HUD Data Floating Elements */}
        <g className="animate-in fade-in duration-1000 delay-300">
          <g transform="translate(350, 80)">
            <rect x="0" y="0" width="60" height="20" className="fill-bg-panel stroke-border-strong" strokeWidth="1" />
            <circle cx="10" cy="10" r="3" className="fill-primary" />
            <line x1="20" y1="10" x2="50" y2="10" className="stroke-foreground opacity-50" strokeWidth="1" />
          </g>
          <g transform="translate(650, 200)">
            <rect x="0" y="0" width="60" height="20" className="fill-bg-panel stroke-border-strong" strokeWidth="1" />
            <circle cx="10" cy="10" r="3" className="fill-status-active" />
            <line x1="20" y1="10" x2="50" y2="10" className="stroke-foreground opacity-50" strokeWidth="1" />
          </g>
        </g>

        <style>
          {`
            @keyframes pipeline-flow {
              to { stroke-dashoffset: -25; }
            }
          `}
        </style>
      </svg>
    </div>
  )
}
