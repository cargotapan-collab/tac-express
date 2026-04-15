# TAC Express — Master Rules & Skills Reference

> **This is the single combined reference** for all rules, skills, and design constraints.
> Individual source files: `AGENTS.md` · `CLAUDE.md` · `PROJECT-RULES.md` · `DESIGN_SYSTEM.md`
> Individual skills: `.windsurf/skills/tac-*/SKILL.md`
> **VERSION:** 3.0 — 2026 Edition

---

## PART 1: SKILL ACTIVATION MAP

Load the skill BEFORE acting on any task that matches a trigger.

| Task | Skill to Load | Gate |
|------|--------------|------|
| New feature / component / UI | `tac-brainstorming` | Design approval required before code |
| Any UI component authoring | `tac-ui-authoring` | ZNG token compliance |
| Service / DB / hook writing | `tac-data-layer` | Architecture flow respected |
| Any implementation | `tac-tdd` | Failing test before code |
| Bug / error / failure | `tac-debug` | Root cause before fix |
| Pre-merge / post-feature | `tac-code-review` | All quality gates pass |
| Feature planning / execution | `tac-gsd` | Phase plan before execution |
| **Every non-trivial task** | **`karpathy-coding`** | **4 principles: Think→Simplify→Surgical→Verify** |

**Skills location:** `c:\tac\tac-express\.windsurf\skills\`
**Karpathy skill:** `c:\tac\tac-express\.agents\skills\karpathy-coding\SKILL.md`

---

## PART 2: THE TWELVE LAWS (Absolute — CI Blocks on Violation)

| # | Law |
|---|-----|
| 1 | No color value outside `packages/ui/src/styles/globals.css` |
| 2 | No icon except `@remixicon/react` via `@workspace/ui/icons` |
| 3 | No animation library except `tw-animate-css` |
| 4 | No font declaration except in `apps/web/app/layout.tsx` |
| 5 | No UI component in `apps/` — only in `packages/ui` |
| 6 | No database call in any component — only via `packages/services` |
| 7 | No business logic in components — only in `packages/services` |
| 8 | No `@supabase/supabase-js` import in `apps/` — only via `packages/database` |
| 9 | No hardcoded spacing, radius, or shadow values |
| 10 | No Tailwind color class (`bg-blue-500`, `text-red-400`) — semantic tokens only |
| 11 | No arbitrary Tailwind values (`w-[347px]`, `h-[52px]`) — scale tokens only |
| 12 | No `npm` or `yarn` — `pnpm` only across entire monorepo |

### Forbidden Packages
```
lucide-react  framer-motion  @motionone/react  gsap
styled-components  @mui/material  antd  chakra-ui
react-icons  moment  lodash  axios  classnames
clsx (use cn from @workspace/ui/lib/utils)
```

---

## PART 3: ARCHITECTURE RULES

```
apps/web | apps/dashboard
  └── React Components (display + interaction only)
       ↓
packages/services/        ← business logic, data transformation
  └── *.service.ts
       ↓
packages/database/        ← Supabase client (singleton)
  └── client.ts
       ↓
Supabase Cloud
```

**Cross-import rule:** `apps/web` ↔ `apps/dashboard` NEVER cross-import.

---

## PART 4: MONOREPO STRUCTURE

```
c:\tac\tac-express\
  apps/
    web/          Next.js 16 — Landing page + public
    dashboard/    Next.js 16 — Logistics management
  packages/
    ui/           @workspace/ui — components, styles, icons
    types/        @workspace/types — shared TypeScript types
    services/     @workspace/services — business logic
    database/     @workspace/database — Supabase client
    eslint-config/
    typescript-config/
  .windsurf/
    skills/       Windsurf Cascade skills (auto-invoked)
    workflows/    Manual workflows (/slash-command)
  .agent/
    skills/       GSD workflow skills
    get-shit-done/ GSD system
  .agents/
    skills/       This directory — master rules
```

---

## PART 5: ZNG DESIGN SYSTEM SUMMARY

**Identity:** Zen/Neo-Glass — dark only, glass morphism, cyber accents, bento grids.

**90/10 rule:** 90% calm (neutrals) → 10% energy (accent on interactive only).

### Critical CSS Tokens

```css
/* Backgrounds */
--background: #0B0F14              /* page root */
--bg-secondary: #11161C            /* cards */
--glass-bg: rgba(255,255,255,0.06) /* glass cards */
--glass-border: rgba(255,255,255,0.12)
--glass-blur: blur(20px)

/* Accents (10% rule) */
--accent-primary: #7DF9FF          /* cyber cyan */
--accent-secondary: #A78BFA        /* soft violet */
--accent-success: #4ADE80          /* jade green */
--accent-warning: #FACC15          /* muted gold */
--accent-danger: #F87171           /* soft red */

/* Text */
--foreground: #E6EDF3              /* primary */
--text-secondary: #9BA6B2          /* supporting */
--text-muted: #6B7280              /* labels */

/* Radius */
--radius-sm: 8px  --radius-md: 12px  --radius-lg: 16px
--radius-xl: 20px  --radius-2xl: 28px

/* Shadows */
--shadow-md: 0 4px 16px rgba(0,0,0,0.4)
--glow-cyan: 0 0 20px rgba(125,249,255,0.3)
```

### Component Quick Patterns

```tsx
// Glass Card
className="rounded-[var(--radius-xl)] bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-[var(--shadow-md)] p-6"

// Primary Button  
className="rounded-[var(--radius-md)] bg-gradient-to-r from-[rgba(125,249,255,0.15)] to-[rgba(167,139,250,0.1)] border border-[var(--accent-primary)] text-[var(--accent-primary)] px-6 py-2.5 hover:shadow-[var(--glow-cyan)] transition-all duration-[250ms]"

// Minimal Input
className="w-full bg-transparent border-b border-[var(--border-subtle)] py-3 text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] outline-none transition-colors"
```

---

## PART 6: COMPONENT AUTHORING PATTERN

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@workspace/ui/lib/utils"

const variants = cva("base", {
  variants: {
    variant: { default: "...", glass: "..." },
    size: { sm: "...", md: "...", lg: "..." }
  },
  defaultVariants: { variant: "default", size: "md" }
})

interface Props extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof variants> { asChild?: boolean }

function ComponentName({ className, variant, size, asChild = false, ...props }: Props) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp data-slot="component-name"
      className={cn(variants({ variant, size, className }))}
      {...props} />
  )
}
export { ComponentName, variants }
```

---

## PART 7: TDD CYCLE

```
1. Write failing test (RED)
2. Run: pnpm test → confirm it fails
3. Write minimal implementation (GREEN)
4. Run: pnpm test → confirm it passes
5. Refactor (CLEAN)
6. Run: pnpm test → still passes
7. Commit: type(scope): message
```

**Mock boundary:** Always mock at `packages/database` in service tests. Never mock internal implementation.

---

## PART 8: QUALITY GATES

```bash
pnpm lint --max-warnings 0   # zero warnings
pnpm typecheck               # zero errors  
pnpm build                   # succeeds
pnpm test                    # all pass
```

**Additional:**
- `data-slot` on every component
- Named exports only
- Types in `packages/types`
- No `any` in TypeScript
- `pnpm` only (no npm/yarn)

---

## PART 9: GIT STANDARDS

```
Branch:   feature/TAC-XXX-description | fix/TAC-XXX-description
Commit:   feat(ui): add glass card component
          fix(services): handle null response
Types:    feat | fix | chore | docs | refactor | test | style | perf
```

Never commit to `main` directly. Always PR + CI.

---

## PART 10: QUICK CHEATSHEET

```
ICONS:      import { RiName } from "@workspace/ui/icons"
UTILS:      import { cn } from "@workspace/ui/lib/utils"
COMPONENTS: import { X } from "@workspace/ui"
DB CLIENT:  import { getDbClient } from "@workspace/database"
SERVICES:   import { fn } from "@workspace/services"
TYPES:      import type { T } from "@workspace/types"

COLORS:     var(--accent-primary) var(--foreground) var(--glass-bg)
RADIUS:     var(--radius-sm/md/lg/xl/2xl)
SHADOWS:    var(--shadow-sm/md/lg/xl) var(--glow-cyan/violet)
MOTION:     animate-in fade-in slide-in-from-bottom-4 duration-300
PM:         pnpm (never npm or yarn)
```

---

## PART 11: FORBIDDEN ACTIONS SUMMARY

An AI agent MUST refuse or ask when told to:
- Install a forbidden package
- Put UI components in `apps/*/components/`
- Use raw Tailwind color classes
- Skip tests
- Call Supabase directly from a component
- Use `npm install` or `yarn add`
- Commit directly to `main`
- Hardcode any px value, hex color, or font name
- Use `framer-motion`, `gsap`, or `lucide-react`

**Response:** _"I can't do that — it violates LAW [X]. Compliant approach: [alternative]"_

---

## PART 12: KARPATHY CODING PROTOCOL

> Adapted from Andrej Karpathy's observations on LLM coding pitfalls.
> Full skill: `.agents/skills/karpathy-coding/SKILL.md`

Apply these four principles to **every non-trivial task**:

### P1 — Think Before Coding
- State assumptions explicitly. Ask rather than guess.
- Present multiple interpretations — never pick silently.
- Push back on Law violations immediately, offer a compliant alternative.
- TAC Express pre-flight: Which package? Which Law applies? Forbidden package?

### P2 — Simplicity First
- Minimum code that solves the problem. Nothing speculative.
- No pre-built variants when one is needed. No service layer for a single call.
- No error handling for impossible scenarios in the current phase.
- **Test:** "Would a senior engineer say this is overcomplicated?" If yes → rewrite.

### P3 — Surgical Changes
- Touch only what the request requires. Clean up only your own orphans.
- Match existing style (quote style, spacing, naming) even if you'd do it differently.
- Mention unrelated dead code — don't delete it.
- TAC Express: don't touch `layout.tsx` fonts, don't rewrite `globals.css` tokens unless that IS the task.

### P4 — Goal-Driven Execution
- Transform imperative requests into verifiable criteria.
- State the verification plan before implementing.
- Use the TAC Express verification ladder in order:
  ```
  pnpm typecheck → pnpm lint --max-warnings 0 → pnpm test → pnpm build → browser check → visual ZNG review
  ```

### Quick Mode Selector
| Task | Mode | Principles |
|------|------|------------|
| Obvious 1-liner / typo | Speed | P3 only |
| Bug fix | Caution | P1 + P3 + P4 |
| New feature | Full rigor | P1 + P2 + P3 + P4 |
| Refactor | Caution | P1 + P2 + P3 + P4 |
| Code review | Full rigor | P1 + P2 + P3 + P4 |
