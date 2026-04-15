---
name: tac-express-rules
description: TAC Express strict governance rules — MANDATORY. Load this skill for EVERY task in this project. Contains The Ten Laws, forbidden packages, architecture rules, and per-phase quality gates derived from the official implementation plan v2.0. Violations will block commits and CI.
---

# TAC Express — Strict Governance Rules

> **AUTHORITY:** TAC-EXPRESS-IMPLEMENTATION-PLAN-v2.md (supersedes v1.0)
> **Status:** Non-negotiable. Zero exceptions without explicit ADR amendment.
> **Enforcement:** ESLint errors + pre-commit hooks + CI gates = hard blocks.

---

## ⚡ CRITICAL: V1.0 IS WRONG — ALWAYS USE V2.0

If you see v1.0 references anywhere, they are **obsolete and INCORRECT**:

| Topic | v1.0 (WRONG — discard) | v2.0 (CORRECT — enforce) |
|-------|------------------------|--------------------------|
| Icons | Lucide React | `@remixicon/react` ONLY |
| Animation | Framer Motion / Motion | `tw-animate-css` ONLY |
| Next.js | 15.x | **16.1.6** |
| Primary color | TAC Blue `oklch(0.56 0.24 264)` | **Purple** `oklch(0.491 0.27 292.581)` |
| shadcn style | default | **radix-lyra** |
| Font source | `packages/ui/fonts.ts` | **`apps/web/app/layout.tsx`** |

---

## 🔴 THE TEN LAWS — ZERO EXCEPTIONS

Violations produce **ESLint errors** at commit time. There are no warnings, only failures.

```
LAW 1:  No color value outside packages/ui/src/styles/globals.css
LAW 2:  No icon import except @remixicon/react via @workspace/ui/icons wrapper
LAW 3:  No animation library except tw-animate-css classes
LAW 4:  No font declaration except in apps/web/app/layout.tsx (existing — do not touch)
LAW 5:  No UI component built in apps/web — only in packages/ui
LAW 6:  No database call in any component — only via packages/services
LAW 7:  No business logic in components — only in packages/services
LAW 8:  No @supabase/supabase-js import in apps/web — only via packages/database
LAW 9:  No hardcoded spacing, radius, or shadow values (no arbitrary [px] values)
LAW 10: No Tailwind color class (bg-blue-500, text-red-400) — semantic tokens ONLY
```

---

## 🚫 FORBIDDEN PACKAGES — NEVER INSTALL

```
lucide-react         → FORBIDDEN. Use @remixicon/react only.
framer-motion        → FORBIDDEN. Use tw-animate-css only.
@motionone/react     → FORBIDDEN. Use tw-animate-css only.
gsap                 → FORBIDDEN. Use tw-animate-css only.
styled-components    → FORBIDDEN. TailwindCSS v4 tokens only.
@mui/material        → FORBIDDEN. @workspace/ui only.
antd                 → FORBIDDEN. @workspace/ui only.
chakra-ui            → FORBIDDEN. @workspace/ui only.
react-icons          → FORBIDDEN. @remixicon/react only.
moment               → FORBIDDEN. Use date-fns or native Intl API.
lodash               → FORBIDDEN. Use native ES methods.
axios                → FORBIDDEN. Use native fetch.
```

---

## ✅ APPROVED PACKAGES (not yet installed — phase-gated)

Only these packages may be added. Nothing else without ADR amendment.

| Package | Phase | Purpose |
|---------|-------|---------|
| `@clerk/nextjs` | Phase 2 | Authentication |
| `@supabase/supabase-js` | Phase 2 | Database client (in packages/database ONLY) |
| `react-hook-form` | Phase 3 | Form state |
| `@hookform/resolvers` | Phase 3 | Zod↔RHF bridge |
| `bwip-js` | Phase 4 | Barcode generation (Code128/GS1-128) |
| `@zxing/library` | Phase 4 | Camera barcode scanning |
| `@react-pdf/renderer` | Phase 4 | PDF label + invoice generation |
| `recharts` | Phase 7 | Charts + analytics |
| `idb-keyval` | Phase 4 | IndexedDB offline scan queue |
| `ai` (Vercel AI SDK) | Phase 8 | AI chatbot streaming |
| `@anthropic-ai/sdk` | Phase 8 | Claude API |
| `@tanstack/react-query` | Phase 2 | Server state + caching |
| `zustand` | Phase 2 | Client state management |
| `sentry` | Phase 10 | Error monitoring |

---

## 🏗️ ARCHITECTURE RULES (ADR — Confirmed)

### ADR-001: Package Boundaries
```
UI Component → Service Function → Database Query → Supabase
                ↑ No skipping this chain. No exceptions.
```

### ADR-002: File Location Rules
| Code Type | Must Live In | Import As |
|-----------|-------------|-----------|
| All UI components | `packages/ui/src/components/` | `@workspace/ui/components/x` |
| Business logic | `packages/services/src/` | `@workspace/services` |
| DB queries | `packages/database/src/` | `@workspace/database` |
| Auth/RBAC | `packages/auth/src/` | `@workspace/auth` |
| Domain types | `packages/types/src/` | `@workspace/types` |
| App-shell layouts | `apps/web/components/` (only) | `@/components/x` |
| App hooks | `apps/web/hooks/` | `@/hooks/x` |

### ADR-003: Supabase Access Pattern
- `@supabase/supabase-js` is **only imported in `packages/database/`**
- All apps access Supabase via `@workspace/database` — never directly
- Supabase client includes Clerk JWT for RLS

### ADR-004: Shipment Status is Event-Derived
- Shipment status is **never stored as a direct field**
- Status = derived from the latest `tracking_events` record
- Every scan creates a tracking event

### ADR-005: Fonts are LOCKED in layout.tsx
- Fonts: Geist (`--font-sans`), Geist Mono (`--font-mono`), Lora (`--font-heading`)
- Configured in `apps/web/app/layout.tsx` via `next/font/google`
- **Do NOT** import fonts anywhere else. **Do NOT** modify the font section.

---

## 🎨 DESIGN SYSTEM RULES

### Color — Semantic Tokens ONLY

```tsx
// ❌ FORBIDDEN
<div className="bg-blue-500 text-white border-gray-200" />
<div style={{ backgroundColor: "oklch(0.491 0.27 292.581)" }} />
<div className="bg-[#6d28d9]" />

// ✅ CORRECT
<div className="bg-primary text-primary-foreground border-border" />
<div style={{ backgroundColor: "var(--primary)" }} />
```

Permitted semantic token classes:
```
# Standard
bg-background   text-foreground
bg-primary      text-primary-foreground
bg-secondary    text-secondary-foreground
bg-muted        text-muted-foreground
bg-accent       text-accent-foreground
bg-destructive  text-destructive
bg-card         text-card-foreground
bg-sidebar      text-sidebar-foreground
border-border   border-input   ring-ring

# Depth Layers ("Precision Velocity" additions)
bg-bg-base      bg-bg-panel      bg-bg-surface      bg-bg-overlay

# Multi-Tier Borders
border-border-subtle   border-border-default   border-border-strong   border-border-primary

# Shadow Tokens
shadow-brutal   shadow-brutal-sm   shadow-brutal-primary

# Status
bg-status-active   text-status-active

# Typography Extras
text-2xs   text-3xs
```

Chart colors (for recharts only):
```
var(--chart-1)  var(--chart-2)  var(--chart-3)
var(--chart-4)  var(--chart-5)
```

### Typography Rules

```tsx
// ✅ CORRECT font usage
<h1 className="font-heading text-3xl">Page Title</h1>       // Lora
<p className="font-sans text-sm text-muted-foreground">...</p>  // Geist
<span className="font-mono text-sm">TAC-26-000123</span>     // Geist Mono (CN numbers)
```

### Radius Rules
```tsx
// ❌ FORBIDDEN
<div className="rounded-lg" />
<div style={{ borderRadius: "8px" }} />

// ✅ CORRECT
<div style={{ borderRadius: "var(--radius-lg)" }} />
```

Permitted radius tokens: `var(--radius-sm/md/lg/xl/2xl/3xl/4xl)`

### Spacing Rules
```tsx
// ❌ FORBIDDEN
<div className="p-[13px] mt-[27px]" />
<div style={{ padding: "13px" }} />

// ✅ CORRECT
<div className="p-4 mt-6" />  // Tailwind spacing scale only
```

### Animation Rules

```tsx
// ❌ FORBIDDEN
import { motion } from "framer-motion"
import { animate } from "@motionone/react"

// ✅ CORRECT — tw-animate-css classes
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
<div className="animate-in zoom-in-95 fade-in duration-200">   // scan feedback
<li className="animate-in fade-in slide-in-from-left-2 duration-200 delay-75">

// ✅ CORRECT — CSS @keyframes in globals.css
.tac-dot-grid { animation: grid-drift 20s linear infinite; }
.tac-marquee-track { animation: marquee-scroll 40s linear infinite; }

// ✅ CORRECT — requestAnimationFrame (for scroll-linked effects)
requestAnimationFrame(update)  // ScrollProgress component

// ✅ CORRECT — setInterval (for text decode effects)
setInterval(scramble, 50)  // TextScramble component

// ✅ CORRECT — View Transitions API (for theme toggle)
document.startViewTransition(() => setTheme(next))  // AnimatedThemeToggler
```

### Icon Rules

```tsx
// ❌ FORBIDDEN
import { Package } from "lucide-react"      // not installed
import { FaBox } from "react-icons/fa"      // not permitted

// ✅ CORRECT — via @workspace/ui/icons wrapper
import { Icon, LogisticsIcons } from "@workspace/ui/icons"
<Icon name="RiBox3Line" size={20} className="text-primary" />
<Icon name={LogisticsIcons.shipment} size={20} />

// ✅ Also correct — direct remixicon import (only in packages/ui/icons/index.tsx)
import { RiBox3Line } from "@remixicon/react"
```

---

## 🧩 COMPONENT AUTHORING RULES

1. **Location:** All shared components → `packages/ui/src/components/`
   - Primitives (shadcn wrappers) → `primitives/` subfolder
   - Business compositions → `composed/` subfolder
   - Layout wrappers → layouts or top-level

2. **Pattern:** CVA + cn() for every component with variants
   ```tsx
   import { cva, type VariantProps } from "class-variance-authority"
   import { cn } from "@workspace/ui/lib/utils"
   
   const variants = cva("base-classes", { variants: { ... } })
   export function Component({ className, variant, ...props }) {
     return <div className={cn(variants({ variant }), className)} {...props} />
   }
   ```

3. **Never** build custom modals, dropdowns, tooltips, or popovers from scratch — use shadcn

4. **Adding shadcn components:**
   ```bash
   # From packages/ui directory ONLY
   pnpm dlx shadcn@latest add <component-name>
   # Move output to src/components/primitives/
   ```

5. **Export all components** from `packages/ui/src/components/index.ts`

---

## ✅ PER-PHASE QUALITY GATE

Every phase MUST pass ALL before proceeding:

- [ ] All types defined in `packages/types`
- [ ] All business logic in `packages/services`
- [ ] All components import from `@workspace/ui` only
- [ ] No hardcoded colors, fonts, or spacing values
- [ ] No Tailwind color classes (`bg-blue-*`, `text-red-*`)
- [ ] No icon imports except via `@workspace/ui/icons`
- [ ] No animation library other than `tw-animate-css` classes
- [ ] ESLint passes with `--max-warnings 0`
- [ ] TypeScript compiles with zero errors
- [ ] `pnpm build` succeeds across all packages
- [ ] Feature works end-to-end in development

---

## 🔒 VIOLATION PROTOCOL

| Violation | Enforcement | Result |
|-----------|------------|--------|
| Hardcoded Tailwind color | ESLint `no-restricted-syntax` | Pre-commit blocked |
| Direct lucide/react-icons import | ESLint `no-restricted-imports` | Pre-commit blocked |
| Direct Supabase import in app | ESLint `no-restricted-imports` | Pre-commit blocked |
| framer-motion / gsap import | ESLint `no-restricted-imports` | Pre-commit blocked |
| TypeScript error | `pnpm typecheck` | CI gate failed |
| Business logic in component | Code review rejection | PR blocked |
| Custom CSS color variable | Code review rejection | PR blocked |

---

## 📋 DEVELOPER QUICK REFERENCE

```
ICONS:      import { Icon } from "@workspace/ui/icons"  (@remixicon/react via wrapper)
COMPONENTS: import { ... } from "@workspace/ui"  (shadcn radix-lyra)
COLORS:     bg-primary, text-foreground, border-border  (NO bg-blue-500, #hex, rgb())
DEPTH:      bg-bg-base, bg-bg-panel, bg-bg-surface, bg-bg-overlay
BORDERS:    border-border-subtle/default/strong/primary
SHADOWS:    shadow-brutal, shadow-brutal-sm, shadow-brutal-primary
STATUS:     bg-status-active, text-status-active
FONTS:      font-sans (Geist)  font-mono (Geist Mono)  font-heading (Lora)
ANIMATION:  animate-in fade-in slide-in-from-* duration-*  (tw-animate-css ONLY)
            + CSS @keyframes in globals.css (grid-drift, marquee-scroll)
            + requestAnimationFrame / setInterval (scroll / text effects)
            + View Transitions API (theme toggle)
ATMOSPHERE: NoiseOverlay, GridBackground, ScrollProgress, TextScramble, Marquee
DATA:       via packages/services → packages/database  (NEVER direct Supabase in components)
RADIUS:     var(--radius-sm/md/lg/xl)  (NOT rounded-lg)
SPACING:    Tailwind scale (p-4, m-6)  (NO arbitrary [px] values)
PACKAGES:   pnpm ONLY  (NO npm, NO yarn)
GEOMETRY:   ZERO curves — all straight lines, sharp corners
```

---

## 🧠 KARPATHY CODING PROTOCOL (Mandatory — Every Non-Trivial Task)

> Full skill: `.agents/skills/karpathy-coding/SKILL.md`
> Source: [Andrej Karpathy's LLM coding pitfalls](https://x.com/karpathy/status/2015883857489522876)

Apply these four principles alongside The Twelve Laws:

| # | Principle | Core Rule |
|---|-----------|-----------|
| P1 | **Think Before Coding** | State assumptions. Surface ambiguity. Ask before guessing. Never pick silently. |
| P2 | **Simplicity First** | Minimum code for today's problem. No speculative abstractions or features. |
| P3 | **Surgical Changes** | Touch only what was asked. Match existing style. Mention — don't delete — unrelated dead code. |
| P4 | **Goal-Driven Execution** | Define verifiable success criteria first. Run the verification ladder: `typecheck → lint → test → build → browser` |

### Pre-flight Checklist (run before implementing anything)

```
[ ] Which package does this code belong in?
[ ] Does this violate any of The Twelve Laws?
[ ] Am I installing a forbidden package?
[ ] Is business logic ending up in a component?
[ ] Am I making assumptions I should ask about instead?
[ ] Have I defined what "done" looks like before writing code?
```

### Violation Response

```
"I can't do that — it violates [LAW X / Principle N].
What you asked: [restate]
Why it violates: [brief]
Compliant approach: [alternative]"
```
