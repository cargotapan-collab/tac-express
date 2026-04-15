---
name: tac-express-ui
description: UI component patterns for tac-express. Use when building, editing, or composing UI components. Covers the "Precision Velocity" design system — depth layers, multi-tier borders, shadow tokens, atmospheric components, shadcn radix-lyra style, TailwindCSS v4 CSS-first config, CVA variants, Remixicon icons, and the shared @workspace/ui package conventions.
---

# tac-express — UI Component Patterns ("Precision Velocity" Design System)

## Architecture: Where Components Live

All shared components belong in `packages/ui/src/components/`.  
App-specific one-off components can live in `apps/web/components/`.  
**Never** duplicate a shared component in app space.

```
packages/ui/src/
├── assets/          ← static assets (lottie JSON, etc.)
├── components/
│   ├── primitives/  ← shadcn base wrappers (button, card, sheet, badge, etc.)
│   └── composed/    ← business compositions (hero, nav, bento, marquee, etc.)
├── icons/
│   └── index.tsx    ← Remix Icon wrapper — all icon imports go through here
├── hooks/           ← shared React hooks
├── lib/
│   └── utils.ts     ← cn() utility
└── styles/
    └── globals.css   ← TailwindCSS v4 CSS-first config + design tokens
```

## Consuming Components in apps/web

```tsx
// Import from workspace alias
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

// Import global styles (in layout.tsx)
import "@workspace/ui/globals.css"
```

## TailwindCSS v4 — Critical Notes

This project uses **TailwindCSS v4**. The config is CSS-first, NOT a JS config file.

```css
/* packages/ui/src/styles/globals.css */
@import "tailwindcss";

/* Design tokens defined as CSS variables in :root / .dark */
/* Then mapped in @theme inline {} for Tailwind consumption */
```

**DO NOT:**
- Create `tailwind.config.js` or `tailwind.config.ts`
- Use `theme.extend` — extend tokens directly in `@theme inline {}` in globals.css
- Use `@apply` for complex component logic — prefer CVA
- Use raw OKLCH values in components — always use semantic tokens

**DO:**
- Add custom tokens to `globals.css` inside `:root` / `.dark` + map in `@theme inline {}`
- Use CSS variables in components: `bg-primary`, `text-foreground`, etc.
- Use `@layer components {}` for reusable non-variant styles

---

## Design System: "Precision Velocity" Token Architecture

### Depth Layer System

Five depth levels give UI spatial hierarchy instead of flat backgrounds:

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `bg-background` | White | Deep charcoal | Page body |
| `bg-bg-base` | Off-white (purple tint) | Near-black | Section backgrounds |
| `bg-bg-panel` | Lighter panel | Dark panel | Footer, sidebars |
| `bg-bg-surface` | Elevated surface | Elevated dark | Cards, elevated content |
| `bg-bg-overlay` | Pure white | Overlay dark | Modals, popovers, nav backdrop |

```tsx
// ✅ CORRECT depth usage
<section className="bg-bg-base">         {/* Section backgrounds */}
<div className="bg-bg-surface">           {/* Cards, elevated areas */}
<footer className="bg-bg-panel">          {/* Footer/sidebar */}
<header className="bg-bg-overlay/80">     {/* Nav on scroll */}
```

### Multi-Tier Border System

Four border weights for visual hierarchy:

| Token | Usage |
|-------|-------|
| `border-border-subtle` | Resting separators, list items |
| `border-border-default` | Standard card/container borders |
| `border-border-strong` | Hover states, active emphasis |
| `border-border-primary` | Primary-colored accent borders |

```tsx
// ✅ CORRECT border hierarchy
<Card className="border-border-default hover:border-border-strong" />
<div className="border-l-2 border-transparent hover:border-border-primary" />
```

### Shadow Token System

Hard-edge brutalist shadows (no blur — all straight offsets):

| Token | Value (Light) | Value (Dark) | Usage |
|-------|--------------|-------------|-------|
| `shadow-brutal-sm` | `2px 2px 0px` foreground | `2px 2px 0px` primary | Small elements, icons, badges |
| `shadow-brutal` | `4px 4px 0px` foreground | `4px 4px 0px` primary | Cards, containers |
| `shadow-brutal-primary` | `4px 4px 0px` primary | `4px 4px 0px` primary | CTA containers, hero cards |

```tsx
// ✅ Brutalist button interaction pattern
<Button className="shadow-brutal-sm hover:shadow-brutal hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all" />
```

### Status Token

```tsx
// Alive green indicator
<div className="w-2 h-2 bg-status-active animate-pulse" />
<span className="text-status-active">ONLINE</span>
```

### Typography Extras

| Token | Size | Usage |
|-------|------|-------|
| `text-2xs` | 0.625rem (10px) | Tiny mono labels |
| `text-3xs` | 0.5rem (8px) | Ultra-fine system annotations |

### Tracking Scale

```
--tracking-tighter  --tracking-tight  --tracking-normal
--tracking-wide  --tracking-wider  --tracking-widest
```

---

## Atmospheric Components (Pure CSS / Vanilla JS)

All atmospheric components use **zero forbidden packages** — no framer-motion, no GSAP.

### NoiseOverlay (RSC)
SVG `feTurbulence` grain texture for cinematic depth:
```tsx
import { NoiseOverlay } from "@workspace/ui/components/composed/noise-overlay"
<NoiseOverlay opacity={0.035} />  // Fixed overlay, z-50
```

### GridBackground (RSC)
CSS `linear-gradient` structural grid lines:
```tsx
import { GridBackground } from "@workspace/ui/components/composed/grid-background"
<GridBackground columns={4} className="opacity-20" />
```

### ScrollProgress (Client)
Fixed top-of-page progress bar — `requestAnimationFrame`, no framer-motion:
```tsx
import { ScrollProgress } from "@workspace/ui/components/composed/scroll-progress"
<ScrollProgress />  // Fixed top bar, z-100
```

### TextScramble (Client)
Katakana/alphanumeric decode effect — pure `setInterval`:
```tsx
import { TextScramble } from "@workspace/ui/components/composed/text-scramble"
<TextScramble duration={2.5} hoverRescramble>Precision Velocity.</TextScramble>
```

### Marquee (RSC)
CSS-only infinite scroll ticker:
```tsx
import { Marquee } from "@workspace/ui/components/composed/marquee"
<Marquee duration={40} pauseOnHover reverse>{items}</Marquee>
```

### SectionDivider (RSC)
Straight-line section separators (NO curves):
```tsx
import { SectionDivider } from "@workspace/ui/components/composed/section-divider"
<SectionDivider variant="gradient-fade" accent />  // line | dashed | gradient-fade | double
```

### AnimatedThemeToggler (Client)
View Transitions API circle-reveal theme toggle:
```tsx
import { AnimatedThemeToggler } from "@workspace/ui/components/composed/animated-theme-toggler"
<AnimatedThemeToggler />  // Remix Icon moon/sun, brutalist shadow
```

### CSS Ambient Classes (globals.css)
```tsx
{/* Animated dot grid — pure CSS, zero JS */}
<div className="tac-dot-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(...)]" />

{/* Marquee track — pure CSS infinite scroll */}
<div className="tac-marquee-track">{items}</div>
```

## Component Pattern: CVA + cn()

Every component with variants uses **class-variance-authority (CVA)** + **tailwind-merge**.

### Standard Component Template

```tsx
// packages/ui/src/components/example.tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/lib/utils"

const exampleVariants = cva(
  // Base classes (always applied)
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost:   "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm:      "h-8 px-3 text-sm",
        md:      "h-9 px-4 text-sm",
        lg:      "h-10 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ExampleProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof exampleVariants> {}

export function Example({ className, variant, size, ...props }: ExampleProps) {
  return (
    <div
      className={cn(exampleVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

## Icon Usage — Remixicon

**Always** use `@remixicon/react`. Never import from lucide-react, heroicons, or react-icons.

```tsx
import { RiArrowRightLine, RiCheckLine, RiCloseLine } from "@remixicon/react"

// Usage
<RiArrowRightLine className="h-4 w-4" />
<RiCheckLine size={16} />
```

**Icon naming convention:** `Ri` prefix + PascalCase name + `Line` (outline) or `Fill` (filled).
Search icons at: https://remixicon.com

## Radix UI Primitives

Use `radix-ui` package (unified package, not individual `@radix-ui/*`).

```tsx
import * as Dialog from "radix-ui/react-dialog"
import * as DropdownMenu from "radix-ui/react-dropdown-menu"
import * as Select from "radix-ui/react-select"
```

## Theme (Dark/Light Mode)

Uses `next-themes`. Wrap app in `ThemeProvider` in `apps/web/app/layout.tsx`.
Use `AnimatedThemeToggler` for the UI toggle (View Transitions API circle-reveal).

```tsx
import { ThemeProvider } from "next-themes"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

`::view-transition` CSS rules are defined in globals.css for smooth theme transitions.

CSS variables for themes in `globals.css`:

```css
:root { --background: oklch(1 0 0); }
.dark { --background: oklch(0.08 0 0); }
```

## The cn() Utility

```ts
// packages/ui/src/lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Always use `cn()` to merge classNames — never concatenate strings directly.

## Adding a New shadcn Component

```bash
# From packages/ui directory
npx shadcn add <component-name>

# Inspect before adding (security gate)
npx shadcn view <component-name>
```

Components land in `packages/ui/src/components/primitives/`. Then export them via the package's exports map if needed.

## Server vs Client Components

- shadcn components with interactivity (onClick, useState, etc.) → add `"use client"` at top
- Components that are pure display/layout → can be RSC (no directive needed)
- The `rsc: true` in `components.json` means shadcn defaults to RSC-compatible output

## Composed Component Inventory

| Component | File | Render | Key Tokens Used |
|-----------|------|--------|----------------|
| `PublicNav` | `composed/public-nav.tsx` | Client | `bg-bg-overlay`, `border-border-default`, `shadow-brutal-sm` |
| `HeroSection` | `composed/hero-section.tsx` | Client | `bg-bg-base`, `tac-dot-grid`, `GridBackground`, `TextScramble`, `shadow-brutal` |
| `RouteMarquee` | `composed/route-marquee.tsx` | RSC | `bg-bg-panel`, `Marquee` |
| `TrackingBox` | `composed/tracking-box.tsx` | Client | Standard tokens |
| `StatsBar` | `composed/stats-bar.tsx` | RSC | Standard tokens |
| `FeatureBento` | `composed/feature-bento.tsx` | RSC | `bg-bg-surface`, `bg-bg-panel`, `shadow-brutal`, `border-border-strong` |
| `HowItWorks` | `composed/how-it-works.tsx` | RSC | Standard tokens |
| `CtaBanner` | `composed/cta-banner.tsx` | RSC | `bg-bg-base`, `bg-bg-overlay`, `shadow-brutal-primary`, `GridBackground` |
| `Footer` | `composed/footer.tsx` | RSC | `bg-bg-panel`, `SectionDivider`, `status-active` |
| `NoiseOverlay` | `composed/noise-overlay.tsx` | RSC | SVG feTurbulence |
| `GridBackground` | `composed/grid-background.tsx` | RSC | `--color-border` |
| `ScrollProgress` | `composed/scroll-progress.tsx` | Client | `--color-primary`, rAF |
| `TextScramble` | `composed/text-scramble.tsx` | Client | `--primary`, `--foreground` |
| `Marquee` | `composed/marquee.tsx` | RSC | CSS keyframes |
| `SectionDivider` | `composed/section-divider.tsx` | RSC | `border-border`, `border-primary` |
| `AnimatedThemeToggler` | `composed/animated-theme-toggler.tsx` | Client | View Transitions API, `shadow-brutal-sm` |

## Animation Rules (Extended)

Beyond `tw-animate-css` classes, these techniques are permitted:

| Technique | Status | Example |
|-----------|--------|--------|
| `tw-animate-css` classes | ✅ Approved | `animate-in fade-in slide-in-from-bottom-4` |
| CSS `@keyframes` in globals.css | ✅ Approved | `grid-drift`, `marquee-scroll` |
| CSS `transition-*` utilities | ✅ Approved | `transition-all duration-300` |
| `requestAnimationFrame` | ✅ Approved | ScrollProgress |
| `setInterval` / `setTimeout` | ✅ Approved | TextScramble |
| View Transitions API | ✅ Approved | AnimatedThemeToggler |
| CSS `animate-pulse` | ✅ Approved | Status indicators |
| `framer-motion` | ❌ FORBIDDEN | — |
| `gsap` | ❌ FORBIDDEN | — |
| `@motionone/react` | ❌ FORBIDDEN | — |
