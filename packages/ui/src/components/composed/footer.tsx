import * as React from "react"
import Link from "next/link"
import { Icon } from "@workspace/ui/icons"

export function Footer() {
  return (
    <footer className="bg-card pt-24 pb-12 border-t-2 border-primary/20 shadow-brutal-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center transition-transform duration-300 group-hover:scale-105 mb-6">
              <span className="font-sans font-black italic text-primary text-2xl tracking-tighter uppercase">TAC</span>
              <span className="font-sans font-bold italic text-primary text-2xl tracking-tighter uppercase ml-1.5">
                E<span className="text-accent-warning">X</span>PRESS
              </span>
              <div className="w-5 h-5 flex items-center justify-center text-accent-warning ml-1 mt-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" className="w-full h-full transform translate-x-0 group-hover:translate-x-1 transition-transform">
                   <polyline points="2,12 20,12" />
                   <polyline points="12,4 20,12 12,20" />
                </svg>
              </div>
            </Link>
            <p className="text-sm font-medium text-foreground/80 mb-8 leading-relaxed">
              Domestic Cargo Specialists <br />
              Imphal &amp; New Delhi
            </p>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="size-10 border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Icon name="github" className="size-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-6 text-foreground tracking-[0.2em] uppercase font-mono">Services</h4>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-foreground/80">
              <li><Link href="#features" className="hover:text-primary transition-colors">Air Cargo</Link></li>
              <li><Link href="#features" className="hover:text-primary transition-colors">Surface Cargo</Link></li>
              <li><Link href="#features" className="hover:text-primary transition-colors">Packaging</Link></li>
              <li><Link href="#tracking" className="hover:text-primary transition-colors">Track a Shipment</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-6 text-foreground tracking-[0.2em] uppercase font-mono">Company</h4>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-foreground/80">
              <li><Link href="#" className="hover:text-primary transition-colors">About TAC Express</Link></li>
              <li><Link href="#how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="mailto:contact@tacexpress.in" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Expanding to Northeast India</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold mb-6 text-foreground tracking-[0.2em] uppercase font-mono">Legal</h4>
            <ul className="flex flex-col gap-3 text-sm font-semibold text-foreground/80">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Data Processing Addendum</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-foreground/70 font-mono font-medium">
          <div>
            &copy; {new Date().getFullYear()} Tapan Associate Cargo. All rights reserved.
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-end">
            {["Imphal", "New Delhi", "Northeast India"].map((loc) => (
              <span
                key={loc}
                className="border border-primary/20 font-mono text-2xs uppercase tracking-widest px-2.5 py-1 text-primary"
              >
                {loc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}


