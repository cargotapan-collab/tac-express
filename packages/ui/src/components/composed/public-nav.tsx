"use client"

import * as React from "react"
import Link from "next/link"
import { Icon } from "@workspace/ui/icons"
import { Button } from "@workspace/ui/components/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@workspace/ui/components/primitives/sheet"
import { AnimatedThemeToggler } from "@workspace/ui/components/composed/animated-theme-toggler"
import { cn } from "@workspace/ui/lib/utils"

export function PublicNav() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-bg-panel border-b border-border shadow-none"
          : "bg-transparent border-b border-transparent py-2"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-none bg-foreground text-background flex items-center justify-center transition-transform group-hover:scale-105">
            <Icon name="package" className="size-4" />
          </div>
          <span className="font-sans font-semibold tracking-tight text-lg text-foreground">TAC Express</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors relative group/link">
            Services
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground group-hover/link:w-full transition-all duration-300" />
          </Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors relative group/link">
            How it Works
          </Link>
          <Link href="#tracking" className="text-muted-foreground hover:text-foreground transition-colors relative group/link">
            Track Shipment
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <AnimatedThemeToggler />
          <Button variant="ghost" className="hover:bg-muted font-medium" asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button className="transition-none rounded-none shadow-none" asChild>
            <Link href="/sign-in">
              Dashboard <Icon name="arrowRight" className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <AnimatedThemeToggler />
          {mounted && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu" className="text-foreground">
                  <Icon name="menu" className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="border-l border-border bg-bg-panel">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex flex-col gap-8 mt-8">
                  <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-none bg-foreground text-background flex items-center justify-center">
                      <Icon name="package" className="size-4" />
                    </div>
                    <span className="font-sans font-semibold tracking-tight text-lg text-foreground">TAC Express</span>
                  </Link>
                  <nav className="flex flex-col gap-4 text-sm font-medium">
                    <Link href="#features" className="text-muted-foreground hover:text-foreground pl-3 border-l-2 border-transparent hover:border-foreground transition-colors">
                      Services
                    </Link>
                    <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground pl-3 border-l-2 border-transparent hover:border-foreground transition-colors">
                      How it Works
                    </Link>
                    <Link href="#tracking" className="text-muted-foreground hover:text-foreground pl-3 border-l-2 border-transparent hover:border-foreground transition-colors">
                      Track Shipment
                    </Link>
                  </nav>
                  <div className="flex flex-col gap-3 mt-4">
                    <Button variant="outline" className="w-full justify-center" asChild>
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                    <Button className="w-full justify-center transition-none rounded-none shadow-none" asChild>
                      <Link href="/sign-in">Go to Dashboard</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}
