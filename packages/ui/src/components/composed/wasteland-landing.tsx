"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Icon } from "@workspace/ui/icons"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"

// ── Shared Overlays ──────────────────────────────────────────────────────────

function HudOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="absolute left-4 top-1/2 -translate-y-1/2 rotate-[-90deg] font-mono text-[10px] text-primary/80 font-bold tracking-[0.4em] hidden md:block"
      >
        V.5.0.12 // TAC_LOGISTICS_FRAMEWORK // SYS.NOMINAL
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
        className="absolute right-4 top-1/2 -translate-y-1/2 rotate-[90deg] font-mono text-[10px] text-primary/80 font-bold tracking-[0.4em] hidden md:block"
      >
        LAT_28.6139_N // LON_77.2090_E // UPLINK_STABLE
      </motion.div>
    </div>
  )
}

// ── Section 1: Hero ──────────────────────────────────────────────────────────

function LogisticsHero() {
  return (
    <section className="relative flex flex-col items-center pt-32 pb-16 px-6 bg-background border-b border-border overflow-hidden">
      <HudOverlay />
      <div className="container mx-auto max-w-6xl text-center relative z-10 flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="inline-flex items-center gap-4 mb-6"
        >
          <div className="w-8 h-px bg-primary"></div>
          <span className="font-mono text-primary tracking-[0.3em] text-[10px] font-bold uppercase">TAC_LOGISTICS_FRAMEWORK</span>
          <div className="w-8 h-px bg-primary"></div>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-foreground font-sans font-black text-5xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.9] mb-8 max-w-4xl uppercase"
        >
          Absolute Logistical Command.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="font-mono text-muted-foreground text-sm md:text-base tracking-[0.1em] mb-12 max-w-2xl leading-relaxed uppercase font-medium"
        >
          Real-time tracking, advanced analytics, and seamless surface cargo management — centralized in one mission-critical platform.
        </motion.p>

        {/* Tactical Tracking Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="w-full max-w-2xl relative p-1 bg-secondary/5 border border-secondary/20 tac-fui-hover mb-16"
        >
          <div className="flex flex-col sm:flex-row gap-0">
            <div className="relative flex-1">
              <Input 
                type="text" 
                placeholder="ENTER AWB / CARGO ID..." 
                className="h-14 font-mono text-sm border-none focus-visible:ring-0 rounded-none bg-transparent text-foreground uppercase placeholder:text-muted-foreground/30 px-6 font-bold tracking-[0.2em]"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex items-center">
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-primary uppercase">STANDBY</span>
              </div>
            </div>
            <Button size="lg" className="h-14 rounded-none font-mono font-bold text-sm tracking-[0.3em] uppercase bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background w-full sm:w-auto px-10 transition-colors border-l border-secondary/20">
              <Icon name="scan" className="mr-3 w-5 h-5" /> LOCATE
            </Button>
          </div>
        </motion.div>

        {/* Brutalist Hero Image Framing */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="w-full aspect-[16/9] md:aspect-[21/9] relative border-2 border-primary/20 bg-card overflow-hidden shadow-brutal group"
        >
          <div className="absolute inset-0 z-10 bg-primary/10 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
             <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            src="/hero-truck.mp4" 
            className="w-full h-full object-cover filter grayscale contrast-125 brightness-75 group-hover:grayscale-0 transition-all duration-700 scale-105"
          />
          
          {/* Brutalist framing corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary z-20 m-4" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary z-20 m-4" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary z-20 m-4" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary z-20 m-4" />
          
          <div className="absolute bottom-4 right-4 bg-background border border-primary/30 px-3 py-1 z-20 font-mono text-[10px] text-primary font-bold tracking-widest uppercase">
            SYS_CAM_01 // LIVE
          </div>
        </motion.div>

      </div>
    </section>
  )
}

// ── Section 2: Metrics / Benefits ────────────────────────────────────────────

function BusinessUtility() {
  return (
    <section className="py-24 bg-card border-b border-border relative">
      <div className="container mx-auto max-w-6xl px-6 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-sans font-black uppercase tracking-tight text-foreground mb-4">
            Useful For Business.
          </h2>
          <p className="font-mono text-muted-foreground text-xs md:text-sm tracking-[0.2em] uppercase max-w-xl mx-auto">
            Our technologies enhance business efficiency and driver safety.
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
            hidden: {}
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <MetricCard 
            id="M-01"
            title="Time Saving"
            metric="20%"
            subtitle="Less Mundanity"
            desc="Process automation frees up logistical units to focus on core tasks."
          />
          <MetricCard 
            id="M-02"
            title="Safety Protocols"
            metric="50%"
            subtitle="Fewer Accidents"
            desc="Analyzing driving behavior improves transit road safety dramatically."
          />
          <MetricCard 
            id="M-03"
            title="Fuel Optimization"
            metric="30%"
            subtitle="Reduction in Burn"
            desc="Algorithmic route optimization saves up to a third on fossil fuel expenditure."
          />
        </motion.div>

      </div>
    </section>
  )
}

function MetricCard({ id, title, metric, subtitle, desc }: { id: string, title: string, metric: string, subtitle: string, desc: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
      }}
      className="bg-background border-2 border-border p-8 relative flex flex-col group hover:border-primary transition-colors shadow-brutal"
    >
      <div className="absolute -top-3 left-6 bg-primary text-primary-foreground px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest">{id}</div>
      <div className="font-mono text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-8 border-b border-border pb-2">{title}</div>
      <div className="font-sans text-6xl font-black text-foreground mb-2 tracking-tighter">{metric}</div>
      <div className="font-mono text-sm font-bold text-primary tracking-widest uppercase mb-4">{subtitle}</div>
      <p className="font-mono text-xs text-muted-foreground leading-relaxed uppercase mt-auto">
        {desc}
      </p>
    </motion.div>
  )
}

// ── Section 3: Results & Chart ───────────────────────────────────────────────

function ResultsChart() {
  return (
    <section className="py-24 bg-background border-b border-border relative overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-sans font-black uppercase tracking-tight text-foreground mb-4">
            Results That Speak <br /> For Themselves.
          </h2>
          <p className="font-mono text-muted-foreground text-xs md:text-sm tracking-[0.2em] uppercase">
            Learn how we help companies across the region.
          </p>
        </motion.div>

        <div className="bg-card border-2 border-border p-8 md:p-12 relative shadow-brutal max-w-4xl mx-auto">
           <div className="absolute top-4 right-4 flex gap-2">
             <span className="w-2 h-2 bg-primary animate-pulse"></span>
             <span className="w-2 h-2 bg-secondary"></span>
           </div>

           <p className="font-mono text-lg md:text-xl text-foreground font-medium uppercase tracking-wide leading-relaxed max-w-2xl mb-8">
             &quot;Since implementing the telematics system from <span className="text-primary font-bold">TAC Express</span>, our fleet has reached an entirely new level of efficiency. Over six months, we have <span className="bg-foreground text-background px-2 py-1 font-bold">reduced costs by 27%</span>.&quot;
           </p>

           <div className="flex items-center gap-4 mb-12 border-b border-border pb-8">
             <div className="w-12 h-12 bg-primary border-2 border-primary flex items-center justify-center flex-shrink-0">
               <span className="font-mono text-xs font-black text-primary-foreground uppercase tracking-widest select-none">TH</span>
             </div>
             <div>
               <div className="font-mono text-sm font-bold uppercase tracking-widest">Tapan Hidangmayum</div>
               <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Founder TAC Express</div>
             </div>
           </div>

           {/* The Line Chart (LAW 13 compliant: straight lines) */}
           <div className="relative h-48 w-full border-l border-b border-border flex items-end mt-12">
              <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                 <line x1="0" y1="50" x2="1000" y2="50" stroke="currentColor" strokeDasharray="4 4" className="text-border opacity-50" />
                 <line x1="0" y1="100" x2="1000" y2="100" stroke="currentColor" strokeDasharray="4 4" className="text-border opacity-50" />
                 <line x1="0" y1="150" x2="1000" y2="150" stroke="currentColor" strokeDasharray="4 4" className="text-border opacity-50" />
                 
                 <motion.polyline 
                   initial={{ pathLength: 0 }}
                   whileInView={{ pathLength: 1 }}
                   viewport={{ once: true, margin: "-50px" }}
                   transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                   points="0,20 250,20 500,100 750,150 1000,160" 
                   fill="none" stroke="var(--primary)" strokeWidth="3" 
                 />
                 <motion.polyline 
                   initial={{ opacity: 0 }}
                   whileInView={{ opacity: 0.1 }}
                   viewport={{ once: true, margin: "-50px" }}
                   transition={{ duration: 1, delay: 1.2 }}
                   points="0,20 250,20 500,100 750,150 1000,160 1000,200 0,200" 
                   fill="var(--primary)" 
                 />
                 
                 <rect x="246" y="16" width="8" height="8" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                 <rect x="496" y="96" width="8" height="8" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                 <rect x="746" y="146" width="8" height="8" fill="var(--background)" stroke="var(--primary)" strokeWidth="2" />
                 <rect x="996" y="156" width="8" height="8" fill="var(--primary)" />
              </svg>

              <div className="absolute -bottom-6 left-0 font-mono text-[10px] text-muted-foreground">MARCH</div>
              <div className="absolute -bottom-6 left-1/4 font-mono text-[10px] text-muted-foreground">MAY</div>
              <div className="absolute -bottom-6 left-2/4 font-mono text-[10px] text-muted-foreground">JUL</div>
              <div className="absolute -bottom-6 left-3/4 font-mono text-[10px] text-primary font-bold">SEP (73%)</div>
           </div>

        </div>

      </div>
    </section>
  )
}

// ── Section 4: Architecture Compatibility ────────────────────────────────────

function SystemCompatibility() {
  return (
    <section className="py-24 bg-card border-b border-border overflow-hidden">
      <div className="container mx-auto max-w-6xl px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-sans font-black uppercase tracking-tight text-foreground mb-12"
            >
              Compatible With <br/> Your Business.
            </motion.h2>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.15 } },
                hidden: {}
              }}
              className="flex flex-col gap-8"
            >
              <FeatureItem 
                icon="plug"
                title="Wide range of integrations."
                desc="Our systems support integration with leading software solutions for fleet management and accounting."
              />
              <FeatureItem 
                icon="cpu"
                title="Hardware compatibility."
                desc="We work with GPS trackers, fuel sensors, driver monitoring devices, and other standard telematics hardware."
              />
              <FeatureItem 
                icon="terminal"
                title="API for custom solutions."
                desc="Leverage our flexible API to create a tailored solution that fits your business specific needs."
              />
              <FeatureItem 
                icon="rocket"
                title="Fast setup."
                desc="Integration takes just a few hours, allowing you to immediately start optimizing your processes."
              />
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative aspect-[3/4] border-2 border-primary/20 bg-muted shadow-brutal p-2 group"
          >
             <div className="w-full h-full relative overflow-hidden border border-border">
               <div className="absolute inset-0 z-10 bg-primary/10 mix-blend-overlay pointer-events-none" />
               <img 
                 src="/images/tac-dock-illustration.jpg" 
                 alt="TAC Logistics Operations" 
                 className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all duration-700"
               />
               <div className="absolute top-4 left-4 bg-background border border-primary/30 px-3 py-1 z-20 font-mono text-[10px] text-primary font-bold tracking-widest uppercase">
                  DOCK_04 // ACTIVE
               </div>
             </div>
          </motion.div>

        </div>

      </div>
    </section>
  )
}

function FeatureItem({ icon, title, desc }: { icon: React.ComponentProps<typeof Icon>['name'], title: string, desc: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
      }}
      className="flex gap-6 group"
    >
      <div className="flex-shrink-0 w-12 h-12 bg-background border border-border flex items-center justify-center group-hover:border-primary transition-colors">
        <Icon name={icon} className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
      </div>
      <div>
        <h4 className="font-mono text-sm font-bold uppercase tracking-widest mb-2 text-foreground">{title}</h4>
        <p className="font-mono text-xs text-muted-foreground uppercase leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

// ── Main Export ──────────────────────────────────────────────────────────────

export function WastelandLanding() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-secondary selection:text-secondary-foreground">
      <LogisticsHero />
      <BusinessUtility />
      <ResultsChart />
      <SystemCompatibility />
    </main>
  )
}
