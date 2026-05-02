# TAC Express — Project Rules

> **Authority:** `AGENTS.md` + `DESIGN_SYSTEM.md`
> **Enforced by:** ESLint + pre-commit hooks + CI gates
> **Version:** 7.0 — TAC Express v5.0 Violet Grid (May 2026)

---

## The Fourteen Laws (Absolute — No Exceptions)

| # | Law | Violation = |
|---|-----|-------------|
| LAW 1 | No color value outside `packages/ui/src/styles/globals.css` | ESLint error + CI block |
| LAW 2 | No icon except `@remixicon/react` via `@workspace/ui/icons` | ESLint error + CI block |
| LAW 3 | Animation via `motion` (motion/react) or `tw-animate-css`. No legacy `framer-motion`. | ESLint error + CI block |
| LAW 4 | No font declaration except in `apps/*/app/layout.tsx` (web AND dashboard) | PR rejection |
| LAW 5 | No UI component in `apps/` — only in `packages/ui` | ESLint error + CI block |
| LAW 6 | No database call in any component — only via `packages/services` | PR rejection |
| LAW 7 | No business logic in components — only in `packages/services` | PR rejection |
| LAW 8 | No `@supabase/supabase-js` import in `apps/` — only via `packages/database` | ESLint error + CI block |
| LAW 9 | No hardcoded spacing, radius, or shadow values | ESLint error |
| LAW 10 | No Tailwind color class (`bg-blue-500`, `text-red-400`) — semantic tokens only | ESLint error + CI block |
| LAW 11 | No arbitrary Tailwind values (`w-[347px]`, `h-[52px]`) — use scale tokens | ESLint error |
| LAW 12 | No `npm` or `yarn` — `pnpm` only | Pre-commit hook blocks |
| LAW 13 | No curved or wavy lines (SVGs, paths, decorations). Strict straight lines/angles only. | PR rejection |
| LAW 14 | Never rebuild a shadcn primitive from scratch. Wrap and style only. | PR rejection |

---

## Version Corrections

| Topic | Old ❌ | Correct ✅ |
|-------|---------|-----------|
| Icons | lucide-react, tabler, react-icons | `@remixicon/react` via `@workspace/ui/icons` only |
| Animation | `framer-motion` (legacy), `gsap`, `@motionone/react` | `motion` (motion/react), `tw-animate-css`, `@keyframes` in globals.css |
| Next.js version | 15.x | **16.x (Turbopack)** |
| Design system | TAC Precision / Velox / Wasteland / Orbital | **TAC Express v5.0 Violet Grid** |
| shadcn style | default / radix-maia | **radix-lyra** |
| Font sans | Outfit / Geist / Space Grotesk | **Plus Jakarta Sans** |
| Font mono | Geist Mono / Fira Mono / JetBrains Mono | **IBM Plex Mono** |
| Font serif | Noto Serif / Inter | **Lora** |
| Radius | 12px / 0.125rem | **0rem — zero radius** |
| Shadow | soft drop shadows | **2px/4px brutalist offset shadows only** |
| Primary color | cyan/orange (Wasteland), indigo (Orbital) | **violet** `oklch(0.5393 0.2713 286.7462)` |
| Font source | `packages/ui/fonts.ts` | `apps/web/app/layout.tsx` AND `apps/dashboard/app/layout.tsx` |
| Component location | `apps/web/components/` | `packages/ui/src/components/` ONLY |
| Glassmorphism | Velox Glass 2.0 | **None — solid surfaces, 1px borders** |

---

## Architecture Flow (Inviolable — No Skipping)

```
UI Component
     ↓  (props / hooks only)
packages/services/   ← business logic lives here
     ↓  (typed function calls only)
packages/database/   ← Supabase client lives here
     ↓
Supabase (cloud)
```

**Hard rules:**
- Components NEVER import from `@supabase/supabase-js`
- Components NEVER contain `if/else` business logic beyond display state
- `packages/database` is the ONLY place `@supabase/supabase-js` is used
- `packages/services` is the ONLY place DB queries are composed

---

## Forbidden Packages (Never Install — Ever)

```
lucide-react         framer-motion (legacy)   @motionone/react
gsap                 styled-components    @mui/material
antd                 chakra-ui            react-icons
moment               lodash               axios
classnames           @tabler/icons-react
clsx (use cn from @workspace/ui/lib/utils)
```

---

## Monorepo Rules

- **Root commands only:** `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test` — run from `c:\tac\tac-express`
- **Package install location:**
  - UI primitives → `packages/ui`
  - Data fetching → `packages/database` or `packages/services`
  - App-specific → `apps/web` or `apps/dashboard` (only if truly app-specific)
  - Types → `packages/types`
- **Never install** in `packages/ui` what belongs in `packages/services`
- **Never cross-import** between `apps/web` ↔ `apps/dashboard`

---

## File Naming Conventions

```
Component files: kebab-case.tsx          (dashboard-header.tsx)
Component exports: PascalCase            (export function DashboardHeader)
Hook files:      use-kebab-case.ts       (use-session.ts, use-shipments.ts)
Service files:   kebab-case.service.ts   (shipment.service.ts)
Type files:      kebab-case.types.ts     (shipment.types.ts)
Test files:      same-name.test.tsx      (dashboard-header.test.tsx)
Styles:          globals.css             (packages/ui/src/styles/ ONLY)
```

---

## Per-Phase Quality Gate (ALL must pass before proceeding)

```bash
pnpm lint --max-warnings 0    # Zero lint warnings
pnpm typecheck                # Zero TypeScript errors
pnpm build                    # Build succeeds
pnpm test                     # All tests pass
```

Additional checks:
- [ ] Types defined in `packages/types`
- [ ] Business logic in `packages/services`
- [ ] All imports from `@workspace/ui` (not from `packages/ui` directly)
- [ ] No hardcoded colors, fonts, spacing, or shadows anywhere
- [ ] No Tailwind color classes (semantic tokens only)
- [ ] No icon imports except via `@workspace/ui/icons`
- [ ] No animation library other than `motion` or `tw-animate-css`
- [ ] `data-slot` attribute on every new component
- [ ] Named exports only (no `export default`)

---

## Approved Future Packages (Phase-Gated)

| Package | Phase | Location |
|---------|-------|----------|
| `@supabase/supabase-js` | ✅ Active | `packages/database` ONLY |
| `@supabase/ssr` | ✅ Active | `packages/database` ONLY |
| `@tanstack/react-query` | Ph2 | `packages/services` |
| `zustand` | Ph2 | `packages/services` |
| `react-hook-form` | Ph3 | `packages/ui` or `apps/` |
| `@hookform/resolvers` | Ph3 | same as above |
| `bwip-js` | Ph4 | `packages/services` |
| `@zxing/library` | Ph4 | `packages/services` |
| `@react-pdf/renderer` | Ph4 | `packages/services` |
| `idb-keyval` | Ph4 | `packages/services` |
| `recharts` | Ph7 | `packages/ui` |
| `ai` | Ph8 | `packages/services` |
| `@anthropic-ai/sdk` | Ph8 | `packages/services` |
| `sentry` | Ph10 | root config |

---

## Git Standards

```
Branch:   feature/TAC-XXX-short-description
          fix/TAC-XXX-short-description
          chore/description

Commit:   type(scope): message
          feat(ui): add glass card component
          fix(services): handle null shipment response
          chore(deps): update @workspace/ui peer deps

Types:    feat | fix | chore | docs | refactor | test | style | perf
```

- **Never commit to `main` directly** — PR + CI required
- **One logical change per commit** — no WIP, no misc
- **Pre-commit must pass:** `pnpm build && pnpm lint && pnpm typecheck`

---

## Quick Reference

```
ICONS:      import { Icon } from "@workspace/ui/icons"  (@remixicon/react via wrapper)
COMPONENTS: import { ... } from "@workspace/ui"  (shadcn radix-lyra)
COLORS:     bg-primary, text-foreground, border-border  (NO bg-blue-500, #hex, rgb())
            bg-accent-success / bg-accent-warning / bg-accent-danger / bg-accent-info
FONTS:      font-sans (Plus Jakarta Sans)  font-serif (Lora)  font-mono (IBM Plex Mono)
            declared in apps/web/app/layout.tsx AND apps/dashboard/app/layout.tsx
ANIMATION:  motion components OR animate-in fade-in slide-in-from-* duration-* (tw-animate-css)
            + CSS @keyframes in globals.css (shimmer, scan-line, marquee-x, aurora-breathe)
DATA:       via packages/services → packages/database  (NEVER direct Supabase in components)
RADIUS:     var(--radius-sm/md/lg/xl)  (NOT rounded-lg)
SPACING:    Tailwind scale (p-4, m-6)  (NO arbitrary [px] values)
PACKAGES:   pnpm ONLY  (NO npm, NO yarn)
GEOMETRY:   ZERO curves — all straight lines, sharp corners
```
