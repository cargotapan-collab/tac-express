# TAC EXPRESS — IMPLEMENTATION PLAN
## Enterprise Logistics Operating System
### Version 1.0 | Architecture & Build Strategy Document

---

> **Document Classification:** Internal Technical Reference  
> **Status:** Active Planning  
> **Scope:** Full-System Architecture, Design Governance, and Phased Build Execution

---

## TABLE OF CONTENTS

1. [Project Identity & Strategic Context](#1-project-identity--strategic-context)
2. [Architecture Decision Record (ADR)](#2-architecture-decision-record-adr)
3. [Technology Stack — Final Selection](#3-technology-stack--final-selection)
4. [Monorepo Structure — Source of Truth](#4-monorepo-structure--source-of-truth)
5. [Design System & Governance Layer](#5-design-system--governance-layer)
6. [Shared Components Strategy](#6-shared-components-strategy)
7. [Authentication Architecture (Clerk + Supabase)](#7-authentication-architecture-clerk--supabase)
8. [Strict Rules & Enforcement Protocol](#8-strict-rules--enforcement-protocol)
9. [Phased Implementation Plan](#9-phased-implementation-plan)
10. [Module-by-Module Build Specification](#10-module-by-module-build-specification)
11. [Database Architecture](#11-database-architecture)
12. [Scanner Engine Design](#12-scanner-engine-design)
13. [Deployment Architecture](#13-deployment-architecture)
14. [Quality Gates & Definition of Done](#14-quality-gates--definition-of-done)

---

## 1. Project Identity & Strategic Context

### 1.1 What TAC Express Is

TAC Express is **not** a cargo management application. It is a **Logistics Operating System** — a full-scale, enterprise-grade platform for Tapan Associate Cargo that functions as:

| Layer | Function |
|---|---|
| Customer Layer | Landing page, public tracking, AI chatbot, contact |
| Operations Layer | Shipment creation, invoicing, label generation |
| Warehouse Layer | Scan-based workflows, manifest batching, inventory |
| Financial Layer | Invoice PDF, GST calculation, WhatsApp delivery, payment tracking |
| Intelligence Layer | Analytics dashboard, AI assistant, real-time tracking |

### 1.2 Core Business Flow

```
Booking → Shipment Creation → Label → Scan (Receive) →
Manifest → Transit → Scan (Arrive) → Delivery → Invoice → Settlement
```

### 1.3 Why This Rebuild Matters

The previous system (`tac-portal`) had 180+ components in a single SPA with:
- Supabase calls directly inside UI components
- No service abstraction layer
- Inconsistent TypeScript usage
- No shared component governance
- Auth tightly coupled to Supabase

The rebuild (`tac-express`) corrects all of this via a **monorepo platform architecture**.

---

## 2. Architecture Decision Record (ADR)

### ADR-001: Monorepo over Single SPA

**Decision:** Turborepo + pnpm workspaces  
**Rationale:** The system spans public landing, authenticated dashboard, and potentially mobile in future. Shared packages (UI, services, types) must be reusable without code duplication.  
**Consequence:** Each app consumes packages; packages have no app-level dependencies.

### ADR-002: Service Layer as Mandatory Abstraction

**Decision:** All database interaction must go through `packages/services`  
**Rationale:** Components in previous system called Supabase directly — this caused business logic to scatter across 180+ files and made testing impossible.  
**Rule (Non-Negotiable):**

```
UI Component → Service Function → Database Client
                ↑
         (No skipping)
```

### ADR-003: Clerk for Auth, Supabase for Data

**Decision:** Decouple authentication from data storage  
**Rationale:** Supabase Auth creates lock-in. Clerk provides enterprise-grade auth (RBAC, MFA, org management, social login) with minimal configuration. Supabase retains its strength as a real-time PostgreSQL backend.

### ADR-004: Design System as Package Boundary

**Decision:** `packages/ui` is the ONLY source of UI components  
**Rationale:** In the previous system, UI inconsistency was rampant. A package boundary enforced by ESLint makes design governance automatic, not dependent on developer discipline.

### ADR-005: Event-Driven Tracking Model

**Decision:** Track shipment status via events, not status fields  
**Rationale:** `status = 'IN_TRANSIT'` is fragile. `last_event = RECEIVED_AT_HUB` is traceable. Every scan creates an event; status is derived from the latest event.

---

## 3. Technology Stack — Final Selection

### 3.1 Core Stack

| Category | Technology | Version | Justification |
|---|---|---|---|
| Runtime | Node.js | >= 20 | Required for edge runtimes and modern tooling |
| Package Manager | pnpm | 9.15.9 | Workspace linking, fast installs, strict isolation |
| Monorepo Orchestration | Turborepo | ^2.8.17 | Parallel builds, dependency-aware caching |
| Language | TypeScript | 5.9.3 | Strict mode, full type safety across packages |
| Frontend Framework | Next.js | 15.x (App Router) | RSC, file-based routing, edge-ready, Clerk support |
| UI Library | shadcn/ui | Latest | Radix primitives + Tailwind, accessible, composable |
| Styling | Tailwind CSS v4 | Latest | CSS-first configuration, OKLCH color model |
| State Management | Zustand | ^5.x | Minimal, performant, no boilerplate |
| Server State | TanStack Query | ^5.x | Data fetching, caching, invalidation |
| Authentication | Clerk | Latest | Enterprise auth with org/role management |
| Database Backend | Supabase | Latest | PostgreSQL + Realtime + RLS |
| ORM / Query Builder | Supabase JS SDK | v2.x | Type-safe queries with generated types |

### 3.2 Advanced & Specialized Stack

| Category | Technology | Justification |
|---|---|---|
| Animation | Motion (Framer Motion v12) | Performance-first animation library |
| PDF Generation | @react-pdf/renderer | React-based PDF for labels and invoices |
| Barcode | bwip-js + zxing-js | GS1-128 encoding + camera scanning |
| Charts/Analytics | Recharts | Composable, React-native charting |
| AI Chatbot | Vercel AI SDK + Anthropic Claude | Streaming AI responses, tool use |
| WhatsApp | Meta Cloud API (WhatsApp Business) | Invoice PDF delivery |
| Validation | Zod | Schema-first validation, TS inference |
| Forms | React Hook Form + Zod resolvers | Zero re-renders, typed |
| Icons | Lucide React (wrapped) | Consistent icon system via wrapper |
| Offline | idb-keyval + service worker | IndexedDB-backed offline scan queue |
| Code Quality | ESLint + Prettier + Husky | Pre-commit enforcement |
| Testing | Vitest + Testing Library | Unit + integration tests |
| CI/CD | GitHub Actions | Lint, typecheck, build gates |
| Deployment | Vercel (web) | Edge runtime, preview deploys |
| Monitoring | Sentry | Error tracking, performance |

### 3.3 Why These Choices Are "Latest & Enhanced"

**Next.js 15 App Router** replaces the previous React SPA — gives us:
- Server Components for data fetching without waterfall
- Streaming UI with Suspense
- Built-in middleware for Clerk route protection
- Better SEO for landing page

**Tailwind v4** (CSS-first) replaces v3 config — gives us:
- Native OKLCH color support (perceptually uniform)
- CSS variables as first-class citizens
- 10x faster builds via Rust engine

**TanStack Query v5** replaces manual hooks — gives us:
- Automatic background refetching for real-time feel
- Optimistic updates for scan operations
- Offline-aware data synchronization

**Motion v12** replaces basic CSS — gives us:
- Layout animations without FLIP math
- Scroll-triggered animations for landing page
- `useAnimate` hook for imperative control

---

## 4. Monorepo Structure — Source of Truth

```
tac-express/
│
├── apps/
│   └── web/                          # Main Next.js 15 App
│       ├── app/
│       │   ├── (public)/             # Landing page routes
│       │   │   ├── page.tsx          # Landing page
│       │   │   ├── track/page.tsx    # Public tracking
│       │   │   └── contact/page.tsx  # Contact form
│       │   │
│       │   ├── (auth)/              # Auth flow (Clerk)
│       │   │   └── sign-in/page.tsx
│       │   │
│       │   └── (dashboard)/         # Protected routes
│       │       ├── layout.tsx        # Sidebar + header shell
│       │       ├── dashboard/
│       │       ├── shipments/
│       │       ├── invoice/
│       │       ├── manifest/
│       │       ├── scanning/
│       │       ├── customers/
│       │       ├── inventory/
│       │       ├── analytics/
│       │       └── settings/
│       │
│       ├── middleware.ts             # Clerk auth middleware
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/
│   │
│   ├── ui/                          # ⚡ DESIGN SYSTEM (Single Source of Truth)
│   │   ├── components/
│   │   │   ├── primitives/          # shadcn base components
│   │   │   ├── composed/            # business-specific compositions
│   │   │   └── layouts/             # page shells, sidebars
│   │   ├── tokens/
│   │   │   ├── colors.ts            # OKLCH-based token definitions
│   │   │   ├── typography.ts        # font stacks and scales
│   │   │   ├── spacing.ts           # spacing system
│   │   │   └── radius.ts            # border radius system
│   │   ├── styles/
│   │   │   ├── globals.css          # CSS variables (single source)
│   │   │   └── fonts.ts             # font declarations
│   │   ├── icons/
│   │   │   └── index.tsx            # Icon wrapper (enforced)
│   │   └── index.ts                 # Barrel export
│   │
│   ├── types/                       # 🧩 Domain Types (centralized)
│   │   ├── shipment.ts
│   │   ├── invoice.ts
│   │   ├── manifest.ts
│   │   ├── customer.ts
│   │   ├── user.ts
│   │   ├── tracking.ts
│   │   ├── scan.ts
│   │   └── index.ts
│   │
│   ├── database/                    # 🗄️ Supabase Data Access Layer
│   │   ├── client.ts                # Supabase client (with Clerk JWT)
│   │   ├── types/                   # Generated Supabase types
│   │   ├── queries/
│   │   │   ├── shipments.ts
│   │   │   ├── customers.ts
│   │   │   ├── invoices.ts
│   │   │   ├── tracking.ts
│   │   │   └── manifests.ts
│   │   └── index.ts
│   │
│   ├── services/                    # ⚙️ Business Logic Layer (MANDATORY)
│   │   ├── shipment/
│   │   │   ├── shipmentService.ts
│   │   │   ├── cnGenerator.ts       # CN auto-generation
│   │   │   └── ssccGenerator.ts     # GS1 SSCC generation
│   │   ├── invoice/
│   │   │   ├── invoiceService.ts
│   │   │   ├── gstCalculator.ts
│   │   │   └── chargesEngine.ts
│   │   ├── tracking/
│   │   │   └── trackingService.ts
│   │   ├── manifest/
│   │   │   └── manifestService.ts
│   │   ├── customer/
│   │   │   └── customerService.ts
│   │   ├── barcode/
│   │   │   ├── barcodeService.ts
│   │   │   └── gs1Encoder.ts        # GS1-128 encoding
│   │   ├── label/
│   │   │   └── labelService.ts      # Shipping label PDF
│   │   ├── whatsapp/
│   │   │   └── whatsappService.ts   # Meta Cloud API
│   │   └── index.ts
│   │
│   ├── auth/                        # 🔐 Clerk Integration
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── rbac.ts                  # Role + permission maps
│   │   └── index.ts
│   │
│   ├── scanner/                     # 📡 Scanning Engine (Core IP)
│   │   ├── detector.ts              # Hardware vs manual detection
│   │   ├── parser.ts                # Barcode data extraction
│   │   ├── validator.ts             # Scan validation rules
│   │   ├── engine.ts                # Core scan processing
│   │   ├── offline-queue.ts         # IndexedDB offline queue
│   │   ├── deduplication.ts         # Duplicate scan prevention
│   │   └── index.ts
│   │
│   ├── config/                      # ⚙️ System Configuration
│   │   ├── constants.ts
│   │   ├── featureFlags.ts
│   │   ├── routes.ts
│   │   └── index.ts
│   │
│   └── utils/                       # 🛠️ Shared Utilities
│       ├── formatters.ts
│       ├── validators.ts
│       ├── date.ts
│       └── index.ts
│
├── tooling/
│   ├── eslint-config/
│   │   ├── base.js                  # Core ESLint rules
│   │   ├── next.js                  # Next.js rules
│   │   └── design-system.js         # Design system enforcement rules
│   └── typescript-config/
│       ├── base.json
│       ├── nextjs.json
│       └── library.json
│
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## 5. Design System & Governance Layer

### 5.1 Philosophy: Zero Hardcoding

Every visual decision in TAC Express must trace back to a **design token**. This is non-negotiable. The design system lives exclusively in `packages/ui` and is enforced by tooling.

### 5.2 OKLCH Color System (Modern Standard)

Tailwind CSS v4 uses OKLCH natively. All colors must be defined as OKLCH tokens:

```css
/* packages/ui/styles/globals.css */

:root {
  /* Brand Colors (OKLCH) */
  --color-primary:        oklch(0.56 0.24 264);   /* TAC Blue */
  --color-primary-hover:  oklch(0.48 0.24 264);
  --color-secondary:      oklch(0.64 0.05 264);

  /* Semantic Colors */
  --color-success:        oklch(0.55 0.18 145);   /* Green */
  --color-warning:        oklch(0.72 0.19 75);    /* Amber */
  --color-danger:         oklch(0.55 0.22 25);    /* Red */
  --color-info:           oklch(0.62 0.14 231);   /* Cyan */

  /* Surface Colors */
  --color-bg:             oklch(0.99 0 0);
  --color-surface:        oklch(0.97 0 0);
  --color-surface-raised: oklch(1.00 0 0);
  --color-border:         oklch(0.90 0 0);

  /* Text Colors */
  --color-text-primary:   oklch(0.15 0 0);
  --color-text-secondary: oklch(0.45 0 0);
  --color-text-muted:     oklch(0.65 0 0);

  /* Logistics Operational Colors */
  --color-scan-success:   oklch(0.55 0.18 145);
  --color-scan-error:     oklch(0.55 0.22 25);
  --color-scan-duplicate: oklch(0.72 0.19 75);
  --color-in-transit:     oklch(0.62 0.14 231);
  --color-delivered:      oklch(0.55 0.18 145);
}

[data-theme="dark"] {
  --color-bg:             oklch(0.13 0 0);
  --color-surface:        oklch(0.18 0 0);
  --color-surface-raised: oklch(0.22 0 0);
  --color-border:         oklch(0.28 0 0);
  --color-text-primary:   oklch(0.95 0 0);
  --color-text-secondary: oklch(0.70 0 0);
  --color-text-muted:     oklch(0.50 0 0);
}
```

### 5.3 Typography System

```typescript
// packages/ui/tokens/typography.ts

export const typography = {
  fontFamily: {
    display: '"Geist", "DM Sans", sans-serif',     // Headings
    body: '"Geist", "Inter Variable", sans-serif',  // Body text
    mono: '"Geist Mono", "JetBrains Mono", monospace', // Code, CN numbers
  },
  scale: {
    xs:   '0.75rem',    // 12px — labels, badges
    sm:   '0.875rem',   // 14px — body small
    base: '1rem',       // 16px — body default
    lg:   '1.125rem',   // 18px — body large
    xl:   '1.25rem',    // 20px — section headings
    '2xl': '1.5rem',    // 24px — card titles
    '3xl': '1.875rem',  // 30px — page headings
    '4xl': '2.25rem',   // 36px — hero text
    '5xl': '3rem',      // 48px — display
  },
}
```

### 5.4 Spacing & Radius System

```typescript
// packages/ui/tokens/spacing.ts
export const spacing = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  6: '1.5rem',
  8: '2rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
}

// packages/ui/tokens/radius.ts
export const radius = {
  sm: '0.375rem',   // inputs
  md: '0.5rem',     // cards
  lg: '0.75rem',    // modals
  xl: '1rem',       // panels
  full: '9999px',   // badges
}
```

---

## 6. Shared Components Strategy

### 6.1 Component Hierarchy

```
packages/ui/
├── primitives/           # Wrapped shadcn/Radix (1:1 mapping)
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Dialog
│   ├── Dropdown
│   ├── Checkbox
│   ├── Badge
│   ├── Tooltip
│   ├── Table
│   ├── Tabs
│   └── Card
│
├── composed/             # Business-domain compositions
│   ├── DataTable          # Table + pagination + search + filters
│   ├── StatusBadge        # Shipment status visual
│   ├── ScanFeedback       # Green/Red scan result card
│   ├── KpiCard            # Dashboard metric card
│   ├── ShipmentTimeline   # Vertical event tracking
│   ├── CustomerSelect     # Searchable customer dropdown
│   ├── StepIndicator      # Multi-step form progress
│   ├── InvoiceCard        # Invoice summary display
│   └── ManifestCard       # Manifest summary display
│
└── layouts/
    ├── AppShell           # Sidebar + Header + Content wrapper
    ├── PageHeader         # Consistent page title + actions
    ├── FormSection        # Labeled form group wrapper
    └── EmptyState         # No-data placeholder
```

### 6.2 Import Rules

```typescript
// ✅ CORRECT — always import from @workspace/ui
import { Button, Input, DataTable } from "@workspace/ui"
import { StatusBadge, KpiCard } from "@workspace/ui"
import { Icon } from "@workspace/ui/icons"

// ❌ FORBIDDEN — will fail ESLint and CI
import { Button } from "@/components/ui/button"
import { Package } from "lucide-react"
import { Input } from "shadcn/ui"
```

### 6.3 Icon System (Enforced Wrapper)

```typescript
// packages/ui/icons/index.tsx
import * as LucideIcons from "lucide-react"

type IconName = keyof typeof LucideIcons

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 16, ...props }: IconProps) {
  const Component = LucideIcons[name] as React.FC<React.SVGProps<SVGSVGElement>>
  if (!Component) {
    console.warn(`Icon "${name}" not found`)
    return null
  }
  return <Component width={size} height={size} {...props} />
}
```

---

## 7. Authentication Architecture (Clerk + Supabase)

### 7.1 Flow Overview

```
User → Landing Page
         ↓
     [Login Button]
         ↓
     Clerk Sign-In Page
         ↓
     JWT Token Issued
         ↓
     Next.js Middleware validates token
         ↓
     Dashboard loads
         ↓
     Supabase called with Clerk JWT (via RLS)
         ↓
     Data returned scoped to user's org
```

### 7.2 Supabase Client with Clerk JWT

```typescript
// packages/database/client.ts
import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"

export async function getSupabaseServerClient() {
  const { getToken } = auth()
  const token = await getToken({ template: "supabase" })

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  )
}
```

### 7.3 User Synchronization

```sql
-- Sync Clerk user to internal DB on first login
CREATE TABLE public.users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT UNIQUE NOT NULL,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'staff',
  org_id      UUID REFERENCES organizations(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy: Org Isolation
CREATE POLICY "org_isolation" ON shipments
FOR ALL USING (
  org_id = (
    SELECT org_id FROM users WHERE clerk_id = auth.jwt()->>'sub'
  )
);
```

### 7.4 RBAC Roles

| Role | Capabilities |
|---|---|
| `admin` | Full access, settings, user management |
| `manager` | Shipments, manifests, invoices, reports |
| `ops` | Shipment creation, invoice, label printing |
| `warehouse` | Scanning only, manifest loading |
| `finance` | Invoices, payments, GST reports |
| `customer_support` | View shipments, tracking, customers |

---

## 8. Strict Rules & Enforcement Protocol

### 8.1 The Five Laws (Non-Negotiable)

```
LAW 1: No component may be built outside packages/ui
LAW 2: No database call may exist outside packages/database
LAW 3: No business logic may exist outside packages/services
LAW 4: No hardcoded color, font, or spacing anywhere
LAW 5: No direct Supabase import in any app file
```

### 8.2 ESLint Configuration (Hard Enforcement)

```javascript
// tooling/eslint-config/design-system.js
module.exports = {
  rules: {
    // Block hardcoded Tailwind color classes
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/\\b(bg|text|border|ring)-(red|blue|green|yellow|purple|pink|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-[0-9]+/]",
        message: "❌ DESIGN VIOLATION: Use CSS variables from @workspace/ui tokens only. No hardcoded Tailwind colors."
      }
    ],

    // Block direct shadcn imports in app code
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["@/components/ui/*"],
            message: "❌ DESIGN VIOLATION: Import all components from @workspace/ui only."
          },
          {
            group: ["lucide-react"],
            message: "❌ DESIGN VIOLATION: Import icons from @workspace/ui/icons only."
          },
          {
            group: ["@supabase/supabase-js"],
            message: "❌ ARCHITECTURE VIOLATION: Use @workspace/database client only."
          },
          {
            group: ["next/font/google", "next/font/local"],
            message: "❌ DESIGN VIOLATION: Import fonts from @workspace/ui/styles/fonts only."
          }
        ]
      }
    ],
  }
}
```

### 8.3 Pre-commit Hook

```json
// package.json (root)
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

### 8.4 CI/CD Gate (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: TAC Express CI

on: [push, pull_request]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: 🔍 TypeCheck
        run: pnpm typecheck

      - name: 🔍 Lint (Design + Arch rules)
        run: pnpm lint

      - name: 🔨 Build
        run: pnpm build

      # Build FAILS if any rule is violated
      # PR cannot merge until all gates pass
```

### 8.5 Violation Response Protocol

| Violation | Response |
|---|---|
| Hardcoded color | ESLint error — commit blocked |
| Direct shadcn import | ESLint error — commit blocked |
| Direct Supabase import in app | ESLint error — commit blocked |
| TypeScript error | CI gate fails — PR blocked |
| Business logic in component | Code review rejection |

---

## 9. Phased Implementation Plan

### Phase Overview

```
PHASE 0: Infrastructure Setup          [Week 1, Days 1–2]
PHASE 1: Design System Foundation      [Week 1, Days 3–5]
PHASE 2: Auth + Data Layer             [Week 2, Days 1–3]
PHASE 3: Shipment + Invoice (Core)     [Week 2, Days 4–7]
PHASE 4: Label + Barcode + Scanning    [Week 3, Days 1–4]
PHASE 5: Manifest + Tracking           [Week 3, Days 5–7]
PHASE 6: Landing Page + Public Layer   [Week 4, Days 1–3]
PHASE 7: Analytics + Dashboard         [Week 4, Days 4–6]
PHASE 8: AI + WhatsApp Integration     [Week 5, Days 1–4]
PHASE 9: Inventory + Advanced Features [Week 5, Days 5–7]
PHASE 10: QA + Deployment              [Week 6]
```

---

### PHASE 0: Infrastructure Setup (Days 1–2)

**Objective:** Monorepo skeleton is scaffolded, configured, and running.

#### Step-by-Step Tasks

**Step 0.1 — Initialize Monorepo**
```bash
mkdir tac-express && cd tac-express
pnpm init
```

**Step 0.2 — Configure pnpm Workspace**
```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

**Step 0.3 — Configure Turborepo**
```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "typecheck": { "dependsOn": ["^typecheck"] },
    "format": {}
  }
}
```

**Step 0.4 — Scaffold Tooling Packages**
- `tooling/eslint-config` — base + next + design-system rules
- `tooling/typescript-config` — base.json, nextjs.json, library.json

**Step 0.5 — Create Next.js App**
```bash
cd apps && pnpm create next-app@latest web \
  --typescript --tailwind --app --src-dir=false \
  --import-alias "@/*"
```

**Step 0.6 — Create Package Stubs**
Create `packages/{ui,types,database,services,auth,scanner,config,utils}` each with:
- `package.json` (workspace package)
- `tsconfig.json` (extends tooling config)
- `index.ts` (empty barrel export)

**✅ Phase 0 Done When:**
- `pnpm dev` starts the web app
- `pnpm build` succeeds across all packages
- Turborepo caching is active

---

### PHASE 1: Design System Foundation (Days 3–5)

**Objective:** `packages/ui` is the single source of all UI. No component is built in apps.

#### Step-by-Step Tasks

**Step 1.1 — Configure Tailwind v4 in packages/ui**
- Define CSS variables (all OKLCH tokens)
- Set up dark mode via `data-theme="dark"` attribute
- Configure font imports (Geist)

**Step 1.2 — Install & Configure shadcn/ui in packages/ui**
```bash
cd packages/ui
pnpm dlx shadcn@latest init
# Set components directory to packages/ui/components/primitives
```

**Step 1.3 — Add Core Primitive Components**
Add in this order:
1. `Button` — variants: default, outline, ghost, danger
2. `Input` — with label and error state
3. `Select` — searchable dropdown
4. `Card` — base card container
5. `Badge` — status indicator
6. `Table` — data table base
7. `Dialog` — modal shell
8. `Tabs` — tab navigation
9. `Tooltip` — contextual help

**Step 1.4 — Build Composed Components**
1. `DataTable` — wraps Table + adds pagination, search, column visibility
2. `StatusBadge` — maps shipment status → color + label
3. `KpiCard` — metric, label, change indicator, icon
4. `ScanFeedback` — success/error/duplicate result display
5. `StepIndicator` — numbered step progression bar

**Step 1.5 — Build Layout Components**
1. `AppShell` — sidebar (collapsible) + top header + content area
2. `PageHeader` — title + subtitle + action buttons row
3. `FormSection` — bordered, labeled form group
4. `EmptyState` — icon + message + CTA

**Step 1.6 — Icon System**
- Build `Icon` wrapper component
- Create icon registry with logistics-specific alias names

**Step 1.7 — Export Barrel**
- All components exported from `packages/ui/index.ts`
- All tokens exported from `packages/ui/tokens/index.ts`

**✅ Phase 1 Done When:**
- `import { Button, DataTable, Icon } from "@workspace/ui"` works
- All components render correctly in apps/web
- ESLint blocks any import from `@/components/ui` or `lucide-react`

---

### PHASE 2: Auth + Data Layer (Week 2, Days 1–3)

**Objective:** Clerk auth is functional, Supabase data layer is typed and accessible via service layer.

#### Step-by-Step Tasks

**Step 2.1 — Clerk Setup**
```bash
cd apps/web && pnpm add @clerk/nextjs
```
- Configure `middleware.ts` for route protection
- Wrap `layout.tsx` with `<ClerkProvider>`
- Set up sign-in redirect flow to dashboard

**Step 2.2 — Build packages/auth**
```typescript
// packages/auth/rbac.ts
export const ROLES = ['admin','manager','ops','warehouse','finance','customer_support'] as const
export type Role = typeof ROLES[number]

export const PERMISSIONS = {
  'shipment:create': ['admin','manager','ops'],
  'shipment:read':   ['admin','manager','ops','warehouse','finance','customer_support'],
  'scan:execute':    ['admin','manager','warehouse'],
  'invoice:create':  ['admin','manager','finance','ops'],
  'manifest:close':  ['admin','manager'],
  'settings:manage': ['admin'],
} as const
```

**Step 2.3 — Supabase Client Configuration**
- Configure Supabase client with Clerk JWT template
- Generate TypeScript types: `supabase gen types typescript`
- Export typed client from `packages/database`

**Step 2.4 — Core Database Queries**
Build typed query functions (not raw SQL in components):
- `shipments.ts` — CRUD + filters
- `customers.ts` — CRUD + search
- `invoices.ts` — CRUD + payment status
- `tracking.ts` — event creation + timeline fetch
- `manifests.ts` — batch operations

**Step 2.5 — Service Layer Stubs**
Create service functions that call database queries:
- `shipmentService.ts`
- `customerService.ts`
- `invoiceService.ts`
- `trackingService.ts`
- `manifestService.ts`

**Step 2.6 — User Sync Webhook**
- Clerk webhook → Supabase Edge Function
- On `user.created` → insert into `users` table
- On `user.updated` → update email/role

**✅ Phase 2 Done When:**
- User can sign in via Clerk
- User is redirected to `/dashboard`
- User profile resolves role and org
- Protected routes reject unauthenticated access
- Supabase queries return data with org isolation

---

### PHASE 3: Shipment + Invoice System (Week 2, Days 4–7)

**Objective:** Core business flow — create shipment, auto-generate CN/invoice, store all records.

#### Step-by-Step Tasks

**Step 3.1 — CN Generation Algorithm**
```typescript
// packages/services/shipment/cnGenerator.ts
export function generateCN(year: number, sequence: number): string {
  const yy = String(year).slice(-2)
  const seq = String(sequence).padStart(6, '0')
  return `TAC-${yy}-${seq}`
}
// Output: TAC-26-000123
```

**Step 3.2 — SSCC Generation (GS1 Standard)**
```typescript
// packages/services/shipment/ssccGenerator.ts
export function generateSSCC(companyPrefix: string, serial: number): string {
  const extension = '0'
  const paddedSerial = String(serial).padStart(16 - companyPrefix.length, '0')
  const raw = `${extension}${companyPrefix}${paddedSerial}`
  const checkDigit = calculateModulo10(raw)
  return `${raw}${checkDigit}`
}
```

**Step 3.3 — Multi-Step Shipment Form**

Build 7-step form using React Hook Form + Zod:

| Step | Component | Fields |
|---|---|---|
| 1 | `ShipmentModeStep` | Air / Surface toggle |
| 2 | `CustomerStep` | CustomerSelect + add new modal |
| 3 | `ShipmentDetailsStep` | Origin, Destination, Pieces, Weight, Value |
| 4 | `ConsigneeStep` | Name, Phone, Address |
| 5 | `ItemsStep` | Dynamic item list (add/remove) |
| 6 | `ChargesStep` | Freight, Packing, GST (auto-calculated) |
| 7 | `ReviewStep` | Summary card + confirm |

**Step 3.4 — Charges Engine**
```typescript
// packages/services/invoice/chargesEngine.ts
export function calculateCharges(input: ChargesInput): ChargesResult {
  const freight = input.weight * input.ratePerKg
  const packing = input.packingRequested ? PACKING_RATE : 0
  const subtotal = freight + packing + input.otherCharges
  const gst = input.isGSTApplicable ? subtotal * GST_RATE : 0
  return { freight, packing, subtotal, gst, total: subtotal + gst }
}
```

**Step 3.5 — Submit Handler**
On form submit, execute atomically:
1. Insert shipment record
2. Insert invoice record (linked to shipment)
3. Insert tracking event (`CREATED`)
4. Return shipment ID + CN for next step

**✅ Phase 3 Done When:**
- User can complete 7-step form
- CN is auto-generated on form open
- Invoice is auto-created on submit
- Tracking event `CREATED` is logged
- Shipment appears in shipments list

---

### PHASE 4: Label + Barcode + Scanning (Week 3, Days 1–4)

**Objective:** Physical label generation and warehouse scanning engine are operational.

#### Step-by-Step Tasks

**Step 4.1 — Barcode Generation**
```bash
pnpm add bwip-js
```
- Generate Code128 barcode from CN (MVP)
- Prepare GS1-128 structured encoding (advanced)
- Export as SVG or canvas for embedding in labels

**Step 4.2 — Shipping Label PDF (4x6 Thermal)**
Using `@react-pdf/renderer`:

Label Zones:
```
┌──────────────────────────────────┐
│ ZONE 1: Sender + Receiver        │
├──────────────────────────────────┤
│ ZONE 2: CN | Route | Weight      │
│          Mode | Pieces           │
├──────────────────────────────────┤
│ ZONE 3: ████████████████████████ │
│         [BARCODE — LARGE]        │
│         TAC-26-000123            │
└──────────────────────────────────┘
```
- Barcode must occupy minimum 40% of label height
- Print-ready: 4 inches × 6 inches at 203 DPI

**Step 4.3 — Scanner Detection Logic**
```typescript
// packages/scanner/detector.ts
const SCAN_SPEED_THRESHOLD = 100  // ms between keystrokes
const MIN_SCAN_LENGTH = 6
const AUTO_SUBMIT_DELAY = 80

export class ScannerDetector {
  private lastKeyTime = 0
  private buffer = ""
  private isScanMode = false

  onKeyPress(char: string): void {
    const now = Date.now()
    const delta = now - this.lastKeyTime
    this.lastKeyTime = now

    if (delta < SCAN_SPEED_THRESHOLD) {
      this.isScanMode = true
      this.buffer += char
    } else {
      this.isScanMode = false
      this.buffer = char
    }
  }

  getResult(): { isScan: boolean; value: string } {
    return {
      isScan: this.isScanMode && this.buffer.length >= MIN_SCAN_LENGTH,
      value: this.buffer,
    }
  }
}
```

**Step 4.4 — Scan Validation Engine**
```typescript
// packages/scanner/validator.ts
export async function validateScan(
  cn: string,
  mode: ScanMode,
  hubId: string
): Promise<ScanValidationResult> {
  const shipment = await shipmentService.findByCN(cn)

  if (!shipment) return { valid: false, error: "NOT_FOUND" }

  const currentStatus = deriveStatus(shipment.tracking_events)
  const allowedTransitions = ALLOWED_TRANSITIONS[mode]

  if (!allowedTransitions.includes(currentStatus))
    return { valid: false, error: "WRONG_STATUS" }

  if (shipment.current_hub !== hubId)
    return { valid: false, error: "WRONG_LOCATION" }

  return { valid: true, shipment }
}

const ALLOWED_TRANSITIONS: Record<ScanMode, ShipmentStatus[]> = {
  RECEIVE:        ['CREATED', 'IN_TRANSIT'],
  LOAD_MANIFEST:  ['RECEIVED'],
  VERIFY:         ['IN_TRANSIT'],
  DELIVER:        ['ARRIVED', 'OUT_FOR_DELIVERY'],
}
```

**Step 4.5 — Offline Scan Queue**
```typescript
// packages/scanner/offline-queue.ts
import { set, get, del, keys } from "idb-keyval"

interface QueuedScan {
  id: string
  cn: string
  mode: ScanMode
  hubId: string
  timestamp: number
  status: 'PENDING' | 'SYNCED' | 'FAILED'
}

export const offlineQueue = {
  async push(scan: Omit<QueuedScan, 'id' | 'status'>): Promise<void> {
    const id = `scan_${Date.now()}`
    await set(id, { ...scan, id, status: 'PENDING' })
  },

  async syncAll(): Promise<void> {
    const scanKeys = await keys()
    for (const key of scanKeys) {
      const scan = await get<QueuedScan>(key as string)
      if (scan?.status === 'PENDING') {
        try {
          await scanEngine.process(scan)
          await set(key, { ...scan, status: 'SYNCED' })
        } catch {
          await set(key, { ...scan, status: 'FAILED' })
        }
      }
    }
  }
}
```

**Step 4.6 — Scan UI (Warehouse Page)**
- Mode selector: `RECEIVE | LOAD | VERIFY | DELIVER`
- Large auto-focus scan input (clears after submission)
- Real-time feedback panel: green/red/yellow card
- Last 10 scans history
- Online/offline indicator with queue count

**✅ Phase 4 Done When:**
- Barcode label generates and prints correctly
- Hardware scanner input is detected automatically
- Scan validates and creates tracking event
- Offline queue stores and syncs when reconnected

---

### PHASE 5: Manifest + Tracking (Week 3, Days 5–7)

**Step 5.1 — Manifest Creation**
- Select origin hub + destination hub
- System generates manifest ID
- Status: `OPEN`

**Step 5.2 — Add Shipments to Manifest**
- Scan barcode → add to manifest (atomic)
- Real-time list update via Supabase Realtime

**Step 5.3 — Manifest Close (Atomic Operation)**
```typescript
// packages/services/manifest/manifestService.ts
export async function closeManifest(manifestId: string): Promise<void> {
  // Atomic: update manifest status + all shipment statuses
  await supabase.rpc('close_manifest_atomic', { manifest_id: manifestId })
  // Creates IN_TRANSIT tracking event for all shipments
}
```

**Step 5.4 — Tracking Timeline UI**
Vertical timeline with:
- Event type → icon + label
- Hub + location
- Operator + timestamp
- Real-time subscription via Supabase Realtime

**✅ Phase 5 Done When:**
- Manifest can be created, loaded, closed, dispatched, arrived
- All shipments in manifest update status atomically
- Tracking timeline shows all events chronologically

---

### PHASE 6: Landing Page + Public Layer (Week 4, Days 1–3)

**Step 6.1 — Landing Page Sections**

1. **Navbar** — Logo, Home, Track, Contact, Login CTA
2. **Hero Section** — Tagline, animated entrance, CTA to tracking
3. **Tracking Box** — Prominent CN/AWB input, instant search
4. **Features Section** — 3 key capabilities (speed, accuracy, transparency)
5. **AI Chat Widget** — Bottom-right floating, collapsible
6. **Contact Form** — Name, Phone, Message, submit to DB
7. **Footer** — Company info, links

**Step 6.2 — Public Tracking Page**
- Enter CN → fetch tracking events
- Display vertical timeline
- No login required
- SEO-optimized page title per CN

**Step 6.3 — Public Tracking API**
```typescript
// apps/web/app/api/track/route.ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const cn = searchParams.get("cn")
  const events = await trackingService.getPublicTimeline(cn)
  return Response.json(events)
}
```

**✅ Phase 6 Done When:**
- Landing page renders with all sections
- Public tracking works without login
- Contact form submits successfully
- Login button redirects to Clerk

---

### PHASE 7: Analytics + Dashboard (Week 4, Days 4–6)

**Step 7.1 — Dashboard KPI Cards**
```
Total Shipments | Revenue MTD | In Transit | Delivered Today
```
Each card: current value + % change from last period

**Step 7.2 — Charts (using Recharts)**
- `BarChart` — Shipments by day (last 30 days)
- `LineChart` — Revenue trend (last 6 months)
- `PieChart` — Shipments by mode (Air vs Surface)
- `AreaChart` — Delivery performance over time

**Step 7.3 — Live Activity Feed**
- Real-time Supabase subscription on `tracking_events`
- Last 20 events shown in sidebar with timestamps

**Step 7.4 — Analytics Page**
- Date range filter
- Route filter (origin → destination)
- Mode filter (Air / Surface)
- Export to CSV/Excel

**✅ Phase 7 Done When:**
- Dashboard loads with real data
- Charts update when date range changes
- Live feed shows scans in real time

---

### PHASE 8: AI + WhatsApp Integration (Week 5, Days 1–4)

**Step 8.1 — AI Chatbot (Public — Customer Support)**
```typescript
// Vercel AI SDK + Claude
import { streamText } from "ai"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(req: Request) {
  const { messages } = await req.json()
  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: TACBOT_SYSTEM_PROMPT,
    messages,
    tools: {
      trackShipment: { /* fetches real tracking data */ },
      getBusinessInfo: { /* FAQs, locations, contact */ }
    }
  })
  return result.toDataStreamResponse()
}
```

**Step 8.2 — Invoice PDF Generation**
```typescript
// packages/services/invoice/pdfGenerator.ts
import { renderToBuffer } from "@react-pdf/renderer"
import { InvoiceDocument } from "@workspace/ui"

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  const invoice = await invoiceService.getWithDetails(invoiceId)
  return renderToBuffer(<InvoiceDocument invoice={invoice} />)
}
```

**Step 8.3 — WhatsApp Invoice Delivery**
```typescript
// packages/services/whatsapp/whatsappService.ts
export async function sendInvoiceViaWhatsApp(
  invoiceId: string,
  phone: string
): Promise<void> {
  const pdf = await generateInvoicePDF(invoiceId)
  const mediaId = await uploadToWhatsAppMedia(pdf)
  await sendWhatsAppDocument(phone, mediaId, `Invoice-${invoiceId}.pdf`)
}
```

**✅ Phase 8 Done When:**
- AI chatbot responds to tracking queries with real data
- Invoice PDF generates correctly
- WhatsApp send button delivers invoice to customer phone

---

### PHASE 9: Inventory + Advanced Features (Week 5, Days 5–7)

**Step 9.1 — Warehouse Location System**
```
Warehouse → Zone → Rack → Slot
Example: IMF-A1-R3-S2
```
- Assign location on scan-receive
- Visual warehouse map (optional)

**Step 9.2 — GS1-128 Upgrade (Advanced Barcode)**
- Replace Code128 with GS1-128 structured encoding
- Encode: `(00)SSCC (10)Batch (37)Quantity`
- Update scanner parser to extract all fields

**Step 9.3 — RFID Readiness Stub**
- Abstract input layer to support future RFID source
- Document integration point in `packages/scanner/detector.ts`

**Step 9.4 — Audit Log System**
```sql
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  action      TEXT NOT NULL,        -- 'shipment.create', 'invoice.update'
  entity_type TEXT NOT NULL,
  entity_id   UUID NOT NULL,
  before_data JSONB,
  after_data  JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. Module-by-Module Build Specification

| Module | Package(s) Involved | Key Files | Priority |
|---|---|---|---|
| Auth | `packages/auth`, Clerk | middleware.ts, rbac.ts | 🔴 Critical |
| Design System | `packages/ui` | globals.css, components/ | 🔴 Critical |
| Shipment | `packages/services`, `packages/types` | shipmentService.ts, cnGenerator.ts | 🔴 Critical |
| Invoice | `packages/services` | invoiceService.ts, chargesEngine.ts | 🔴 Critical |
| Barcode | `packages/services` | barcodeService.ts, gs1Encoder.ts | 🔴 Critical |
| Label | `packages/services` | labelService.ts | 🟠 High |
| Scanner | `packages/scanner` | engine.ts, detector.ts, validator.ts | 🔴 Critical |
| Manifest | `packages/services` | manifestService.ts | 🟠 High |
| Tracking | `packages/services` | trackingService.ts | 🟠 High |
| Customer | `packages/services` | customerService.ts | 🟠 High |
| Analytics | `apps/web` | analytics/page.tsx | 🟡 Medium |
| AI Chat | `apps/web` | api/chat/route.ts | 🟡 Medium |
| WhatsApp | `packages/services` | whatsappService.ts | 🟡 Medium |
| Inventory | `packages/services` | inventoryService.ts | 🟢 Low |
| Offline Queue | `packages/scanner` | offline-queue.ts | 🟠 High |

---

## 11. Database Architecture

### Core Tables

```sql
-- Organizations (multi-tenant)
CREATE TABLE organizations (
  id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name   TEXT NOT NULL,
  code   TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users (synced from Clerk)
CREATE TABLE users (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id  TEXT UNIQUE NOT NULL,
  email     TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'staff',
  org_id    UUID REFERENCES organizations(id),
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
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID REFERENCES organizations(id) NOT NULL,
  cn             TEXT UNIQUE NOT NULL,       -- TAC-26-000123
  sscc           TEXT UNIQUE,               -- GS1 SSCC
  customer_id    UUID REFERENCES customers(id) NOT NULL,
  mode           TEXT NOT NULL,             -- AIR | SURFACE
  origin         TEXT NOT NULL,
  destination    TEXT NOT NULL,
  pieces         INTEGER NOT NULL,
  weight         NUMERIC NOT NULL,
  declared_value NUMERIC,
  consignee_name TEXT NOT NULL,
  consignee_phone TEXT NOT NULL,
  consignee_address TEXT NOT NULL,
  current_status TEXT GENERATED ALWAYS AS (
    -- derived from latest tracking event
    'CREATED'
  ) STORED,
  created_by     UUID REFERENCES users(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking Events (Event-Driven)
CREATE TABLE tracking_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) NOT NULL,
  event_type  TEXT NOT NULL,   -- CREATED, RECEIVED, IN_TRANSIT, ARRIVED, DELIVERED
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
  gst_amount   NUMERIC DEFAULT 0,
  total        NUMERIC NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'TO_PAY', -- PAID | TO_PAY | CREDIT
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Manifests
CREATE TABLE manifests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID REFERENCES organizations(id) NOT NULL,
  manifest_no TEXT UNIQUE NOT NULL,
  origin      TEXT NOT NULL,
  destination TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'OPEN', -- OPEN | CLOSED | DEPARTED | ARRIVED
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Manifest Shipments (Junction)
CREATE TABLE manifest_shipments (
  manifest_id UUID REFERENCES manifests(id) NOT NULL,
  shipment_id UUID REFERENCES shipments(id) NOT NULL,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (manifest_id, shipment_id)
);
```

### Key Indexes

```sql
CREATE INDEX idx_shipments_cn ON shipments(cn);
CREATE INDEX idx_shipments_org ON shipments(org_id);
CREATE INDEX idx_tracking_events_shipment ON tracking_events(shipment_id, created_at DESC);
CREATE INDEX idx_invoices_payment_type ON invoices(payment_type);
```

---

## 12. Scanner Engine Design

### Processing Flow

```
User Scans Barcode
        ↓
[ScannerDetector] — Detects hardware vs manual
        ↓
[ScanParser] — Extracts CN / SSCC / metadata
        ↓
[DeduplicationCheck] — Within last 5 seconds?
        ↓ (if not duplicate)
[ScanValidator] — Shipment exists? Correct status? Correct hub?
        ↓ (if valid)
[ScanEngine] — Apply business rules for current mode
        ↓
[TrackingService] — Create tracking event
        ↓
[RealtimeLayer] — Supabase Realtime broadcast
        ↓
[UI Feedback] — Green / Red / Yellow card
```

### Scan Result Taxonomy

| Result Code | Color | Meaning |
|---|---|---|
| `SUCCESS` | Green | Scan processed, event created |
| `NOT_FOUND` | Red | CN not in system |
| `WRONG_STATUS` | Red | Shipment not in allowed state for this mode |
| `WRONG_LOCATION` | Red | Shipment not assigned to this hub |
| `DUPLICATE` | Yellow | Scanned within 5 seconds |
| `INVALID` | Red | Barcode format unrecognized |
| `OFFLINE_QUEUED` | Blue | No internet — queued for sync |

---

## 13. Deployment Architecture

### Infrastructure

```
User Browser
      ↓
  Vercel CDN (Edge Network)
      ↓
  Next.js App (Vercel — Serverless + Edge Functions)
      ↓
  ┌────────────────┐    ┌──────────────────┐
  │   Clerk Auth   │    │  Supabase Cloud  │
  │ (JWT + RBAC)   │    │  (DB + Realtime) │
  └────────────────┘    └──────────────────┘
                               ↓
                    ┌──────────────────────┐
                    │ Supabase Edge Funcs  │
                    │ (Clerk webhook sync) │
                    └──────────────────────┘
```

### Environment Variables

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# WhatsApp (Meta Cloud API)
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=

# AI
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## 14. Quality Gates & Definition of Done

### Per-Phase Checklist

**For every phase to be marked COMPLETE:**

- [ ] All TypeScript types are defined in `packages/types`
- [ ] All business logic is in `packages/services` (not in UI)
- [ ] All components import from `@workspace/ui` only
- [ ] No hardcoded colors or fonts exist in any file
- [ ] ESLint passes with zero warnings
- [ ] TypeScript compiles with zero errors
- [ ] Turborepo `pnpm build` passes
- [ ] Feature works end-to-end in development

### MVP Launch Checklist

| Capability | Status |
|---|---|
| User can log in via Clerk | ⬜ |
| Dashboard loads with KPI data | ⬜ |
| Shipment can be created (7-step form) | ⬜ |
| CN is auto-generated | ⬜ |
| Invoice is auto-created | ⬜ |
| Shipping label (4x6) generates correctly | ⬜ |
| Barcode is scannable | ⬜ |
| Hardware scanner is detected automatically | ⬜ |
| Scan updates shipment status | ⬜ |
| Tracking timeline shows all events | ⬜ |
| Public tracking works without login | ⬜ |
| Design system has zero violations | ⬜ |
| CI gate passes on all PRs | ⬜ |

---

## Final Strategic Note

TAC Express is being built as a **logistics infrastructure platform**, not a web app. Every architectural decision in this document is designed to serve that ambition:

- The **monorepo** ensures the platform can grow to mobile without re-engineering
- The **service layer** ensures business logic is testable and not scattered
- The **design system** ensures visual consistency across 50+ screens
- The **scanner engine** is the operational heartbeat of the platform
- The **event-driven tracking model** is the industry standard for supply chain visibility

> **The measure of this platform is not how many features it has, but how accurately and reliably it handles a single shipment from creation to delivery.**

---

*Document prepared for TAC Express engineering team.*  
*All architectural decisions in this document supersede previous discussions.*  
*This document must be reviewed at the start of each implementation phase.*
