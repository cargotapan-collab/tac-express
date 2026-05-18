"use client"



import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { Icon } from "@workspace/ui/icons"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/primitives/input"

// v6 motion bezier — mirrors --ease-smooth in globals.css.
// motion/react accepts a 4-tuple [x1,y1,x2,y2]; using this in place of
// stock keyword strings ("easeOut") routes every entrance through the
// same easing the rest of the system uses (LAW 3 / tac-design-tokens).
const EASE_SMOOTH = [0.4, 0, 0.2, 1] as const

// ── Shared Overlays ──────────────────────────────────────────────────────────

function HudOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.5, ease: EASE_SMOOTH }}
        className="absolute left-4 top-1/2 -translate-y-1/2 rotate-[-90deg] tac-mono-label text-primary/80 hidden md:block"
      >
        V.5.0.12 // TAC_LOGISTICS_FRAMEWORK // SYS.NOMINAL
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: EASE_SMOOTH }}
        className="absolute right-4 top-1/2 -translate-y-1/2 rotate-[90deg] tac-mono-label text-primary/80 hidden md:block"
      >
        LAT_28.6139_N // LON_77.2090_E // UPLINK_STABLE
      </motion.div>
    </div>
  )
}

// ── Section 1: Hero ──────────────────────────────────────────────────────────

function LogisticsHero() {
  const router = useRouter()
  const [awbInput, setAwbInput] = React.useState("")
  const [trackError, setTrackError] = React.useState<string | null>(null)

  function onTrack(e: React.FormEvent) {
    e.preventDefault()
    const value = awbInput.trim().toUpperCase()
    if (!value) {
      setTrackError("Enter an AWB or cargo ID.")
      return
    }
    setTrackError(null)
    router.push(`/track/${encodeURIComponent(value)}`)
  }

  return (
    <section className="relative flex flex-col items-center pt-32 pb-16 px-6 bg-background border-b border-border overflow-hidden">
      <HudOverlay />
      <div className="container mx-auto max-w-6xl text-center relative z-10 flex flex-col items-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE_SMOOTH }}
          className="inline-flex items-center gap-4 mb-6"
        >
          <div className="w-8 h-px bg-primary" aria-hidden></div>
          <span className="tac-mono-label text-primary">TAC_LOGISTICS_FRAMEWORK</span>
          <div className="w-8 h-px bg-primary" aria-hidden></div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_SMOOTH }}
          className="t-display text-foreground uppercase mb-8 max-w-4xl dark:text-glow-primary"
        >
          Absolute Logistical Command.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE_SMOOTH }}
          className="t-body text-muted-foreground mb-12 max-w-2xl"
        >
          Real-time tracking, advanced analytics, and seamless surface cargo management — centralized in one mission-critical platform.
        </motion.p>

        {/* Tactical Tracking Input — wired to /track/[awb] */}
        <motion.form
          onSubmit={onTrack}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: EASE_SMOOTH }}
          className="w-full max-w-2xl relative p-1 bg-secondary/5 border border-secondary/20 tac-fui-hover mb-16"
        >
          <div className="flex flex-col sm:flex-row gap-0">
            <div className="relative flex-1">
              <label htmlFor="awb-locate-input" className="sr-only">
                AWB or cargo ID
              </label>
              <Input
                id="awb-locate-input"
                type="text"
                value={awbInput}
                onChange={(e) => setAwbInput(e.target.value)}
                placeholder="ENTER AWB / CARGO ID..."
                aria-describedby={trackError ? "awb-locate-error" : undefined}
                aria-invalid={trackError ? true : undefined}
                className="h-14 font-mono text-sm border-none focus-visible:ring-0 rounded-none bg-transparent text-foreground uppercase placeholder:text-muted-foreground/30 px-6 font-bold tracking-paper-20 focus-visible:outline-none focus-visible:tac-focus-premium"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex items-center">
                <span className="tac-mono-label text-primary">STANDBY</span>
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              // eslint-disable-next-line no-restricted-syntax -- design-locked: see docs/design-exceptions.md
              className="h-14 rounded-none font-mono font-bold text-sm tracking-[0.3em] uppercase bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background w-full sm:w-auto px-10 transition-colors border-l border-secondary/20 focus-visible:outline-none focus-visible:tac-focus-premium"
            >
              <Icon name="scan" className="mr-3 w-5 h-5" /> LOCATE
            </Button>
          </div>
          {trackError && (
            <p
              id="awb-locate-error"
              role="alert"
              className="absolute left-1 -bottom-6 tac-mono-label text-accent-danger"
            >
              {trackError}
            </p>
          )}
        </motion.form>

        {/* PL-2a — sales-led B2B customer-journey CTA row. The hero's primary
            action is "locate an existing shipment" (AWB form above); this
            row is the secondary path for visitors who don't yet have an
            AWB — i.e. new sales leads. Without it the only customer-journey
            terminator was the top-nav, which fails the "credibly land →
            complete the intended journey" hard test for OD-P1 = sales-led B2B.
            Targets `/quote` (rate calculator, no sign-in) and `/contact`
            (sales/support/ops inbox). */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: EASE_SMOOTH }}
          className="flex flex-col items-center gap-4 mb-16"
        >
          <span className="tac-mono-label text-muted-foreground">
            NOT TRACKING A SHIPMENT?
          </span>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              variant="default"
              size="lg"
              className="h-12 rounded-none font-mono font-bold text-sm tracking-paper-20 uppercase px-10 focus-visible:outline-none focus-visible:tac-focus-premium"
            >
              <Link href="/quote">
                <Icon name="calculator" className="mr-3 w-5 h-5" />
                GET A QUOTE
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-none font-mono font-bold text-sm tracking-paper-20 uppercase px-10 focus-visible:outline-none focus-visible:tac-focus-premium"
            >
              <Link href="/contact">
                <Icon name="mail" className="mr-3 w-5 h-5" />
                CONTACT SALES
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Brutalist Hero Image Framing */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: EASE_SMOOTH }}
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
            className="w-full h-full object-cover filter grayscale contrast-125 brightness-75 scale-105"
          />
          
          {/* Brutalist framing corners */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary z-20 m-4" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary z-20 m-4" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary z-20 m-4" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary z-20 m-4" />
          
          <div className="absolute bottom-4 right-4 bg-background border border-primary/30 px-3 py-1 z-20 tac-mono-label text-primary">
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
          <h2 className="t-h1 md:t-display uppercase text-foreground mb-4">
            Operational Telemetry.
          </h2>
          <p className="tac-mono-label text-muted-foreground max-w-xl mx-auto">
            Three measured deltas · 6-month rolling average · fleet-wide
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
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Asymmetric 5/4/3 split — M-01 leads (largest visual), M-03 compact at end.
              Breaks the "three equal cards" template read while preserving narrative order. */}
          <MetricCard
            id="M-01"
            title="Time Saving"
            metric="20%"
            subtitle="Less Mundanity"
            desc="Process automation frees up logistical units to focus on core tasks."
            colSpanClass="md:col-span-5"
          />
          <MetricCard
            id="M-02"
            title="Safety Protocols"
            metric="50%"
            subtitle="Fewer Accidents"
            desc="Analyzing driving behavior improves transit road safety dramatically."
            colSpanClass="md:col-span-4"
          />
          <MetricCard
            id="M-03"
            title="Fuel Optimization"
            metric="30%"
            subtitle="Reduction in Burn"
            desc="Algorithmic route optimization saves up to a third on fossil fuel expenditure."
            colSpanClass="md:col-span-3"
          />
        </motion.div>

      </div>
    </section>
  )
}

function MetricCard({
  id,
  title,
  metric,
  subtitle,
  desc,
  colSpanClass,
}: {
  id: string
  title: string
  metric: string
  subtitle: string
  desc: string
  colSpanClass?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_SMOOTH } }
      }}
      className={`bg-background border-2 border-border p-8 relative flex flex-col group hover:border-primary transition-colors shadow-brutal ${colSpanClass ?? ""}`}
    >
      <div className="absolute -top-3 left-6 bg-primary text-primary-foreground px-2 py-0.5 tac-mono-label">{id}</div>
      <div className="tac-mono-label text-muted-foreground mb-8 border-b border-border pb-2">{title}</div>
      <div className="t-data text-foreground mb-2">{metric}</div>
      <div className="tac-mono-label text-primary mb-4 normal-case">{subtitle}</div>
      <p className="t-mono-sm text-muted-foreground leading-relaxed mt-auto">
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
          <h2 className="t-h1 md:t-display uppercase text-foreground mb-4">
            Cost Delta <br /> 27% · 6 Months.
          </h2>
          <p className="tac-mono-label text-muted-foreground">
            Telemetry · case study · north-east corridor fleet
          </p>
        </motion.div>

        <div className="bg-surface-elevated border-2 border-border p-8 md:p-12 relative shadow-md max-w-4xl mx-auto">
           <div className="absolute top-4 right-4 flex gap-2">
             <span aria-hidden className="w-2 h-2 bg-primary animate-pulse motion-reduce:animate-none"></span>
             <span aria-hidden className="w-2 h-2 bg-secondary"></span>
           </div>

           <p className="font-mono text-lg md:text-xl text-foreground font-medium uppercase tracking-wide leading-relaxed max-w-2xl mb-8">
             &quot;Since implementing the telematics system from <span className="text-primary font-bold">TAC Express</span>, our fleet has reached an entirely new level of efficiency. Over six months, we have <span className="bg-foreground text-background px-2 py-1 font-bold">reduced costs by 27%</span>.&quot;
           </p>

           <div className="flex items-center gap-4 mb-12 border-b border-border pb-8">
             <div className="w-12 h-12 bg-primary border-2 border-primary flex items-center justify-center flex-shrink-0">
               <span className="tac-mono-label text-primary-foreground select-none">TH</span>
             </div>
             <div>
               <div className="tac-mono-label text-foreground normal-case">Tapan Hidangmayum</div>
               <div className="tac-mono-label text-muted-foreground">Founder TAC Express</div>
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
                   transition={{ duration: 1.5, ease: EASE_SMOOTH, delay: 0.2 }}
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

              <div className="absolute -bottom-6 left-0 tac-mono-label text-muted-foreground">MARCH</div>
              <div className="absolute -bottom-6 left-1/4 tac-mono-label text-muted-foreground">MAY</div>
              <div className="absolute -bottom-6 left-2/4 tac-mono-label text-muted-foreground">JUL</div>
              <div className="absolute -bottom-6 left-3/4 tac-mono-label text-primary">SEP (73%)</div>
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
              transition={{ duration: 0.6, ease: EASE_SMOOTH }}
              className="t-h1 md:t-display uppercase text-foreground mb-12"
            >
              Integration <br/> Layer · OPEN.
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
            transition={{ duration: 0.8, delay: 0.3, ease: EASE_SMOOTH }}
            className="relative aspect-[3/4] border-2 border-primary/20 bg-muted shadow-md p-2 group"
          >
             <div className="w-full h-full relative overflow-hidden border border-border">
               <div className="absolute inset-0 z-10 bg-primary/10 mix-blend-overlay pointer-events-none" />
               <img
                 src="/images/tac-dock-illustration.jpg"
                 alt="TAC Logistics Operations"
                 className="w-full h-full object-cover filter grayscale contrast-125"
               />
               <div className="absolute top-4 left-4 bg-background border border-primary/30 px-3 py-1 z-20 tac-mono-label text-primary">
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
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE_SMOOTH } }
      }}
      className="flex gap-6 group"
    >
      <div className="flex-shrink-0 w-12 h-12 bg-background border border-border flex items-center justify-center group-hover:border-primary transition-colors">
        <Icon name={icon} className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
      </div>
      <div>
        <h4 className="tac-mono-label text-foreground mb-2">{title}</h4>
        <p className="t-mono-sm text-muted-foreground leading-relaxed">{desc}</p>
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
