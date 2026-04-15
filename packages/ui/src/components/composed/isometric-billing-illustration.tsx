"use client"
import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"

interface IsometricBillingIllustrationProps extends React.SVGProps<SVGSVGElement> {
  animated?: boolean
}

export function IsometricBillingIllustration({
  className,
  animated = true,
  ...props
}: IsometricBillingIllustrationProps) {
  return (
    <div className={cn("w-full h-full flex items-center justify-center p-4", className)}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-full drop-shadow-sm"
        {...props}
      >
        {/* Layer 1: Base Payment Document */}
        <g transform="translate(150, 180) rotate(-15)">
          <rect x="-80" y="-100" width="160" height="200" className="fill-bg-panel stroke-border-strong" strokeWidth="1.5" />
          {/* Document Lines */}
          <line x1="-50" y1="-60" x2="10" y2="-60" className="stroke-muted-foreground opacity-50" strokeWidth="2" />
          <line x1="-50" y1="-40" x2="40" y2="-40" className="stroke-muted-foreground opacity-30" strokeWidth="2" />
          <line x1="-50" y1="-20" x2="30" y2="-20" className="stroke-muted-foreground opacity-30" strokeWidth="2" />
          
          {/* Table Outline */}
          <rect x="-50" y="10" width="100" height="50" className="fill-bg-surface stroke-border-strong" strokeWidth="1" />
          <line x1="-50" y1="35" x2="50" y2="35" className="stroke-border-strong" strokeWidth="1" />
          
          {/* Total Line */}
          <line x1="0" y1="75" x2="50" y2="75" className="stroke-foreground" strokeWidth="2" />
        </g>

        {/* Layer 2: Main Active Invoice (Floating) */}
        <g 
          transform="translate(200, 150) rotate(5)" 
          className={cn(animated && "animate-in fade-in slide-in-from-bottom-4 duration-1000")}
        >
          <rect x="-90" y="-120" width="180" height="240" className="fill-card stroke-border-strong shadow-sm" strokeWidth="1.5" />
          
          {/* Header */}
          <rect x="-60" y="-90" width="40" height="40" className="fill-primary opacity-10" />
          <rect x="-60" y="-90" width="40" height="40" className="stroke-primary" strokeWidth="1.5" />
          <path d="M-50 -70 L-45 -65 L-35 -75" className="stroke-primary" strokeWidth="2" fill="none" />
          
          <line x1="-10" y1="-85" x2="60" y2="-85" className="stroke-foreground" strokeWidth="3" />
          <line x1="-10" y1="-70" x2="40" y2="-70" className="stroke-muted-foreground" strokeWidth="2" />

          {/* Line Items */}
          <g transform="translate(0, -30)">
            <rect x="-60" y="0" width="120" height="15" className="fill-bg-surface stroke-border-strong" strokeWidth="1" />
            <line x1="-50" y1="7.5" x2="-10" y2="7.5" className="stroke-foreground" strokeWidth="2" />
            <line x1="30" y1="7.5" x2="50" y2="7.5" className="stroke-muted-foreground" strokeWidth="2" />
            
            <rect x="-60" y="20" width="120" height="15" className="fill-bg-surface stroke-border-strong" strokeWidth="1" />
            <line x1="-50" y1="27.5" x2="0" y2="27.5" className="stroke-foreground" strokeWidth="2" />
            <line x1="30" y1="27.5" x2="50" y2="27.5" className="stroke-muted-foreground" strokeWidth="2" />
          </g>

          {/* Action Button */}
          <rect x="-60" y="50" width="120" height="30" className="fill-bg-surface stroke-primary" strokeWidth="1.5" />
          {animated && (
            <rect x="-60" y="50" width="120" height="30" className="fill-primary opacity-10 animate-pulse" />
          )}
          <line x1="-20" y1="65" x2="20" y2="65" className="stroke-primary" strokeWidth="2" />
        </g>

        {/* Floating Data Nodes (Finance elements) */}
        <g className={cn(animated && "animate-in zoom-in duration-700 delay-300")}>
          <circle cx="80" cy="100" r="15" className="fill-card stroke-border-strong" strokeWidth="1.5" />
          <path d="M75 95 L80 100 L87 90" className="stroke-status-active" strokeWidth="2" fill="none" />
        </g>
        
        <g className={cn(animated && "animate-in zoom-in duration-700 delay-500")}>
          <rect x="290" y="200" width="40" height="30" className="fill-card stroke-border-strong" strokeWidth="1.5" />
          <circle cx="310" cy="215" r="4" className="stroke-primary" strokeWidth="1.5" fill="none" />
        </g>
      </svg>
    </div>
  )
}
