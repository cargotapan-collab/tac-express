"use client"
import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface IsometricHardwareIllustrationProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean
}

export function IsometricHardwareIllustration({
  className,
  animated = true,
  ...props
}: IsometricHardwareIllustrationProps) {
  return (
    <div className={cn("w-full h-full flex items-center justify-center p-4", className)}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-full drop-shadow-sm"
        {...props}
      >
        {/* Background Grid Context */}
        <g className="stroke-muted-foreground opacity-10" strokeWidth="1" strokeDasharray="2 2">
          <line x1="50" y1="200" x2="350" y2="200" />
          <line x1="50" y1="150" x2="350" y2="150" />
        </g>

        {/* The Package/Box */}
        <g transform="translate(100, 160)">
          <rect x="0" y="0" width="100" height="80" className="fill-bg-surface stroke-border-strong" strokeWidth="1.5" />
          {/* Barcode Label */}
          <rect x="20" y="20" width="60" height="40" className="fill-card stroke-border-strong" strokeWidth="1" />
          <g className="stroke-foreground" strokeWidth="2">
            <line x1="25" y1="25" x2="25" y2="55" />
            <line x1="30" y1="25" x2="30" y2="55" strokeWidth="3" />
            <line x1="38" y1="25" x2="38" y2="55" />
            <line x1="45" y1="25" x2="45" y2="55" strokeWidth="4" />
            <line x1="55" y1="25" x2="55" y2="55" />
            <line x1="62" y1="25" x2="62" y2="55" strokeWidth="2" />
            <line x1="70" y1="25" x2="70" y2="55" />
          </g>
        </g>

        {/* The Scanning Device (Abstract) */}
        <g transform="translate(260, 80) rotate(-15)">
          {/* Device Body */}
          <polygon points="0,0 80,0 70,100 10,100" className="fill-card stroke-border-strong" strokeWidth="1.5" />
          {/* Screen */}
          <polygon points="15,15 65,15 60,50 20,50" className="fill-bg-panel stroke-primary" strokeWidth="1" />
          {/* Screen Content */}
          <line x1="25" y1="25" x2="55" y2="25" className="stroke-primary" strokeWidth="2" />
          <line x1="25" y1="35" x2="45" y2="35" className="stroke-muted-foreground" strokeWidth="1.5" />
          {/* Scan Head/Trigger Section */}
          <path d="M -10,0 L 0,0 L 10,100 L 0,100 Z" className="fill-bg-surface stroke-border-strong" strokeWidth="1.5" />
          {/* Trigger */}
          <rect x="-15" y="40" width="5" height="20" className="fill-primary stroke-border-strong" strokeWidth="1" />
        </g>

        {/* Scan Beam (Animated) */}
        {animated && (
          <g className="animate-pulse">
            <polygon 
              points="245,95 100,165 200,165" 
              className="fill-primary opacity-20" 
              style={{ mixBlendMode: 'screen' }}
            />
            {/* The active laser line crossing the barcode */}
            <line 
              x1="110" y1="200" 
              x2="190" y2="200" 
              className="stroke-status-active" 
              strokeWidth="2" 
            />
          </g>
        )}

      </svg>
    </div>
  )
}
