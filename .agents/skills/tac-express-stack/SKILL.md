---
name: tac-express-stack
description: Complete tech stack reference for the tac-express monorepo. Use when adding new features, installing packages, setting up configuration, or making architectural decisions. Covers all tools, versions, conventions, and workspace structure.
---

# tac-express — Full Stack Reference

This skill documents the canonical technology decisions for the `tac-express` monorepo so every agent session starts with accurate context.

## Monorepo Structure

```
tac-express/                   ← Workspace root (pnpm + Turborepo)
├── apps/
│   └── web/                   ← Next.js 16 application (Turbopack dev)
├── packages/
│   ├── ui/                    ← Shared UI library (@workspace/ui)
│   ├── eslint-config/         ← Shared ESLint config (@workspace/eslint-config)
│   └── typescript-config/     ← Shared TS config (@workspace/typescript-config)
├── .agent/skills/             ← GSD skills (backward-compatible path)
├── .agents/skills/            ← Project-specific Antigravity skills (new default)
├── turbo.json                 ← Turborepo pipeline
└── pnpm-workspace.yaml        ← pnpm workspace declaration
```

## Package Manager & Build System

| Tool | Version | Notes |
|------|---------|-------|
| **pnpm** | 9.15.9 | Required — do NOT use npm or yarn |
| **Turborepo** | ^2.8.17 | Task orchestration across packages |
| **Node.js** | ≥20 | Enforced via `engines` in root package.json |
| **TypeScript** | 5.9.3 | Strict, shared via `@workspace/typescript-config` |

### Turborepo Task Pipeline

```json
build  → dependsOn [^build]   outputs [.next/**]
lint   → dependsOn [^lint]
format → dependsOn [^format]
typecheck → dependsOn [^typecheck]
dev    → cache: false, persistent: true
```

## `apps/web` — Next.js Application

| Property | Value |
|----------|-------|
| **Framework** | Next.js 16.1.6 |
| **Dev server** | `next dev --turbopack` (Turbopack, NOT webpack) |
| **React** | 19.2.4 |
| **App Router** | Yes — `apps/web/app/` directory |
| **Module type** | ESM (`"type": "module"`) |

### Key Dependencies (apps/web)

```
next@16.1.6
react@19.2.4
react-dom@19.2.4
next-themes@0.4.6       ← Dark mode support
@remixicon/react@4.9.0  ← Icon library
@workspace/ui            ← Shared component library
```

### Dev Dependencies (apps/web)

```
@tailwindcss/postcss@4.1.18  ← TailwindCSS v4 PostCSS integration
typescript@5.9.3
eslint@9.39.2
```

## `packages/ui` — Shared Component Library

This is the canonical source for all UI components, consumed as `@workspace/ui`.

### Package Exports

```json
"@workspace/ui/globals.css"     → src/styles/globals.css
"@workspace/ui/postcss.config"  → postcss.config.mjs
"@workspace/ui/lib/*"           → src/lib/*.ts
"@workspace/ui/components/*"    → src/components/*.tsx
"@workspace/ui/hooks/*"         → src/hooks/*.ts
```

### UI Stack

| Library | Version | Purpose |
|---------|---------|---------|
| **TailwindCSS** | ^4.1.18 | Utility-first CSS (v4 — NO config file, CSS-first config) |
| **shadcn** | ^4.1.2 | Component primitives |
| **radix-ui** | ^1.4.3 | Accessible headless primitives |
| **class-variance-authority** | ^0.7.1 | Component variant management (CVA) |
| **clsx** | ^2.1.1 | Conditional className construction |
| **tailwind-merge** | ^3.5.0 | Merge Tailwind classes without conflicts |
| **tw-animate-css** | ^1.4.0 | Animation utilities |
| **next-themes** | ^0.4.6 | Theme (dark/light) management |
| **@remixicon/react** | ^4.9.0 | Icon components |
| **zod** | ^3.25.76 | Schema validation |
| **lottie-react** | ^2.x | Lottie animation player (hero section) |

### Design System: "Precision Velocity"

The UI package implements the **Precision Velocity** design system — a zero-curve brutalist system with:
- **5 depth layers** (`--bg-base/panel/surface/overlay`)
- **4 border tiers** (`--border-subtle/default/strong/primary`)
- **3 shadow tokens** (`--shadow-brutal/brutal-sm/brutal-primary`)
- **Atmospheric components** (NoiseOverlay, GridBackground, ScrollProgress, TextScramble, Marquee)
- **View Transitions API** theme toggle
- All animations via pure CSS / vanilla JS — zero forbidden packages

Full design system documentation: see `tac-express-ui` skill.

### shadcn Configuration (`packages/ui/components.json`)

```json
{
  "style": "radix-lyra",
  "rsc": true,
  "tsx": true,
  "iconLibrary": "remixicon",
  "tailwind": {
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@workspace/ui/components",
    "utils":      "@workspace/ui/lib/utils",
    "hooks":      "@workspace/ui/hooks",
    "lib":        "@workspace/ui/lib",
    "ui":         "@workspace/ui/components"
  }
}
```

## Critical Rules

- **Never** use npm or yarn — always `pnpm`
- **Never** add TailwindCSS v3 config (`tailwind.config.js`) — this project uses **TailwindCSS v4** (CSS-first config in `globals.css`)
- **Always** add new shared components to `packages/ui/src/components/`, not to `apps/web/`
- **Always** import icons from `@remixicon/react`, NOT from lucide-react or heroicons
- **Import UI** in apps using `@workspace/ui/components/component-name`
- **Import utils** using `@workspace/ui/lib/utils`
- **Import icons** using `@workspace/ui/icons` (wrapper around @remixicon/react)
- **All composed components** live in `packages/ui/src/components/composed/`
- **All primitives** (shadcn wrappers) live in `packages/ui/src/components/primitives/`
- Add new apps to `apps/` and register in `pnpm-workspace.yaml`
- Add new packages to `packages/` and register in `pnpm-workspace.yaml`
- **Geometry rule**: ZERO curves — `--radius: 0rem` — all straight lines and sharp corners

## Running Commands

```bash
# Root — runs across all packages via Turborepo
pnpm dev          # Start all dev servers
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm typecheck    # Type-check all packages
pnpm format       # Format all packages

# Targeted — single package
pnpm --filter web dev
pnpm --filter @workspace/ui build
pnpm --filter web add <package>       # Add dep to apps/web
pnpm --filter @workspace/ui add <pkg> # Add dep to UI package
```
