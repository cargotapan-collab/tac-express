# TAC Express — Project Rules

> **Authority:** `docs/TAC-EXPRESS-IMPLEMENTATION-PLAN-v2.md`
> **Enforced by:** ESLint + pre-commit hooks + CI gates
> **Version:** 3.0 — Supersedes all v1.0 and v2.0 references
> **Read alongside:** `AGENTS.md` + `DESIGN_SYSTEM.md` + `CLAUDE.md`

---

## The Twelve Laws (Absolute — No Exceptions)

| # | Law | Violation = |
|---|-----|-------------|
| LAW 1 | No color value outside `packages/ui/src/styles/globals.css` | ESLint error + CI block |
| LAW 2 | No icon except `@remixicon/react` via `@workspace/ui/icons` | ESLint error + CI block |
| LAW 3 | No animation library except `tw-animate-css` | ESLint error + CI block |
| LAW 4 | No font declaration except in `apps/web/app/layout.tsx` | PR rejection |
| LAW 5 | No UI component in `apps/` — only in `packages/ui` | ESLint error + CI block |
| LAW 6 | No database call in any component — only via `packages/services` | PR rejection |
| LAW 7 | No business logic in components — only in `packages/services` | PR rejection |
| LAW 8 | No `@supabase/supabase-js` import in `apps/` — only via `packages/database` | ESLint error + CI block |
| LAW 9 | No hardcoded spacing, radius, or shadow values | ESLint error |
| LAW 10 | No Tailwind color class (`bg-blue-500`, `text-red-400`) — semantic tokens only | ESLint error + CI block |
| LAW 11 | No arbitrary Tailwind values (`w-[347px]`, `h-[52px]`) — use scale tokens | ESLint error |
| LAW 12 | No `npm` or `yarn` — `pnpm` only | Pre-commit hook blocks |

---

## Version Corrections (v1.0/v2.0 → v3.0)

| Topic | Old ❌ | Correct ✅ |
|-------|--------|-----------|
| Icons | lucide-react | `@remixicon/react` only |
| Animation | framer-motion / gsap | `tw-animate-css` only |
| Next.js version | 15.x | **16.x (Turbopack)** |
| Primary color | TAC Blue | **cyber cyan** `#7DF9FF` / `var(--accent-primary)` |
| shadcn style | default | **radix-lyra** |
| Font source | `packages/ui/fonts.ts` | `apps/web/app/layout.tsx` ONLY |
| Component location | `apps/web/components/` | `packages/ui/src/components/` ONLY |

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
lucide-react         framer-motion        @motionone/react
gsap                 styled-components    @mui/material
antd                 chakra-ui            react-icons
moment               lodash               axios
classnames           clsx (use cn from @workspace/ui/lib/utils)
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
Components:      PascalCase.tsx          (GlassCard.tsx)
Hooks:           useCamelCase.ts         (useShipments.ts)
Services:        camelCase.service.ts    (shipment.service.ts)
Types:           camelCase.types.ts      (shipment.types.ts)
Tests:           FileName.test.tsx       (GlassCard.test.tsx)
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
- [ ] No animation library other than `tw-animate-css`
- [ ] `data-slot` attribute on every new component
- [ ] Named exports only (no `export default`)

---

## Approved Future Packages (Phase-Gated)

| Package | Phase | Location |
|---------|-------|----------|
| `@clerk/nextjs` | Ph2 | `apps/` |
| `@supabase/supabase-js` | Ph2 | `packages/database` ONLY |
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
ICONS:      import { RiIconName } from "@workspace/ui/icons"
COMPONENTS: import { ComponentName } from "@workspace/ui"
COLORS:     bg-primary text-foreground border-border text-muted-foreground
FONTS:      font-sans font-mono font-heading  (declared in apps/web/app/layout.tsx)
ANIMATION:  animate-in fade-in slide-in-from-bottom duration-300
DATA:       packages/services → packages/database  (NEVER direct Supabase)
RADIUS:     var(--radius-sm) var(--radius-md) var(--radius-lg) var(--radius-xl)
SPACING:    p-4 m-6 gap-3  (scale tokens — NO arbitrary px values)
GLASS:      var(--glass-bg) var(--glass-border) var(--glass-blur)
ACCENT:     var(--accent-primary) var(--accent-secondary) var(--accent-success)
PM:         pnpm ONLY  (no npm, no yarn)
```
