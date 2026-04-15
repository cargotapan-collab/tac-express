# TAC EXPRESS — IMPLEMENTATION PLAN
## Enterprise Logistics Operating System
### Version 2.0 | Stack-Verified & Governance-Enforced

---

> **Document Classification:** Internal Technical Reference — Authoritative  
> **Supersedes:** Implementation Plan v1.0  
> **Status:** Active — Reflects Bootstrapped Production Skeleton  
> **Critical Change:** All technology references now match the verified installed stack audit.  
> **Highest Priority:** UI/UX consistency enforced at tooling level, not team discipline.

---

## ⚠️ WHAT CHANGED FROM v1.0

The following corrections are **mandatory**. Any developer or AI agent referencing v1.0 must discard it.

| Topic | v1.0 (Wrong) | v2.0 (Correct — Installed) |
|---|---|---|
| Icons | Lucide React (wrapper) | **Remix Icon** (`@remixicon/react` ^4.9.0) |
| Animation | Motion / Framer Motion | **tw-animate-css** ^1.4.0 |
| Next.js | 15.x | **16.1.6** |
| Primary Color | TAC Blue `oklch(0.56 0.24 264)` | **Purple** `oklch(0.491 0.27 292.581)` (installed) |
| shadcn style | default | **radix-lyra** |
| Font source | `packages/ui/fonts.ts` | **`apps/web/app/layout.tsx`** via `next/font/google` |
| Chart lib | Recharts (not installed) | **To be added — Recharts or shadcn charts** |

---

## TABLE OF CONTENTS

1. [Project Identity & Strategic Context](#1-project-identity--strategic-context)
2. [Architecture Decision Record (ADR)](#2-architecture-decision-record-adr)
3. [Verified Technology Stack](#3-verified-technology-stack)
4. [Monorepo Structure — Source of Truth](#4-monorepo-structure--source-of-truth)
5. [Design System — Installed & Locked](#5-design-system--installed--locked)
6. [Governance Rules — Zero Exceptions](#6-governance-rules--zero-exceptions)
7. [Shared Components Strategy](#7-shared-components-strategy)
8. [ESLint Enforcement Configuration](#8-eslint-enforcement-configuration)
9. [Authentication Architecture](#9-authentication-architecture)
10. [Phased Implementation Plan](#10-phased-implementation-plan)
11. [Module Build Specifications](#11-module-build-specifications)
12. [Database Architecture](#12-database-architecture)
13. [Scanner Engine Design](#13-scanner-engine-design)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Quality Gates & Definition of Done](#15-quality-gates--definition-of-done)

---

## 1. Project Identity & Strategic Context

### 1.1 What TAC Express Is

TAC Express is a **Logistics Operating System**, not a cargo management application. It is a full-scale, enterprise-grade platform for Tapan Associate Cargo.

| Layer | Function |
|---|---|
| Customer Layer | Landing page, public shipment tracking, AI chatbot, contact form |
| Operations Layer | Shipment creation, invoicing, barcode label generation |
| Warehouse Layer | Scan-based workflows, manifest batch operations, inventory |
| Financial Layer | Invoice PDF, GST calculation, WhatsApp delivery, payment tracking |
| Intelligence Layer | Analytics dashboard, real-time activity feed, AI assistant |

### 1.2 Core Business Flow

```
Booking → Shipment Creation → CN + SSCC Generation → Label Print →
Scan (Receive) → Manifest Load → Transit → Scan (Arrive) →
Scan (Deliver) → Invoice Settlement → WhatsApp PDF
```

### 1.3 Current State of the Codebase

The monorepo skeleton is **fully scaffolded and production-ready**. The infrastructure is excellent. What is empty:

```
apps/web/app/page.tsx       → placeholder only
apps/web/hooks/             → empty
apps/web/lib/               → empty
packages/ui/src/hooks/      → empty
packages/ui/src/components/ → Button only (+ shadcn config)
```

**The build priority is: build on what exists — do not replace or duplicate.**

---

## 2. Architecture Decision Record (ADR)

### ADR-001: Monorepo (Turborepo + pnpm) — CONFIRMED

**Status:** In place. Do not alter workspace layout.  
**Rule:** All shared logic lives in `packages/`. Apps only consume packages.

### ADR-002: Mandatory Service Layer — CONFIRMED

```
UI Component → Service Function → Database Query → Supabase
```

No component in `apps/web` may call Supabase directly. No exceptions.

### ADR-003: Clerk Auth + Supabase Database — CONFIRMED

Clerk handles authentication. Supabase handles data only. Never mix.

### ADR-004: `packages/ui` as UI Boundary — CONFIRMED

`@workspace/ui` is the **only** source of components. No component is built inside `apps/web/components/` unless it is an app-shell layout wrapper that has no business elsewhere.

### ADR-005: Event-Driven Tracking — CONFIRMED

Shipment status is never stored as a direct field. Status is always **derived from the latest tracking event**.

### ADR-006: Icon Library is Remix Icon — LOCKED ✅

`@remixicon/react` is installed and is the **only** icon library permitted. Lucide React is not installed and must never be added.

### ADR-007: Animation is tw-animate-css — LOCKED ✅

`tw-animate-css` is installed via `globals.css`. No external animation library (Framer Motion, Motion, GSAP) is permitted unless explicitly approved and added to this document.

### ADR-008: Font System is Locked in layout.tsx — LOCKED ✅

Fonts (Geist, Geist Mono, Lora) are configured in `apps/web/app/layout.tsx` via `next/font/google`. The CSS variables `--font-sans`, `--font-mono`, `--font-heading` are injected into `<html>`. No other font source is permitted.

---

## 3. Verified Technology Stack

### 3.1 Installed & Active Stack (Source of Truth)

> These packages ARE installed. Do not install alternatives.

| Category | Package | Version | Role |
|---|---|---|---|
| Framework | `next` | 16.1.6 | App framework (App Router, RSC) |
| React | `react` | ^19.2.4 | UI runtime |
| Monorepo | `turbo` | ^2.8.17 | Task orchestration |
| Package Manager | `pnpm` | 9.15.9 | Dependency management |
| Language | `typescript` | 5.9.3 | Type safety |
| CSS Framework | `tailwindcss` | ^4.1.18 | Styling (v4, CSS-first) |
| PostCSS | `@tailwindcss/postcss` | ^4.1.18 | CSS processing |
| Animation | `tw-animate-css` | ^1.4.0 | CSS animations (via @import) |
| Component System | `shadcn` | ^4.1.2 | Component scaffolding (radix-lyra) |
| Headless UI | `radix-ui` | ^1.4.3 | Accessible primitives |
| Icons | `@remixicon/react` | ^4.9.0 | Icon set (ONLY permitted) |
| Theme | `next-themes` | ^0.4.6 | Dark/light mode |
| Validation | `zod` | ^3.25.76 | Schema validation |
| Class Utility | `clsx` | ^2.1.1 | Class name composition |
| Class Merging | `tailwind-merge` | ^3.5.0 | Tailwind class deduplication |
| Variants | `class-variance-authority` | ^0.7.1 | Component variant API |
| Formatter | `prettier` | ^3.8.1 | Code formatting |
| Tailwind Sort | `prettier-plugin-tailwindcss` | ^0.7.2 | Class order enforcement |
| Linting | `eslint` | ^9.39.2 | Static analysis |

### 3.2 Packages to Add (Approved — Not Yet Installed)

These are the **only** packages approved for future addition. Nothing else is permitted without an ADR update.

| Package | Purpose | Phase |
|---|---|---|
| `@clerk/nextjs` | Authentication | Phase 2 |
| `@supabase/supabase-js` | Database client | Phase 2 |
| `react-hook-form` | Form state management | Phase 3 |
| `@hookform/resolvers` | Zod ↔ RHF bridge | Phase 3 |
| `bwip-js` | Barcode generation (Code128 / GS1-128) | Phase 4 |
| `@zxing/library` | Camera barcode scanning | Phase 4 |
| `@react-pdf/renderer` | PDF label + invoice generation | Phase 4 |
| `recharts` | Charts + analytics | Phase 7 |
| `idb-keyval` | IndexedDB for offline scan queue | Phase 4 |
| `ai` (Vercel AI SDK) | AI chatbot streaming | Phase 8 |
| `@anthropic-ai/sdk` | Claude API | Phase 8 |
| `@tanstack/react-query` | Server state + caching | Phase 2 |
| `zustand` | Client state management | Phase 2 |
| `sentry` | Error monitoring | Phase 10 |

### 3.3 Permanently Forbidden Packages

The following packages must **never** be installed. ESLint and PR reviews will enforce this.

```
lucide-react              → Use @remixicon/react only
framer-motion             → Use tw-animate-css only
@motionone/react          → Use tw-animate-css only
gsap                      → Use tw-animate-css only
styled-components          → Tailwind v4 tokens only
@mui/material              → shadcn / @workspace/ui only
antd                       → shadcn / @workspace/ui only
chakra-ui                  → shadcn / @workspace/ui only
moment                     → Use date-fns or native Intl API
lodash                     → Use native ES methods
axios                      → Use native fetch
```

---

## 4. Monorepo Structure — Source of Truth

### 4.1 Current Structure (Bootstrapped)

```
tac-express/
├── apps/
│   └── web/                          ← Next.js 16 App (App Router)
│       ├── app/
│       │   ├── layout.tsx            ← Fonts + ThemeProvider (DO NOT MOVE)
│       │   └── page.tsx              ← Empty placeholder → to be built
│       ├── components/
│       │   └── theme-provider.tsx    ← next-themes wrapper
│       ├── hooks/                    ← EMPTY → custom app hooks
│       ├── lib/                      ← EMPTY → app-level utilities
│       ├── next.config.mjs           ← transpilePackages: ["@workspace/ui"]
│       └── package.json
│
└── packages/
    ├── ui/                           ← @workspace/ui (Design System)
    │   ├── src/
    │   │   ├── components/
    │   │   │   └── button.tsx        ← Only component built so far
    │   │   ├── lib/
    │   │   │   └── utils.ts          ← cn() utility
    │   │   ├── hooks/                ← EMPTY
    │   │   └── styles/
    │   │       └── globals.css       ← OKLCH tokens + Tailwind imports
    │   ├── postcss.config.mjs
    │   └── package.json
    │
    ├── eslint-config/                ← Shared lint rules
    │   ├── base.js
    │   ├── next.js
    │   └── react-internal.js
    │
    └── typescript-config/            ← Shared tsconfig
        ├── base.json
        ├── nextjs.json
        └── react-library.json
```

### 4.2 Target Structure (Full Build)

```
tac-express/
├── apps/
│   └── web/
│       ├── app/
│       │   ├── layout.tsx                    ← Unchanged (fonts here)
│       │   │
│       │   ├── (public)/                     ← Public routes (no auth)
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx                  ← Landing page
│       │   │   └── track/
│       │   │       └── page.tsx              ← Public tracking
│       │   │
│       │   ├── (auth)/                       ← Clerk auth routes
│       │   │   └── sign-in/[[...sign-in]]/
│       │   │       └── page.tsx
│       │   │
│       │   └── (dashboard)/                  ← Protected routes
│       │       ├── layout.tsx                ← AppShell (sidebar + header)
│       │       ├── dashboard/page.tsx
│       │       ├── shipments/
│       │       │   ├── page.tsx
│       │       │   └── new/page.tsx
│       │       ├── invoice/page.tsx
│       │       ├── manifest/page.tsx
│       │       ├── scanning/page.tsx
│       │       ├── customers/page.tsx
│       │       ├── inventory/page.tsx
│       │       ├── analytics/page.tsx
│       │       └── settings/page.tsx
│       │
│       ├── api/
│       │   ├── track/route.ts                ← Public tracking API
│       │   ├── chat/route.ts                 ← AI chatbot (streaming)
│       │   └── webhooks/
│       │       └── clerk/route.ts            ← User sync webhook
│       │
│       ├── components/                       ← App-shell only
│       │   └── theme-provider.tsx            ← Existing (keep)
│       │
│       ├── hooks/                            ← App-level hooks
│       │   ├── use-scan.ts
│       │   ├── use-shipment.ts
│       │   └── use-realtime.ts
│       │
│       ├── lib/                              ← App-level utilities
│       │   └── query-client.ts
│       │
│       └── middleware.ts                     ← Clerk auth guard
│
└── packages/
    ├── ui/                                   ← @workspace/ui
    │   └── src/
    │       ├── components/
    │       │   ├── primitives/               ← shadcn wrappers
    │       │   │   ├── button.tsx            ← Existing
    │       │   │   ├── input.tsx
    │       │   │   ├── select.tsx
    │       │   │   ├── dialog.tsx
    │       │   │   ├── dropdown-menu.tsx
    │       │   │   ├── card.tsx
    │       │   │   ├── badge.tsx
    │       │   │   ├── table.tsx
    │       │   │   ├── tabs.tsx
    │       │   │   ├── tooltip.tsx
    │       │   │   ├── separator.tsx
    │       │   │   ├── skeleton.tsx
    │       │   │   ├── toast.tsx
    │       │   │   ├── progress.tsx
    │       │   │   └── sidebar.tsx
    │       │   │
    │       │   └── composed/                 ← Business compositions
    │       │       ├── data-table.tsx
    │       │       ├── status-badge.tsx
    │       │       ├── kpi-card.tsx
    │       │       ├── scan-feedback.tsx
    │       │       ├── step-indicator.tsx
    │       │       ├── shipment-timeline.tsx
    │       │       ├── customer-select.tsx
    │       │       ├── page-header.tsx
    │       │       ├── app-shell.tsx
    │       │       ├── empty-state.tsx
    │       │       └── form-section.tsx
    │       │
    │       ├── icons/
    │       │   └── index.tsx                 ← Remix Icon wrapper (enforced)
    │       │
    │       ├── lib/
    │       │   └── utils.ts                  ← Existing cn()
    │       │
    │       ├── hooks/
    │       │   ├── use-theme.ts
    │       │   └── use-media-query.ts
    │       │
    │       └── styles/
    │           └── globals.css               ← Existing OKLCH tokens
    │
    ├── types/                                ← Domain type definitions
    ├── services/                             ← Business logic
    ├── database/                             ← Supabase access layer
    ├── auth/                                 ← Clerk integration + RBAC
    ├── scanner/                              ← Scanning engine
    ├── config/                               ← Constants + feature flags
    ├── utils/                                ← Shared utilities
    ├── eslint-config/                        ← Existing (to be extended)
    └── typescript-config/                    ← Existing (unchanged)
```

---

## 5. Design System — Installed & Locked

### 5.1 The Constraint Principle

> **The design system is not a preference. It is a physical constraint enforced by tooling.**  
> There is no "I'll just hardcode this once." There is only the design system, or a build failure.

### 5.2 Installed OKLCH Color Tokens (Exact Values)

These tokens are defined in `packages/ui/src/styles/globals.css`. They are the **only** colors permitted in this project. Do not define new CSS custom properties for color anywhere else.

```css
/* LIGHT MODE — ACTIVE TOKENS */
--background:            oklch(1 0 0)
--foreground:            oklch(0.147 0.004 49.3)

--primary:               oklch(0.491 0.27 292.581)    /* Purple — TAC Brand */
--primary-foreground:    oklch(0.969 0.016 293.756)

--secondary:             oklch(0.967 0.001 286.375)
--secondary-foreground:  oklch(0.21 0.006 285.885)

--muted:                 oklch(0.96 0.002 17.2)
--muted-foreground:      oklch(0.554 0.023 17.3)

--accent:                oklch(0.96 0.002 17.2)
--accent-foreground:     oklch(0.21 0.002 17.6)

--destructive:           oklch(0.577 0.245 27.325)    /* Red — errors */
--border:                oklch(0.922 0.005 34.3)
--input:                 oklch(0.87 0.005 34.3)
--ring:                  oklch(0.491 0.27 292.581)    /* Matches primary */

--radius:                0.875rem

/* CHART COLORS (5 tokens) */
--chart-1:               oklch(0.646 0.222 41.116)    /* Amber warm */
--chart-2:               oklch(0.6 0.118 184.704)
--chart-3:               oklch(0.398 0.07 227.392)
--chart-4:               oklch(0.828 0.189 84.429)
--chart-5:               oklch(0.769 0.188 70.08)

/* DARK MODE — ACTIVE TOKENS */
--background:            oklch(0.147 0.004 49.3)
--foreground:            oklch(0.985 0.001 106.423)
--primary:               oklch(0.541 0.281 293.009)
/* ... full dark set in globals.css */

/* SIDEBAR TOKENS (separate theme) */
--sidebar:               oklch(0.21 0.006 285.885)
--sidebar-foreground:    oklch(0.985 0.001 106.423)
--sidebar-primary:       oklch(0.541 0.281 293.009)
--sidebar-accent:        oklch(0.274 0.006 286.033)
--sidebar-border:        oklch(0.274 0.006 286.033)
```

### 5.3 Radius Scale (Derived from `--radius: 0.875rem`)

| Token | Formula | Computed Value |
|---|---|---|
| `--radius-sm` | `radius × 0.6` | `0.525rem` |
| `--radius-md` | `radius × 0.8` | `0.7rem` |
| `--radius-lg` | `radius` (base) | `0.875rem` |
| `--radius-xl` | `radius × 1.4` | `1.225rem` |
| `--radius-2xl` | `radius × 1.8` | `1.575rem` |
| `--radius-3xl` | `radius × 2.2` | `1.925rem` |
| `--radius-4xl` | `radius × 2.6` | `2.275rem` |

**Usage rule:** Always use `var(--radius-*)` tokens. Never use `rounded-lg` or raw border-radius values.

### 5.4 Typography System (Locked)

Fonts are configured in `apps/web/app/layout.tsx`. The CSS variables are injected on `<html>`.

```typescript
// apps/web/app/layout.tsx — DO NOT MODIFY FONT SECTION

import { Geist, Geist_Mono, Lora } from "next/font/google"

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

const lora = Lora({
  variable: "--font-heading",
  subsets: ["latin"],
})
```

| Variable | Font | Usage |
|---|---|---|
| `--font-sans` | Geist | UI labels, body text, forms |
| `--font-mono` | Geist Mono | CN numbers, codes, barcodes, default body |
| `--font-heading` | Lora | Page headings, section titles, hero text |

**Current behavior:** `<html>` applies `font-mono` (Geist Mono) as the default body font with `antialiased`. This is intentional — CN numbers are everywhere in a logistics system.

**Usage rule:**
```tsx
// Heading text
<h1 className="font-heading text-3xl">Shipments</h1>

// Body / UI
<p className="font-sans text-sm text-muted-foreground">Description</p>

// CN / Code values
<span className="font-mono text-sm tracking-tight">TAC-26-000123</span>
```

### 5.5 Animation System (tw-animate-css)

`tw-animate-css` is imported globally via `globals.css`. These utility classes are available:

```css
/* Provided by tw-animate-css */
.animate-in           .animate-out
.fade-in              .fade-out
.slide-in-from-top    .slide-out-to-top
.slide-in-from-bottom .slide-out-to-bottom
.slide-in-from-left   .slide-out-to-left
.slide-in-from-right  .slide-out-to-right
.zoom-in              .zoom-out
.spin-in              .spin-out
```

Combined with Tailwind duration/delay utilities:

```tsx
// Correct — using installed animation system
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
  ...
</div>

// For scan feedback card
<div className="animate-in zoom-in-95 fade-in duration-200">
  <ScanFeedback />
</div>

// Staggered list items
<li className="animate-in fade-in slide-in-from-left-2 duration-200 delay-75">
```

**Rule:** No `transition-*` classes except for hover states on interactive elements. All entrance animations use `tw-animate-css` classes.

### 5.6 Icon System — Remix Icon (Enforced)

`@remixicon/react` is the **only** icon library. Icons are named with `Ri` prefix.

```typescript
// packages/ui/src/icons/index.tsx
// The ONLY way to use icons in this project

import type { SVGProps } from "react"
import * as RemixIcons from "@remixicon/react"

// Extract valid Remix Icon names from the library
type RemixIconName = keyof typeof RemixIcons

export interface IconProps extends SVGProps<SVGSVGElement> {
  name: RemixIconName
  size?: number
  className?: string
}

export function Icon({ name, size = 16, className, ...props }: IconProps) {
  const Component = RemixIcons[name] as React.FC<SVGProps<SVGSVGElement>>

  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[TAC Icon] "${name}" not found in @remixicon/react`)
    }
    return null
  }

  return (
    <Component
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    />
  )
}

// Named icon exports for logistics domain (strong typing + discoverability)
export const LogisticsIcons = {
  shipment:    "RiBox3Line",
  manifest:    "RiFileListLine",
  scan:        "RiBarcodeLine",
  customer:    "RiUserLine",
  invoice:     "RiReceiptLine",
  analytics:   "RiLineChartLine",
  tracking:    "RiMapPin2Line",
  warehouse:   "RiBuilding4Line",
  settings:    "RiSettings4Line",
  dashboard:   "RiDashboard3Line",
  transit:     "RiTruckLine",
  delivered:   "RiCheckboxCircleLine",
  alert:       "RiAlertLine",
  whatsapp:    "RiWhatsappLine",
  print:       "RiPrinterLine",
  download:    "RiDownloadLine",
  upload:      "RiUploadLine",
  search:      "RiSearchLine",
  filter:      "RiFilter3Line",
  add:         "RiAddLine",
  close:       "RiCloseLine",
  menu:        "RiMenuLine",
  chevronRight:"RiArrowRightSLine",
  chevronDown: "RiArrowDownSLine",
  logout:      "RiLogoutBoxLine",
} as const satisfies Record<string, RemixIconName>
```

**Usage examples:**

```tsx
// ✅ CORRECT — using the Icon wrapper from @workspace/ui
import { Icon, LogisticsIcons } from "@workspace/ui/icons"

<Icon name="RiBox3Line" size={20} className="text-primary" />
<Icon name={LogisticsIcons.shipment} size={20} />

// ✅ Also permitted — direct import for performance in large lists
import { RiBox3Line } from "@remixicon/react"
// (Only when coming from @workspace/ui re-export)

// ❌ FORBIDDEN — direct lucide import
import { Package } from "lucide-react"    // lucide is NOT installed

// ❌ FORBIDDEN — any other icon set
import { FaBox } from "react-icons/fa"    // not installed
```

### 5.7 shadcn Configuration (Locked)

```json
// components.json (existing — do not modify)
{
  "style": "radix-lyra",
  "baseColor": "neutral",
  "cssVariables": true,
  "rsc": true,
  "tsx": true,
  "iconLibrary": "@remixicon/react"
}
```

All shadcn components added via CLI will automatically use:
- Radix Lyra style
- Remix Icon set
- CSS variable tokens
- RSC-compatible output

**Adding new shadcn components:**

```bash
# Always run from packages/ui root
cd packages/ui
pnpm dlx shadcn@latest add [component-name]

# Examples:
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add table
```

Components land in `packages/ui/src/components/` — always move to `primitives/` subfolder after generation.

---

## 6. Governance Rules — Zero Exceptions

### 6.1 The Ten Laws

These are non-negotiable. Violations produce build failures, not warnings.

```
LAW 1:  No color value may exist outside packages/ui/src/styles/globals.css
LAW 2:  No icon import except @remixicon/react via @workspace/ui/icons wrapper
LAW 3:  No animation library except tw-animate-css classes
LAW 4:  No font declaration except in apps/web/app/layout.tsx (existing)
LAW 5:  No UI component built in apps/web — only in packages/ui
LAW 6:  No database call in any component — only via packages/services
LAW 7:  No business logic in components — only in packages/services
LAW 8:  No Supabase import in apps/web — only via packages/database
LAW 9:  No hardcoded spacing, radius, or shadow values
LAW 10: No Tailwind color class (bg-blue-500, text-red-400) — only semantic tokens
```

### 6.2 What "Semantic Tokens Only" Means

```tsx
// ❌ FORBIDDEN — hardcoded Tailwind color
<div className="bg-blue-500 text-white border-gray-200">

// ❌ FORBIDDEN — hardcoded OKLCH/hex
<div style={{ backgroundColor: "oklch(0.491 0.27 292.581)" }}>

// ✅ CORRECT — semantic token via Tailwind CSS v4
<div className="bg-primary text-primary-foreground border-border">

// ✅ CORRECT — semantic token via CSS var directly
<div style={{ backgroundColor: "var(--primary)" }}>
```

### 6.3 Spacing Rules

Tailwind's default spacing scale is permitted (`p-4`, `m-6`, `gap-3`). What is not permitted:

```tsx
// ❌ FORBIDDEN — arbitrary values
<div className="p-[13px] mt-[27px] gap-[6.5px]">

// ❌ FORBIDDEN — inline styles for spacing
<div style={{ padding: "13px", marginTop: "27px" }}>

// ✅ CORRECT — Tailwind spacing scale
<div className="p-4 mt-6 gap-2">
```

### 6.4 Component Authoring Rules

When building a component in `packages/ui`:

1. **Start with shadcn CLI** if the component exists in shadcn
2. **Wrap, don't replace** — extend shadcn primitives with `cva()` for variants
3. **Never** build a custom modal, dropdown, tooltip, or popover from scratch
4. **Export from `packages/ui/src/components/index.ts`** — no direct file imports in apps

```typescript
// packages/ui/src/components/index.ts
export * from "./primitives/button"
export * from "./primitives/input"
export * from "./primitives/card"
// ... all primitives

export * from "./composed/data-table"
export * from "./composed/status-badge"
export * from "./composed/kpi-card"
// ... all composed
```

### 6.5 File Naming Convention

| Type | Convention | Example |
|---|---|---|
| Components | kebab-case | `status-badge.tsx` |
| Hooks | kebab-case with `use-` prefix | `use-scan.ts` |
| Services | camelCase | `shipmentService.ts` |
| Types | PascalCase for interface/type | `Shipment`, `TrackingEvent` |
| Constants | SCREAMING_SNAKE_CASE | `SCAN_SPEED_THRESHOLD` |
| API routes | `route.ts` | `app/api/track/route.ts` |

---

## 7. Shared Components Strategy

### 7.1 Component Build Order (Phase 1)

Build in this exact order — each depends on the previous:

**Tier 1 — Primitives (from shadcn CLI)**

```bash
# Run these commands from packages/ui/
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add skeleton
pnpm dlx shadcn@latest add progress
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add sheet
pnpm dlx shadcn@latest add sidebar
pnpm dlx shadcn@latest add sonner        # Toasts
pnpm dlx shadcn@latest add scroll-area
pnpm dlx shadcn@latest add popover
pnpm dlx shadcn@latest add command       # For searchable selects
```

**Tier 2 — Composed (business-domain)**

| Component | Description | Dependencies |
|---|---|---|
| `StatusBadge` | Maps shipment status to color + label | Badge |
| `KpiCard` | Dashboard metric card with icon + trend | Card, Icon |
| `ScanFeedback` | Green/Red/Yellow result panel | Card, Icon, Badge |
| `DataTable` | Table + pagination + search + filters | Table, Input, Button |
| `StepIndicator` | Multi-step form progress bar | Badge, Separator |
| `ShipmentTimeline` | Vertical event tracking display | Separator, Badge, Icon |
| `CustomerSelect` | Searchable customer dropdown | Command, Popover, Input |
| `FormSection` | Labeled form group wrapper | Card, Label, Separator |
| `PageHeader` | Page title + breadcrumb + actions | Button, Icon |
| `AppShell` | Sidebar + header + content layout | Sidebar, Sheet |
| `EmptyState` | No-data placeholder with CTA | Icon, Button |

### 7.2 StatusBadge Component Specification

```typescript
// packages/ui/src/components/composed/status-badge.tsx
import { Badge } from "../primitives/badge"
import { cva, type VariantProps } from "class-variance-authority"

// Shipment status → visual mapping
const STATUS_CONFIG = {
  CREATED:          { label: "Created",          variant: "outline"     },
  RECEIVED:         { label: "Received",         variant: "secondary"   },
  IN_TRANSIT:       { label: "In Transit",       variant: "default"     },
  ARRIVED:          { label: "Arrived",          variant: "secondary"   },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", variant: "default"     },
  DELIVERED:        { label: "Delivered",        variant: "success"     },
  DELAYED:          { label: "Delayed",          variant: "destructive" },
  CANCELLED:        { label: "Cancelled",        variant: "destructive" },
} as const

type ShipmentStatus = keyof typeof STATUS_CONFIG

interface StatusBadgeProps {
  status: ShipmentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <Badge variant={config.variant as any} className={className}>
      {config.label}
    </Badge>
  )
}
```

### 7.3 KpiCard Component Specification

```typescript
// packages/ui/src/components/composed/kpi-card.tsx
import { Card, CardContent, CardHeader } from "../primitives/card"
import { Icon, type IconProps } from "../../icons"
import { cn } from "../../lib/utils"

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: number          // percentage change
  icon: IconProps["name"]
  className?: string
}

export function KpiCard({ title, value, subtitle, change, icon, className }: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="font-sans text-sm text-muted-foreground">{title}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <Icon name={icon} size={16} className="text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-mono text-2xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 font-sans text-xs text-muted-foreground">{subtitle}</p>
        )}
        {change !== undefined && (
          <span className={cn(
            "mt-2 inline-flex items-center gap-1 font-sans text-xs",
            isPositive ? "text-chart-2" : "text-destructive"
          )}>
            <Icon
              name={isPositive ? "RiArrowUpLine" : "RiArrowDownLine"}
              size={12}
            />
            {Math.abs(change)}% from last period
          </span>
        )}
      </CardContent>
    </Card>
  )
}
```

### 7.4 ScanFeedback Component Specification

```typescript
// packages/ui/src/components/composed/scan-feedback.tsx
import { cn } from "../../lib/utils"
import { Icon } from "../../icons"

export type ScanResult =
  | "SUCCESS"
  | "NOT_FOUND"
  | "WRONG_STATUS"
  | "WRONG_LOCATION"
  | "DUPLICATE"
  | "INVALID"
  | "OFFLINE_QUEUED"

interface ScanFeedbackProps {
  result: ScanResult
  cn?: string
  message?: string
  className?: string
}

const RESULT_CONFIG: Record<ScanResult, {
  icon: string
  label: string
  classes: string
}> = {
  SUCCESS:        { icon: "RiCheckboxCircleLine", label: "Success",         classes: "bg-[color:oklch(0.55_0.18_145/0.1)] border-[oklch(0.55_0.18_145/0.3)] text-[oklch(0.55_0.18_145)]" },
  NOT_FOUND:      { icon: "RiSearchLine",         label: "Not Found",       classes: "bg-destructive/10 border-destructive/30 text-destructive" },
  WRONG_STATUS:   { icon: "RiAlertLine",          label: "Wrong Status",    classes: "bg-destructive/10 border-destructive/30 text-destructive" },
  WRONG_LOCATION: { icon: "RiMapPin2Line",        label: "Wrong Location",  classes: "bg-destructive/10 border-destructive/30 text-destructive" },
  DUPLICATE:      { icon: "RiFileCopyLine",       label: "Duplicate Scan",  classes: "bg-[color:oklch(0.72_0.19_75/0.1)] border-[oklch(0.72_0.19_75/0.3)] text-[oklch(0.72_0.19_75)]" },
  INVALID:        { icon: "RiCloseLine",          label: "Invalid Code",    classes: "bg-destructive/10 border-destructive/30 text-destructive" },
  OFFLINE_QUEUED: { icon: "RiWifiOffLine",        label: "Queued Offline",  classes: "bg-primary/10 border-primary/30 text-primary" },
}

export function ScanFeedback({ result, cn: cnNumber, message, className }: ScanFeedbackProps) {
  const config = RESULT_CONFIG[result]

  return (
    <div className={cn(
      "animate-in zoom-in-95 fade-in duration-200",
      "flex items-start gap-3 rounded-lg border p-4",
      config.classes,
      className
    )}>
      <Icon name={config.icon as any} size={20} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-sans text-sm font-medium">{config.label}</p>
        {cnNumber && (
          <p className="font-mono text-xs opacity-80">{cnNumber}</p>
        )}
        {message && (
          <p className="mt-1 font-sans text-xs opacity-70">{message}</p>
        )}
      </div>
    </div>
  )
}
```

---

## 8. ESLint Enforcement Configuration

### 8.1 Extending the Existing Config

The project already has `packages/eslint-config/` with `base.js`, `next.js`, and `react-internal.js`. We extend — not replace — these files.

```javascript
// packages/eslint-config/design-system.js  ← NEW FILE

"use strict"

/**
 * TAC Express Design System Governance Rules
 * These rules enforce strict UI/UX consistency.
 * All rules are set to "error" — violations block commits and CI.
 */
module.exports = {
  rules: {
    /**
     * LAW 2: No direct icon library imports.
     * All icons must come through @workspace/ui/icons wrapper.
     * Exception: @remixicon/react is permitted ONLY in packages/ui/src/icons/index.tsx
     */
    "no-restricted-imports": [
      "error",
      {
        paths: [
          // Block lucide (not installed but may be suggested by AI tools)
          {
            name: "lucide-react",
            message: "❌ [TAC LAW-2] lucide-react is not installed. Use Icon from @workspace/ui/icons.",
          },
          // Block direct shadcn imports in app code
          {
            name: "@/components/ui",
            message: "❌ [TAC LAW-5] Import components from @workspace/ui only.",
          },
          // Block direct Supabase in apps
          {
            name: "@supabase/supabase-js",
            message: "❌ [TAC LAW-8] Direct Supabase imports are forbidden in apps. Use @workspace/database.",
          },
          // Block forbidden packages
          {
            name: "framer-motion",
            message: "❌ [TAC LAW-3] framer-motion is not permitted. Use tw-animate-css classes.",
          },
          {
            name: "@motionone/react",
            message: "❌ [TAC LAW-3] Motion is not permitted. Use tw-animate-css classes.",
          },
          {
            name: "axios",
            message: "❌ Use native fetch API instead of axios.",
          },
          {
            name: "moment",
            message: "❌ Use date-fns or native Intl API instead of moment.",
          },
          {
            name: "lodash",
            message: "❌ Use native ES methods instead of lodash.",
          },
        ],
        patterns: [
          // Block react-icons entirely
          {
            group: ["react-icons", "react-icons/*"],
            message: "❌ [TAC LAW-2] react-icons is not permitted. Use @remixicon/react via @workspace/ui/icons.",
          },
          // Block MUI, Chakra, Ant Design
          {
            group: ["@mui/*", "@chakra-ui/*", "antd", "antd/*"],
            message: "❌ [TAC LAW-5] External UI libraries are not permitted. Use @workspace/ui only.",
          },
          // Block GSAP
          {
            group: ["gsap", "gsap/*"],
            message: "❌ [TAC LAW-3] GSAP is not permitted. Use tw-animate-css classes.",
          },
        ],
      },
    ],

    /**
     * LAW 10: No hardcoded Tailwind color utilities.
     * Developers must use semantic token classes (bg-primary, text-foreground, etc.)
     * This catches the most common form of design system violation.
     */
    "no-restricted-syntax": [
      "error",
      // Block named color utilities (bg-red-500, text-blue-400, etc.)
      {
        selector:
          "JSXAttribute[name.name='className'] > Literal[value=/\\b(bg|text|border|ring|outline|fill|stroke|shadow|decoration|caret|accent|from|to|via)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white)-[0-9]+\\b/]",
        message:
          "❌ [TAC LAW-10] Hardcoded Tailwind color class detected. Use semantic tokens: bg-primary, text-foreground, border-border, text-destructive, etc.",
      },
      // Block arbitrary color values in className
      {
        selector:
          "JSXAttribute[name.name='className'] > Literal[value=/\\[#[0-9a-fA-F]{3,8}\\]|\\[rgb|\\[hsl|\\[oklch/]",
        message:
          "❌ [TAC LAW-1] Arbitrary color value in className detected. Use CSS variables via var(--token) in style prop or semantic Tailwind class.",
      },
      // Block inline style color values
      {
        selector:
          "JSXAttribute[name.name='style'] > JSXExpressionContainer > ObjectExpression > Property[key.name=/(color|background|backgroundColor|borderColor|fill|stroke)/] > Literal[value=/^#|^rgb|^hsl|^blue|^red|^green/]",
        message:
          "❌ [TAC LAW-1] Hardcoded color in style prop. Use var(--token) CSS variables.",
      },
    ],
  },
}
```

### 8.2 Update Base ESLint Config to Include Governance Rules

```javascript
// packages/eslint-config/next.js — UPDATED (add design-system rules)

const { resolve } = require("node:path")
const designSystem = require("./design-system")

const project = resolve(process.cwd(), "tsconfig.json")

module.exports = {
  extends: [
    require.resolve("./base"),
    "next/core-web-vitals",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    // Merge design system governance
    ...designSystem.rules,

    // Existing rules
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
  },
  settings: {
    "import/resolver": {
      typescript: { project },
    },
  },
}
```

### 8.3 Pre-commit Hook (Husky + lint-staged)

```bash
# Install (run from repo root)
pnpm add -D husky lint-staged -w
pnpm exec husky init
```

```json
// package.json (root) — add lint-staged config
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{css,json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
pnpm exec lint-staged
```

### 8.4 CI/CD Enforcement (GitHub Actions)

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  gate:
    name: Design System + Architecture Enforcement
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9.15.9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: TypeScript — Zero errors permitted
        run: pnpm typecheck

      - name: ESLint — Zero warnings permitted
        run: pnpm lint -- --max-warnings 0

      - name: Prettier — Format check
        run: pnpm format --check

      - name: Build — All packages must compile
        run: pnpm build

      # PR is BLOCKED if any of the above fail.
      # Design system violations = ESLint errors = CI failure = no merge.
```

### 8.5 TypeScript Config Enforcement

```jsonc
// tooling/typescript-config/nextjs.json — enforce strict path rules
{
  "extends": "./base.json",
  "compilerOptions": {
    "paths": {
      "@workspace/ui":         ["../../packages/ui/src/index.ts"],
      "@workspace/ui/*":       ["../../packages/ui/src/*"],
      "@workspace/types":      ["../../packages/types/src/index.ts"],
      "@workspace/types/*":    ["../../packages/types/src/*"],
      "@workspace/services":   ["../../packages/services/src/index.ts"],
      "@workspace/services/*": ["../../packages/services/src/*"],
      "@workspace/database":   ["../../packages/database/src/index.ts"],
      "@workspace/auth":       ["../../packages/auth/src/index.ts"],
      "@workspace/scanner":    ["../../packages/scanner/src/index.ts"],
      "@workspace/config":     ["../../packages/config/src/index.ts"],
      "@workspace/utils":      ["../../packages/utils/src/index.ts"],
      "@/*":                   ["./*"]
    }
  }
}
```

---

## 9. Authentication Architecture

### 9.1 Clerk + Supabase Flow

```
User → Landing Page
         ↓
    [Login Button] → Clerk Sign-In
         ↓
    JWT issued by Clerk
         ↓
    Next.js middleware.ts validates token
         ↓
    /dashboard loads (protected)
         ↓
    Supabase client initialized with Clerk JWT
         ↓
    Row Level Security scopes data to user's org
```

### 9.2 Middleware (Clerk Route Protection)

```typescript
// apps/web/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/track(.*)",
  "/api/track(.*)",
  "/api/chat(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)","/(api|trpc)(.*)"],
}
```

### 9.3 Supabase Client with Clerk JWT

```typescript
// packages/database/src/client.ts
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types/supabase"

// Server-side client (with Clerk JWT)
export async function createServerClient(clerkToken: string) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${clerkToken}` },
      },
      auth: { persistSession: false },
    }
  )
}

// Browser client (public read — tracking page only)
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 9.4 RBAC Permission Map

```typescript
// packages/auth/src/rbac.ts
export const ROLES = [
  "admin",
  "manager",
  "ops",
  "warehouse",
  "finance",
  "customer_support",
] as const

export type Role = (typeof ROLES)[number]

export const PERMISSIONS = {
  "shipment:create":  ["admin", "manager", "ops"],
  "shipment:read":    ["admin", "manager", "ops", "warehouse", "finance", "customer_support"],
  "shipment:delete":  ["admin"],
  "scan:execute":     ["admin", "manager", "warehouse", "ops"],
  "manifest:create":  ["admin", "manager", "ops"],
  "manifest:close":   ["admin", "manager"],
  "invoice:create":   ["admin", "manager", "finance", "ops"],
  "invoice:view":     ["admin", "manager", "finance", "ops", "customer_support"],
  "customer:manage":  ["admin", "manager", "ops"],
  "analytics:view":   ["admin", "manager", "finance"],
  "settings:manage":  ["admin"],
  "user:manage":      ["admin"],
} as const satisfies Record<string, readonly Role[]>

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role)
}
```

---

## 10. Phased Implementation Plan

### Phase Calendar

```
PHASE 0:  Infrastructure Verification     [Day 1]
PHASE 1:  Design System (UI Package)      [Days 2–4]
PHASE 2:  Auth + Data Layer               [Days 5–7]
PHASE 3:  Shipment + Invoice Core         [Days 8–11]
PHASE 4:  Label + Barcode + Scanning      [Days 12–15]
PHASE 5:  Manifest + Tracking             [Days 16–18]
PHASE 6:  Landing Page + Public Layer     [Days 19–21]
PHASE 7:  Dashboard + Analytics           [Days 22–24]
PHASE 8:  AI Chatbot + WhatsApp           [Days 25–27]
PHASE 9:  Inventory + Advanced            [Days 28–30]
PHASE 10: QA + Hardening + Deployment     [Days 31–35]
```

---

### PHASE 0: Infrastructure Verification (Day 1)

**Goal:** Confirm the bootstrapped skeleton is correctly wired before building on it.

```bash
# From repo root
pnpm install           # Must complete without errors
pnpm dev               # apps/web must start on localhost:3000
pnpm build             # Must succeed
pnpm typecheck         # Must pass with 0 errors
pnpm lint              # Must pass (after design-system.js is added)
```

**Checklist:**
- [ ] `pnpm dev` starts successfully
- [ ] Dark mode toggle (press `d`) switches theme
- [ ] `@workspace/ui` Button imports and renders
- [ ] OKLCH tokens load (inspect CSS vars in browser devtools)
- [ ] Remix Icon renders: `import { RiBox3Line } from "@remixicon/react"`
- [ ] `packages/eslint-config/design-system.js` created and wired
- [ ] Pre-commit hook installed (Husky + lint-staged)

**New packages to create (stubs only):**
```bash
mkdir -p packages/{types,services,database,auth,scanner,config,utils}/src
# Create package.json + tsconfig.json + src/index.ts in each
```

---

### PHASE 1: Design System (Days 2–4)

**Goal:** `@workspace/ui` is complete. Every component the app needs exists here.

#### Day 2 — Primitives

```bash
cd packages/ui

# Add all required shadcn primitives
pnpm dlx shadcn@latest add input label
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add table
pnpm dlx shadcn@latest add dialog
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add skeleton
pnpm dlx shadcn@latest add progress
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add sheet
pnpm dlx shadcn@latest add scroll-area
pnpm dlx shadcn@latest add popover
pnpm dlx shadcn@latest add command
pnpm dlx shadcn@latest add sonner
pnpm dlx shadcn@latest add sidebar
```

Move all generated files to `src/components/primitives/`.

#### Day 3 — Icon Wrapper + Composed Components

1. Create `packages/ui/src/icons/index.tsx` (full specification in Section 5.6)
2. Build composed components:
   - `StatusBadge` (Section 7.2)
   - `KpiCard` (Section 7.3)
   - `ScanFeedback` (Section 7.4)
   - `StepIndicator`
   - `DataTable`
   - `EmptyState`

#### Day 4 — Layout Components + Barrel Export

1. Build `AppShell` (sidebar + header using shadcn `Sidebar`)
2. Build `PageHeader`
3. Build `FormSection`
4. Update `packages/ui/src/components/index.ts` with all exports
5. Update `packages/ui/src/index.ts` root barrel

**✅ Phase 1 Done When:**
```typescript
// This works in apps/web with zero import errors
import {
  Button, Input, Card, Badge, Table, Dialog, Tabs,
  DataTable, StatusBadge, KpiCard, ScanFeedback,
  AppShell, PageHeader, StepIndicator
} from "@workspace/ui"

import { Icon, LogisticsIcons } from "@workspace/ui/icons"

// And ESLint blocks this:
import { RiBox3Line } from "@remixicon/react" // ← ERROR in apps/
```

---

### PHASE 2: Auth + Data Layer (Days 5–7)

#### Day 5 — Clerk Setup

```bash
cd apps/web
pnpm add @clerk/nextjs
```

```typescript
// apps/web/app/layout.tsx — wrap with ClerkProvider
import { ClerkProvider } from "@clerk/nextjs"

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable} ${geistMono.variable} ${lora.variable}`}>
        ...
      </html>
    </ClerkProvider>
  )
}
```

Create `apps/web/middleware.ts` (Section 9.2).
Create `apps/web/app/(auth)/sign-in/[[...sign-in]]/page.tsx`.

#### Day 6 — Supabase + packages/database

```bash
pnpm add @supabase/supabase-js -w
cd packages/database && pnpm add @supabase/supabase-js
```

- Configure `packages/database/src/client.ts` (Section 9.3)
- Generate Supabase types: `supabase gen types typescript --local > src/types/supabase.ts`
- Build typed query functions for: `shipments`, `customers`, `invoices`, `tracking`, `manifests`

#### Day 7 — Auth Package + TanStack Query Setup

```bash
# From repo root
pnpm add @tanstack/react-query zustand -w
```

- Build `packages/auth/src/rbac.ts` (Section 9.4)
- Create `apps/web/lib/query-client.ts`
- Wrap `apps/web/app/layout.tsx` with `QueryClientProvider`
- Build Clerk webhook handler: `apps/web/app/api/webhooks/clerk/route.ts`

**✅ Phase 2 Done When:**
- Sign in via Clerk redirects to `/dashboard`
- Protected routes reject unauthenticated requests
- Supabase query executes with Clerk JWT and returns scoped data

---

### PHASE 3: Shipment + Invoice Core (Days 8–11)

#### Day 8 — Domain Types

Create all types in `packages/types/src/`:

```typescript
// packages/types/src/shipment.ts
export type ShipmentMode = "AIR" | "SURFACE"
export type ShipmentStatus =
  | "CREATED" | "RECEIVED" | "IN_TRANSIT"
  | "ARRIVED" | "OUT_FOR_DELIVERY" | "DELIVERED"
  | "DELAYED" | "CANCELLED"

export interface Shipment {
  id:               string
  org_id:           string
  cn:               string               // TAC-26-000123
  sscc?:            string               // GS1 SSCC
  customer_id:      string
  mode:             ShipmentMode
  origin:           string
  destination:      string
  pieces:           number
  weight:           number
  declared_value?:  number
  consignee_name:   string
  consignee_phone:  string
  consignee_address:string
  created_by:       string
  created_at:       string
}

export interface TrackingEvent {
  id:           string
  shipment_id:  string
  event_type:   ShipmentStatus
  hub_id?:      string
  location?:    string
  operator_id?: string
  notes?:       string
  created_at:   string
}
```

#### Day 9 — CN + SSCC Generation

```typescript
// packages/services/src/shipment/cnGenerator.ts
export function generateCN(year: number, sequence: number): string {
  const yy = String(year).slice(-2)
  const seq = String(sequence).padStart(6, "0")
  return `TAC-${yy}-${seq}`
}
// → TAC-26-000123

// packages/services/src/shipment/ssccGenerator.ts
export function generateSSCC(companyPrefix: string, serialRef: number): string {
  const extension = "0"
  const padLength = 16 - companyPrefix.length
  const paddedSerial = String(serialRef).padStart(padLength, "0")
  const raw = `${extension}${companyPrefix}${paddedSerial}`
  const checkDigit = calculateModulo10(raw)
  return `${raw}${checkDigit}`
}

function calculateModulo10(input: string): number {
  let sum = 0
  for (let i = 0; i < input.length; i++) {
    const digit = parseInt(input[input.length - 1 - i], 10)
    sum += i % 2 === 0 ? digit * 3 : digit
  }
  return (10 - (sum % 10)) % 10
}
```

#### Day 10 — Multi-Step Shipment Form

```bash
cd apps/web && pnpm add react-hook-form @hookform/resolvers
```

Build `apps/web/app/(dashboard)/shipments/new/page.tsx` using:
- `StepIndicator` from `@workspace/ui`
- `FormSection` from `@workspace/ui`
- `CustomerSelect` from `@workspace/ui`
- React Hook Form + Zod schemas for each step
- State persisted across steps via Zustand

**7 steps with Zod schemas:**

```typescript
// Step schemas (packages/types/src/forms/shipment-form.ts)
import { z } from "zod"

export const ShipmentModeSchema = z.object({
  mode: z.enum(["AIR", "SURFACE"]),
})

export const ShipmentDetailsSchema = z.object({
  origin:         z.string().min(2),
  destination:    z.string().min(2),
  pieces:         z.number().int().positive(),
  weight:         z.number().positive(),
  declared_value: z.number().optional(),
})

export const ConsigneeSchema = z.object({
  consignee_name:    z.string().min(2),
  consignee_phone:   z.string().regex(/^[0-9+\-\s]{10,15}$/),
  consignee_address: z.string().min(5),
})

// ... remaining step schemas
```

#### Day 11 — Submit + Service Layer

```typescript
// packages/services/src/shipment/shipmentService.ts
export const shipmentService = {
  async create(data: CreateShipmentInput, userId: string, orgId: string) {
    const sequence = await getNextSequence(orgId)
    const cn = generateCN(new Date().getFullYear(), sequence)
    const sscc = generateSSCC(ORG_PREFIX, sequence)

    // Atomic: create shipment + invoice + tracking event
    const { data: shipment, error } = await db.rpc("create_shipment_with_invoice", {
      p_cn: cn,
      p_sscc: sscc,
      p_user_id: userId,
      p_org_id: orgId,
      ...data,
    })

    if (error) throw new Error(error.message)
    return shipment
  },
}
```

**✅ Phase 3 Done When:**
- 7-step form completes without errors
- CN auto-generates on form open
- Invoice auto-creates on submit
- Tracking event `CREATED` is logged
- Shipment appears in shipments list with correct `StatusBadge`

---

### PHASE 4: Label + Barcode + Scanning (Days 12–15)

#### Day 12 — Barcode Generation

```bash
pnpm add bwip-js -w
pnpm add @zxing/library -w
```

```typescript
// packages/services/src/barcode/barcodeService.ts
import bwipjs from "bwip-js"

export async function generateCode128(cn: string): Promise<string> {
  // Returns base64 PNG
  const png = await bwipjs.toBuffer({
    bcid:        "code128",
    text:        cn,
    scale:       3,
    height:      12,
    includetext: false,
    guardwhitespace: true,
  })
  return `data:image/png;base64,${png.toString("base64")}`
}
```

#### Day 13 — Shipping Label PDF

```bash
pnpm add @react-pdf/renderer -w
```

4x6 thermal label layout:
```
┌──────────────────────────────────┐  ← 4 inches
│ FROM: [Sender Name]              │
│       [Sender Address]           │  ZONE 1
│ TO:   [Consignee Name]           │
│       [Consignee Address]        │
├──────────────────────────────────┤
│ CN: TAC-26-000123  MODE: AIR     │
│ WT: 5.2 KG  PCS: 3  ORG→DEST    │  ZONE 2
├──────────────────────────────────┤
│                                  │
│  ████████████████████████████    │
│  ████████████████████████████    │  ZONE 3
│  ████ BARCODE (Code128) █████    │  (40% height min)
│  ████████████████████████████    │
│                                  │
│  TAC-26-000123                   │
└──────────────────────────────────┘
```

#### Day 14 — Scanner Engine

Create `packages/scanner/src/` files:

```typescript
// packages/scanner/src/detector.ts
export class ScannerDetector {
  private readonly SPEED_THRESHOLD = 100  // ms
  private readonly MIN_LENGTH = 6
  private buffer = ""
  private lastKeyTime = 0
  private scannerActive = false

  feed(char: string): { ready: boolean; value: string; isScan: boolean } {
    const now = Date.now()
    const delta = now - this.lastKeyTime
    this.lastKeyTime = now

    if (char === "Enter") {
      const result = {
        ready: this.buffer.length >= this.MIN_LENGTH,
        value: this.buffer,
        isScan: this.scannerActive,
      }
      this.reset()
      return result
    }

    this.scannerActive = delta < this.SPEED_THRESHOLD
    this.buffer += char
    return { ready: false, value: this.buffer, isScan: this.scannerActive }
  }

  reset() {
    this.buffer = ""
    this.scannerActive = false
  }
}
```

```typescript
// packages/scanner/src/offline-queue.ts
import { set, get, values, del, keys } from "idb-keyval"

export interface QueuedScan {
  id: string
  cn: string
  mode: ScanMode
  hubId: string
  userId: string
  timestamp: number
  status: "PENDING" | "SYNCED" | "FAILED"
  error?: string
}

export const scanQueue = {
  async enqueue(scan: Omit<QueuedScan, "id" | "status">): Promise<string> {
    const id = `scan_${Date.now()}_${Math.random().toString(36).slice(2)}`
    await set(id, { ...scan, id, status: "PENDING" } satisfies QueuedScan)
    return id
  },

  async getPending(): Promise<QueuedScan[]> {
    const allValues = await values<QueuedScan>()
    return allValues.filter((s) => s.status === "PENDING")
  },

  async markSynced(id: string): Promise<void> {
    const scan = await get<QueuedScan>(id)
    if (scan) await set(id, { ...scan, status: "SYNCED" })
  },

  async markFailed(id: string, error: string): Promise<void> {
    const scan = await get<QueuedScan>(id)
    if (scan) await set(id, { ...scan, status: "FAILED", error })
  },

  async clearSynced(): Promise<void> {
    const allKeys = await keys<string>()
    for (const key of allKeys) {
      const scan = await get<QueuedScan>(key)
      if (scan?.status === "SYNCED") await del(key)
    }
  },
}
```

#### Day 15 — Scanning UI Page

`apps/web/app/(dashboard)/scanning/page.tsx` using:
- `ScanFeedback` component (Section 7.4) with `animate-in zoom-in-95` animation
- Mode selector using `Tabs` from `@workspace/ui`
- Auto-focus input (clears after each scan)
- Online/offline indicator using `Badge`
- Last 10 scans history using `DataTable`

**✅ Phase 4 Done When:**
- Label generates as 4×6 PDF with scannable barcode
- Hardware scanner input is detected automatically (delta < 100ms)
- Scan validates, creates tracking event, shows `ScanFeedback`
- Offline queue stores scans when disconnected

---

### PHASE 5: Manifest + Tracking (Days 16–18)

**Manifest State Machine:**
```
OPEN → CLOSED → DEPARTED → ARRIVED
```

```typescript
// packages/services/src/manifest/manifestService.ts
export const manifestService = {
  async close(manifestId: string, operatorId: string): Promise<void> {
    // Single RPC — atomic operation
    await db.rpc("close_manifest_atomic", {
      p_manifest_id: manifestId,
      p_operator_id: operatorId,
    })
    // Supabase function: updates manifest status to CLOSED
    // + creates IN_TRANSIT tracking event for all shipments
  },
}
```

**Tracking Timeline UI** (`ShipmentTimeline` component):
- Vertical timeline with `Separator` between events
- Icon per event type (Remix Icon)
- Timestamp in `font-mono`
- Animated with `animate-in fade-in slide-in-from-left-2 duration-200`
- Real-time: Supabase Realtime subscription updates live

---

### PHASE 6: Landing Page + Public Layer (Days 19–21)

**Landing page sections** (in `apps/web/app/(public)/page.tsx`):

```tsx
// Page structure — semantic HTML, Lora headings, Geist Mono CNs
<main>
  <PublicNav />          {/* Logo + Nav + Login CTA */}
  <HeroSection />        {/* font-heading, primary CTA */}
  <TrackingBox />        {/* PRIMARY — large Input + track button */}
  <FeaturesSection />    {/* 3 KPI-style cards */}
  <AiChatWidget />       {/* Fixed bottom-right, Sheet component */}
  <ContactSection />     {/* Form with Input, Textarea, Button */}
  <Footer />
</main>
```

**TrackingBox component:**
```tsx
// The most important UI element on the public site
<div className="mx-auto max-w-lg rounded-xl border bg-card p-6 shadow-lg">
  <p className="mb-3 font-sans text-sm text-muted-foreground">
    Track your shipment
  </p>
  <div className="flex gap-2">
    <Input
      placeholder="Enter CN or AWB — e.g. TAC-26-000123"
      className="font-mono"
      value={cn}
      onChange={(e) => setCn(e.target.value)}
    />
    <Button onClick={handleTrack}>
      <Icon name="RiSearchLine" size={16} />
      Track
    </Button>
  </div>
</div>
```

**Public Tracking API:**
```typescript
// apps/web/app/api/track/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cn = searchParams.get("cn")

  if (!cn) return Response.json({ error: "CN required" }, { status: 400 })

  const events = await trackingService.getPublicTimeline(cn)
  return Response.json(events)
}
```

---

### PHASE 7: Dashboard + Analytics (Days 22–24)

```bash
pnpm add recharts -w
```

**Dashboard layout** (`apps/web/app/(dashboard)/dashboard/page.tsx`):

```tsx
// KPI Row
<div className="grid grid-cols-4 gap-4">
  <KpiCard title="Total Shipments" value="1,284" icon="RiBox3Line" change={12} />
  <KpiCard title="Revenue MTD" value="₹4.2L" icon="RiLineChartLine" change={8} />
  <KpiCard title="In Transit" value="47" icon="RiTruckLine" />
  <KpiCard title="Delivered Today" value="23" icon="RiCheckboxCircleLine" change={5} />
</div>

{/* Charts use chart token colors: var(--chart-1) through var(--chart-5) */}
<BarChart>
  <Bar dataKey="shipments" fill="var(--chart-1)" />
</BarChart>
```

**Analytics page filters:**
- Date range picker (shadcn calendar or simple select)
- Route filter (origin → destination)
- Mode filter (Air / Surface)
- All built with `@workspace/ui` primitives only

---

### PHASE 8: AI Chatbot + WhatsApp (Days 25–27)

```bash
pnpm add ai @anthropic-ai/sdk -w
pnpm add @react-pdf/renderer -w   # if not added in Phase 4
```

**AI Chat API:**
```typescript
// apps/web/app/api/chat/route.ts
import { streamText } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"

const anthropic = createAnthropic()

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: TACBOT_SYSTEM_PROMPT,
    messages,
    tools: {
      trackShipment: {
        description: "Track a shipment by CN or AWB",
        parameters: z.object({ cn: z.string() }),
        execute: async ({ cn }) => trackingService.getPublicTimeline(cn),
      },
    },
  })

  return result.toDataStreamResponse()
}
```

**WhatsApp Invoice Delivery:**
```typescript
// packages/services/src/whatsapp/whatsappService.ts
export async function sendInvoiceToWhatsApp(
  phone: string,
  invoiceId: string
): Promise<void> {
  const pdfBuffer = await generateInvoicePDF(invoiceId)

  // Step 1: Upload media to WhatsApp
  const uploadRes = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/media`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
      body: createFormData(pdfBuffer, `Invoice-${invoiceId}.pdf`),
    }
  )
  const { id: mediaId } = await uploadRes.json()

  // Step 2: Send document message
  await fetch(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "document",
        document: {
          id: mediaId,
          filename: `Invoice-${invoiceId}.pdf`,
          caption: "Your TAC Express invoice is attached.",
        },
      }),
    }
  )
}
```

---

## 11. Module Build Specifications

| Module | Package | Priority | Phase |
|---|---|---|---|
| Design System | `packages/ui` | 🔴 Critical | 1 |
| Auth (Clerk) | `packages/auth` | 🔴 Critical | 2 |
| Database Layer | `packages/database` | 🔴 Critical | 2 |
| Domain Types | `packages/types` | 🔴 Critical | 2 |
| Shipment Service | `packages/services` | 🔴 Critical | 3 |
| CN + SSCC Generator | `packages/services` | 🔴 Critical | 3 |
| Invoice + GST Engine | `packages/services` | 🔴 Critical | 3 |
| Barcode Service | `packages/services` | 🔴 Critical | 4 |
| Label PDF | `packages/services` | 🟠 High | 4 |
| Scanner Engine | `packages/scanner` | 🔴 Critical | 4 |
| Offline Queue | `packages/scanner` | 🟠 High | 4 |
| Manifest Service | `packages/services` | 🟠 High | 5 |
| Tracking Service | `packages/services` | 🟠 High | 5 |
| Customer Service | `packages/services` | 🟠 High | 3 |
| Analytics | `apps/web` | 🟡 Medium | 7 |
| AI Chat | `apps/web` | 🟡 Medium | 8 |
| WhatsApp | `packages/services` | 🟡 Medium | 8 |
| Inventory | `packages/services` | 🟢 Low | 9 |

---

## 12. Database Architecture

### Core Tables

```sql
-- Organizations (multi-tenant root)
CREATE TABLE organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT UNIQUE NOT NULL,   -- e.g., 'TAC'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (synced from Clerk via webhook)
CREATE TABLE users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id   TEXT UNIQUE NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'staff',
  org_id     UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       UUID REFERENCES organizations(id) NOT NULL,
  name         TEXT NOT NULL,
  phone        TEXT NOT NULL,
  email        TEXT,
  address      TEXT,
  gstin        TEXT,
  credit_limit NUMERIC DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments (Core)
CREATE TABLE shipments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID REFERENCES organizations(id) NOT NULL,
  cn                TEXT UNIQUE NOT NULL,       -- TAC-26-000123
  sscc              TEXT UNIQUE,               -- GS1 SSCC (18-digit)
  customer_id       UUID REFERENCES customers(id) NOT NULL,
  mode              TEXT NOT NULL CHECK (mode IN ('AIR', 'SURFACE')),
  origin            TEXT NOT NULL,
  destination       TEXT NOT NULL,
  pieces            INTEGER NOT NULL CHECK (pieces > 0),
  weight            NUMERIC NOT NULL CHECK (weight > 0),
  declared_value    NUMERIC,
  consignee_name    TEXT NOT NULL,
  consignee_phone   TEXT NOT NULL,
  consignee_address TEXT NOT NULL,
  created_by        UUID REFERENCES users(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking Events (source of truth for status)
CREATE TABLE tracking_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
  event_type  TEXT NOT NULL,
  hub_id      UUID,
  location    TEXT,
  operator_id UUID REFERENCES users(id),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id  UUID REFERENCES shipments(id) NOT NULL UNIQUE,
  invoice_no   TEXT UNIQUE NOT NULL,
  freight      NUMERIC NOT NULL,
  packing      NUMERIC DEFAULT 0,
  other        NUMERIC DEFAULT 0,
  gst_rate     NUMERIC DEFAULT 0.18,
  gst_amount   NUMERIC NOT NULL,
  total        NUMERIC NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'TO_PAY'
                CHECK (payment_type IN ('PAID', 'TO_PAY', 'CREDIT')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Manifests
CREATE TABLE manifests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id) NOT NULL,
  manifest_no TEXT UNIQUE NOT NULL,
  origin      TEXT NOT NULL,
  destination TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'OPEN'
              CHECK (status IN ('OPEN', 'CLOSED', 'DEPARTED', 'ARRIVED')),
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE manifest_shipments (
  manifest_id UUID REFERENCES manifests(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (manifest_id, shipment_id)
);
```

### Critical Indexes

```sql
CREATE INDEX idx_shipments_cn     ON shipments(cn);
CREATE INDEX idx_shipments_org    ON shipments(org_id);
CREATE INDEX idx_tracking_latest  ON tracking_events(shipment_id, created_at DESC);
CREATE INDEX idx_invoices_payment ON invoices(payment_type);
CREATE INDEX idx_users_clerk_id   ON users(clerk_id);
```

### Atomic Stored Procedure

```sql
CREATE OR REPLACE FUNCTION close_manifest_atomic(
  p_manifest_id UUID,
  p_operator_id UUID
) RETURNS void AS $$
BEGIN
  -- Lock manifest
  UPDATE manifests SET status = 'CLOSED'
  WHERE id = p_manifest_id AND status = 'OPEN';

  -- Create IN_TRANSIT event for all shipments in manifest
  INSERT INTO tracking_events (shipment_id, event_type, operator_id)
  SELECT shipment_id, 'IN_TRANSIT', p_operator_id
  FROM manifest_shipments
  WHERE manifest_id = p_manifest_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 13. Scanner Engine Design

### Validation Transition Matrix

| Current Status | RECEIVE | LOAD_MANIFEST | VERIFY | DELIVER |
|---|---|---|---|---|
| CREATED | ✅ | ❌ | ❌ | ❌ |
| RECEIVED | ❌ | ✅ | ❌ | ❌ |
| IN_TRANSIT | ❌ | ❌ | ✅ | ❌ |
| ARRIVED | ❌ | ❌ | ❌ | ✅ |
| OUT_FOR_DELIVERY | ❌ | ❌ | ❌ | ✅ |
| DELIVERED | ❌ | ❌ | ❌ | ❌ |

### Scan Result Color Mapping (using installed tokens)

| Result | CSS Class | Token |
|---|---|---|
| SUCCESS | `text-[oklch(0.55_0.18_145)]` | Custom (success green) |
| ERROR states | `text-destructive` | `oklch(0.577 0.245 27.325)` |
| DUPLICATE | `text-[oklch(0.72_0.19_75)]` | Custom (warning amber) |
| OFFLINE_QUEUED | `text-primary` | `oklch(0.491 0.27 292.581)` |

---

## 14. Deployment Architecture

```
User Browser
     ↓
Vercel Edge Network (CDN)
     ↓
Next.js 16 App (Vercel — Serverless + Edge Functions)
     ↓
┌────────────────────┐    ┌───────────────────────┐
│   Clerk Auth       │    │   Supabase Cloud       │
│   JWT + RBAC       │    │   PostgreSQL + Realtime│
└────────────────────┘    └───────────────────────┘
                                    ↓
                         ┌──────────────────────┐
                         │ Supabase Edge Funcs   │
                         │ (Clerk sync webhook)  │
                         └──────────────────────┘
```

### Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# WhatsApp (Meta Cloud API)
WHATSAPP_ACCESS_TOKEN=EAAx...
WHATSAPP_PHONE_NUMBER_ID=1234...
WHATSAPP_BUSINESS_ACCOUNT_ID=5678...

# Anthropic (AI Chatbot)
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=https://tacexpress.in
```

---

## 15. Quality Gates & Definition of Done

### Per-Phase Mandatory Checklist

Every phase must pass ALL items before proceeding:

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

### MVP Launch Checklist

| Capability | Enforced By | Status |
|---|---|---|
| No design system violations | ESLint CI gate | ⬜ |
| User can sign in via Clerk | Middleware | ⬜ |
| Dashboard loads with real data | Services layer | ⬜ |
| Shipment created (7-step form) | Service + RPC | ⬜ |
| CN auto-generated | `cnGenerator.ts` | ⬜ |
| Invoice auto-created | Atomic RPC | ⬜ |
| Shipping label (4×6) generated | `@react-pdf/renderer` | ⬜ |
| Barcode is scannable | `bwip-js` Code128 | ⬜ |
| Hardware scanner auto-detected | `ScannerDetector` | ⬜ |
| Scan creates tracking event | `scanEngine.ts` | ⬜ |
| Tracking timeline live updates | Supabase Realtime | ⬜ |
| Public tracking (no login) | Public API route | ⬜ |
| Offline scans queue + sync | `idb-keyval` | ⬜ |
| All CI gates pass | GitHub Actions | ⬜ |

### Violation Response Protocol

| Violation Type | Enforcement | Blocker |
|---|---|---|
| Hardcoded Tailwind color | ESLint `no-restricted-syntax` error | Pre-commit hook |
| Direct lucide / react-icons import | ESLint `no-restricted-imports` error | Pre-commit hook |
| Direct Supabase import in app | ESLint `no-restricted-imports` error | Pre-commit hook |
| framer-motion / gsap import | ESLint `no-restricted-imports` error | Pre-commit hook |
| TypeScript error | `pnpm typecheck` | CI gate |
| Business logic in component | Code review | PR block |
| Custom CSS color variable | Code review | PR block |

---

## Appendix A: Quick Reference Card

> Print this. Pin it. This is the team's operating agreement.

```
╔══════════════════════════════════════════════════════════════╗
║              TAC EXPRESS — DEVELOPER QUICK REFERENCE          ║
╠══════════════════════════════════════════════════════════════╣
║  ICONS       → import { Icon } from "@workspace/ui/icons"    ║
║              → @remixicon/react only (via wrapper)            ║
║                                                               ║
║  COMPONENTS  → import { ... } from "@workspace/ui"           ║
║              → shadcn (radix-lyra) primitives only            ║
║                                                               ║
║  COLORS      → bg-primary, text-foreground, border-border    ║
║              → NO bg-blue-500, text-red-400, #hex, rgb()      ║
║                                                               ║
║  FONTS       → font-sans (Geist), font-mono (Geist Mono)     ║
║              → font-heading (Lora) for headings               ║
║              → DO NOT import fonts anywhere else              ║
║                                                               ║
║  ANIMATION   → animate-in fade-in slide-in-from-* duration-* ║
║              → tw-animate-css classes ONLY                    ║
║              → NO framer-motion, gsap, motion                 ║
║                                                               ║
║  DATA        → via packages/services → packages/database      ║
║              → NEVER call Supabase in a component             ║
║                                                               ║
║  RADIUS      → var(--radius-sm/md/lg/xl)  NOT rounded-lg     ║
║                                                               ║
║  SPACING     → Tailwind scale (p-4, m-6) NO arbitrary [px]   ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Appendix B: Token Reference (Installed Tokens Only)

```
COLORS (bg-* / text-* / border-*)
  bg-background        text-foreground
  bg-primary           text-primary-foreground
  bg-secondary         text-secondary-foreground
  bg-muted             text-muted-foreground
  bg-accent            text-accent-foreground
  bg-destructive       text-destructive
  bg-card              text-card-foreground
  bg-sidebar           text-sidebar-foreground
  border-border        border-input          ring-ring

CHART COLORS (for recharts fill/stroke)
  var(--chart-1)  amber    var(--chart-2)  teal
  var(--chart-3)  navy     var(--chart-4)  yellow
  var(--chart-5)  orange

RADIUS
  var(--radius-sm)    var(--radius-md)    var(--radius-lg)
  var(--radius-xl)    var(--radius-2xl)   var(--radius-3xl)

FONTS
  font-sans    →  Geist (UI, body, forms)
  font-mono    →  Geist Mono (CNs, codes, default body)
  font-heading →  Lora (page headings, hero text)
```

---

*Document Version: 2.0*  
*Supersedes: TAC Express Implementation Plan v1.0*  
*Stack Verified Against: tac-express Full Tech Stack Audit*  
*All architectural decisions in this document are final until formally amended.*
