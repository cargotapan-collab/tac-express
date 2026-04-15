"use client"

import * as React from "react"
import Lottie from "lottie-react"
import { cn } from "@workspace/ui/lib/utils"

interface LottieHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  animationData: object
}

export function LottieHero({ animationData, className, ...props }: LottieHeroProps) {
  return (
    <div 
      className={cn("w-full h-full flex items-center justify-center overflow-hidden", className)} 
      {...props}
    >
      <Lottie 
        animationData={animationData} 
        loop={true} 
        autoplay={true}
        style={{ width: "100%", height: "100%" }}
        rendererSettings={{
          preserveAspectRatio: "xMidYMid slice"
        }}
      />
    </div>
  )
}
