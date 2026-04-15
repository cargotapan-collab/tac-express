"use client"
import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface IsometricAnalyticsIllustrationProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean
}

export function IsometricAnalyticsIllustration({
  className,
  animated = true,
  ...props
}: IsometricAnalyticsIllustrationProps) {
  return (
    <div className={cn("w-full h-full flex items-center justify-center p-4", className)}>
      <svg
        viewBox="0 0 600 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-full drop-shadow-sm"
        {...props}
      >
        {/* Abstract Isometric Data Floor */}
        <g className="stroke-muted-foreground opacity-20" strokeWidth="1" strokeDasharray="4 4">
          <line x1="50" y1="180" x2="550" y2="180" />
          <line x1="50" y1="150" x2="550" y2="150" />
          <line x1="50" y1="120" x2="550" y2="120" />
          <line x1="50" y1="90" x2="550" y2="90" />
        </g>

        {/* Data Bars */}
        <g transform="translate(100, 180) scale(1, -1)">
          {/* Bar 1 */}
          <rect x="0" y="0" width="40" height="60" className="fill-bg-panel stroke-border-strong hover:fill-bg-surface transition-colors" strokeWidth="1.5" />
          {/* Bar 2 */}
          <rect x="70" y="0" width="40" height="90" className="fill-bg-panel stroke-border-strong hover:fill-bg-surface transition-colors" strokeWidth="1.5" />
          {/* Bar 3 (Highlight) */}
          <rect x="140" y="0" width="40" height="140" className="fill-card stroke-primary" strokeWidth="1.5" />
          {animated && <rect x="140" y="0" width="40" height="140" className="fill-primary opacity-10 animate-pulse" />}
          {/* Bar 4 */}
          <rect x="210" y="0" width="40" height="110" className="fill-bg-panel stroke-border-strong hover:fill-bg-surface transition-colors" strokeWidth="1.5" />
          {/* Bar 5 */}
          <rect x="280" y="0" width="40" height="160" className="fill-card stroke-border-strong hover:fill-bg-surface transition-colors" strokeWidth="1.5" />
          {/* Bar 6 */}
          <rect x="350" y="0" width="40" height="130" className="fill-bg-panel stroke-border-strong hover:fill-bg-surface transition-colors" strokeWidth="1.5" />
        </g>

        {/* Trend Line */}
        <g>
          <path 
            d="M 120,100 L 190,60 L 260,20 L 330,50 L 400,-10 L 470,30" 
            className="stroke-foreground" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round"
            strokeLinejoin="round"
            style={animated ? { strokeDasharray: "1000", strokeDashoffset: "1000", animation: "draw-line 2s ease-out forwards" } : {}}
          />
          {animated && (
            <circle cx="260" cy="20" r="4" className="fill-primary animate-in fade-in zoom-in delay-1000 duration-500 fill-mode-both" />
          )}
          {animated && (
            <circle cx="400" cy="-10" r="4" className="fill-primary animate-in fade-in zoom-in delay-1000 duration-500 fill-mode-both" />
          )}
        </g>

        {/* Target/Threshold Line */}
        <line x1="80" y1="40" x2="520" y2="40" className="stroke-status-active opacity-60" strokeWidth="1" strokeDasharray="4 2" />

        <style>
          {`
            @keyframes draw-line {
              to { stroke-dashoffset: 0; }
            }
          `}
        </style>
      </svg>
    </div>
  )
}
