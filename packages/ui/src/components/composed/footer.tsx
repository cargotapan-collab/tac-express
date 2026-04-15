import * as React from "react"
import Link from "next/link"
import { Icon } from "@workspace/ui/icons"

export function Footer() {
  return (
    <footer className="bg-bg-surface pt-20 pb-10 border-t border-border-default">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-8 h-8 rounded-none bg-foreground text-background flex items-center justify-center transition-transform group-hover:scale-105">
                <Icon name="package" className="size-4" />
              </div>
              <span className="font-sans font-semibold tracking-tight text-foreground text-lg">TAC Express</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 font-sans">
              Domestic Cargo Specialists <br />
              Imphal &amp; New Delhi
            </p>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-none border border-border flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Icon name="github" className="size-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold mb-6 text-foreground">Services</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Air Cargo</Link></li>
              <li><Link href="#features" className="hover:text-foreground transition-colors">Surface Cargo</Link></li>
              <li><Link href="#features" className="hover:text-foreground transition-colors">Packaging</Link></li>
              <li><Link href="#tracking" className="hover:text-foreground transition-colors">Track a Shipment</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold mb-6 text-foreground">Company</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About TAC Express</Link></li>
              <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="mailto:contact@tacexpress.in" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Expanding to Northeast India</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-sm font-semibold mb-6 text-foreground">Legal</h4>
            <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Data Processing Addendum</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-mono">
          <div>
            &copy; {new Date().getFullYear()} Tapan Associate Cargo. All rights reserved.
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-none bg-foreground" />
            <span className="text-foreground font-medium tracking-wide">Imphal · New Delhi · Northeast India</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
