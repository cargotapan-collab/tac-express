"use client"

import * as React from "react"
import Link from "next/link"
import { Icon } from "@workspace/ui/icons"
import { Button } from "@workspace/ui/components/button"
import { GridBackground } from "@workspace/ui/components/composed/grid-background"
import { TextMatrixRain } from "@workspace/ui/components/composed/text-matrix-rain"
import { IsometricHeroIllustration } from "@workspace/ui/components/composed/isometric-hero-illustration"
import { LottieHero } from "@workspace/ui/components/composed/lottie-hero"

interface HeroSectionProps {
  animationData?: object
}

export function HeroSection({ animationData }: HeroSectionProps) {
  return (
    <section
      data-slot="hero-section"
      className="relative overflow-hidden min-h-screen flex flex-col justify-center pt-24 bg-background"
    >
      {/* Strict flat background with specific mask */}
      <div className="absolute inset-0 z-0 bg-background" />
      <GridBackground columns={12} className="opacity-5" mask="none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between gap-16">

        {/* Left Panel: Content */}
        <div className="flex-1 w-full max-w-2xl flex flex-col justify-center text-center lg:text-left z-10">
          <div className="flex flex-col">
            {/* Static badge — factual credentials must NOT animate */}
            <div className="inline-flex items-center gap-2 rounded-none glass-card px-3 py-1 mb-8 self-start animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards">
              <div className="w-1.5 h-1.5 rounded-none bg-foreground animate-pulse" />
              <span className="font-mono text-xs font-medium text-muted-foreground tracking-wide">
                15+ Years · Imphal &amp; New Delhi
              </span>
            </div>

            <h1 className="font-sans text-5xl sm:text-6xl lg:text-7xl font-semibold leading-tight tracking-tight mb-6 text-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 ease-out fill-mode-forwards">
              <TextMatrixRain duration={1800} repeatInterval={8000}>
                Northeast India&apos;s most trusted cargo partner.
              </TextMatrixRain>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground font-sans max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 ease-out fill-mode-forwards">
              Air cargo, surface freight, packaging, and pick &amp; drop — connecting Imphal and New Delhi with precision since 2009.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 ease-out fill-mode-forwards">
              <Button size="lg" className="btn-primary h-12 px-8 text-base" asChild>
                <Link href="/sign-in">
                  Book a Shipment <Icon name="arrowRight" className="ml-2" size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base font-medium transition-colors border-border-strong hover:bg-muted" asChild>
                <Link href="#tracking">
                  Track Your Cargo
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel: Illustration */}
        <div className="flex-1 w-full flex items-center justify-center lg:justify-end relative h-full">
          {/* Constrain width and height to prevent Massive Expansion Bug */}
          <div className="w-full max-w-[500px] aspect-square relative z-10 animate-in fade-in slide-in-from-right-8 duration-1000 ease-out fill-mode-forwards flex items-center justify-center">
            {animationData ? (
              <LottieHero animationData={animationData} className="w-full h-full" />
            ) : (
              <IsometricHeroIllustration className="w-full h-full" />
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
