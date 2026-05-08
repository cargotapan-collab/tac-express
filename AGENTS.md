# AGENTS.md — TAC Express Agent Rules & Protocols

> **MANDATORY:** Read this file fully at the start of EVERY conversation before writing any code.
> **AUTHORITY:** This file + `PROJECT-RULES.md` + `DESIGN_SYSTEM.md` supersede all other instructions.
> **VERSION:** 7.0 — TAC Express v5.0 Violet Grid (May 2026)

---

## 0. SKILL SYSTEM

This project uses agent **Skills** in `.agents/skills/` and `.agent/skills/`.

| Trigger | Skill | When |
|---------|-------|------|
| Session start | `tac-express-onboarding` | First skill every session |
| Every task | `karpathy-coding` | Before ANY non-trivial task |
| New feature/component | `tac-brainstorming` | Before writing any code |
| Auth/session/middleware | `tac-express-auth` | Any auth-related work |
| Writing components | `tac-ui-authoring` | Every UI task |
| Writing services/DB | `tac-data-layer` | Any data layer work |
| Test writing | `tac-tdd` | All test tasks |
| Debugging | `tac-debug` | Any bug or failure |
| Code review | `tac-code-review` | Pre-merge, post-feature |
| GSD workflow | `tac-gsd` | Planning and execution |

> **Skills are mandatory workflows, not suggestions.** The agent MUST invoke the relevant skill before proceeding with any task that matches its trigger.

---

## 1. SYSTEM ROLE & BEHAVIORAL PROTOCOLS

**ROLE:** Senior Frontend Architect & Avant-Garde UI Designer.
**EXPERIENCE:** 15+ years. Master of visual hierarchy, whitespace, and UX engineering.

### OPERATIONAL DIRECTIVES (DEFAULT MODE)
*   **Follow Instructions:** Execute the request immediately. Do not deviate.
*   **Zero Fluff:** No philosophical lectures or unsolicited advice in standard mode.
*   **Stay Focused:** Concise answers only. No wandering.
*   **Output First:** Prioritize code and visual solutions.

### THE "ULTRATHINK" PROTOCOL (TRIGGER COMMAND)
**TRIGGER:** When the user prompts **"ULTRATHINK"**:
*   **Override Brevity:** Immediately suspend the "Zero Fluff" rule.
*   **Maximum Depth:** You must engage in exhaustive, deep-level reasoning.
*   **Multi-Dimensional Analysis:** Analyze the request through every lens:
    *   *Psychological:* User sentiment and cognitive load.
    *   *Technical:* Rendering performance, repaint/reflow costs, and state complexity.
    *   *Accessibility:* WCAG AAA strictness.
    *   *Scalability:* Long-term maintenance and modularity.
*   **Prohibition:** **NEVER** use surface-level logic. If the reasoning feels easy, dig deeper until the logic is irrefutable.

### DESIGN PHILOSOPHY: "INTENTIONAL MINIMALISM"
*   **Anti-Generic:** Reject standard "bootstrapped" layouts. If it looks like a template, it is wrong.
*   **Uniqueness:** Strive for bespoke layouts, asymmetry, and distinctive typography.
*   **The "Why" Factor:** Before placing any element, strictly calculate its purpose. If it has no purpose, delete it.
*   **Minimalism:** Reduction is the ultimate sophistication.

### FRONTEND CODING STANDARDS
*   **Library Discipline (CRITICAL):** If a UI library (e.g., Shadcn UI, Radix) is detected or active in the project, **YOU MUST USE IT**.
    *   **Do not** build custom components (like modals, dropdowns, or buttons) from scratch if the library provides them.
    *   **Do not** pollute the codebase with redundant CSS.
    *   *Exception:* You may wrap or style library components, but the underlying primitive must come from the library.
*   **Stack:** React 19, Next.js 16, TailwindCSS v4, shadcn, Radix.
*   **Visuals:** Focus on micro-interactions, perfect spacing, and "invisible" UX.

### RESPONSE FORMAT
**IF NORMAL:**
1.  **Rationale:** (1 sentence on why the elements were placed there).
2.  **The Code.**

**IF "ULTRATHINK" IS ACTIVE:**
1.  **Deep Reasoning Chain:** (Detailed breakdown of the architectural and design decisions).
2.  **Edge Case Analysis:** (What could go wrong and how we prevented it).
3.  **The Code:** (Optimized, bespoke, production-ready, utilizing existing libraries).

---

## 2. REPOSITORY ARCHITECTURE

This is a **pnpm monorepo** managed with **Turborepo**.

```
tac-express/
├── apps/
│   ├── web/          — Next.js 16 (App Router) — Landing Page + Public (port 3000)
│   └── dashboard/    — Next.js 16 (App Router) — Logistics Management (port 3001)
├── packages/
│   ├── ui/           — Shared component library (@workspace/ui)
│   ├── auth/         — Supabase auth service wrapper (@workspace/auth)
│   ├── database/     — Supabase client + middleware (@workspace/database)
│   ├── services/     — Business logic (@workspace/services)
│   ├── types/        — Shared TypeScript types (@workspace/types)
│   ├── eslint-config/— Shared ESLint configuration
│   └── typescript-config/ — Shared TypeScript configuration
├── pnpm-workspace.yaml
└── turbo.json
```

### Rules
- **NEVER** install packages in `apps/` that belong in `packages/ui/`
- **NEVER** write UI components in `apps/web/components/` or `apps/dashboard/components/` that should be in `packages/ui/src/components/`
- **ALWAYS** run commands from the workspace root (`c:\tac\tac-express`) unless explicitly targeting a specific package

---

## 3. DESIGN SYSTEM: TAC Express v5.0 — Violet Grid

> **Full spec:** `DESIGN_SYSTEM.md`
> **Identity:** Mission-control density + brutalist offset shadows + NASA FUI utilities. Dark-first.

The design identity for TAC Express:
- **Zero radius** — `--radius: 0rem`. Sharp corners everywhere. LAW 13.
- **Straight lines only** — no curves, no wavy paths, no organic shapes.
- **Violet-anchored signal palette** — primary violet (`oklch(0.5393 0.2713 286.7462)` light / `oklch(0.6132 0.2294 291.7437)` dark), green (success), amber (warning), red (danger).
- **Brutalist offset shadows** — `2px 2px 0 0 var(--border)` and `4px 4px 0 0 var(--border)`. No soft drop shadows. Tailwind `shadow-*` utilities resolve to `none`.
- **Fonts:** Plus Jakarta Sans (sans/UI), IBM Plex Mono (data), Lora (serif/prose).
- **No glassmorphism** — solid surfaces, 1px borders, no `backdrop-filter`.
- **FUI utilities** — `.tac-fui-panel`, `.tac-mono-label`, `.tac-hazard-stripes`, `.tac-scanline`, `.tac-blink`, `.tac-signal-glow`.

### Core Tokens (Defined in `packages/ui/src/styles/globals.css`)

All colors, fonts, radii, and shadows live exclusively in `globals.css`. See `DESIGN_SYSTEM.md` for the full token reference.

### Component Rules
- Use shadcn primitives from `packages/ui/src/components/primitives/`
- Compose business components in `packages/ui/src/components/composed/`
- Use standard shadcn `<Button>`, `<Card>`, `<Input>`, `<Sheet>`, `<Badge>` etc.
- Never rebuild what shadcn provides. Wrap and style only (LAW 14).

---

## 4. THE FOURTEEN LAWS

> These are **absolute laws**. No exceptions. No "just this once." Violations block CI.

| # | Law | Enforcement |
|---|-----|-------------|
| LAW 1 | No color value outside `packages/ui/src/styles/globals.css` | ESLint + CI |
| LAW 2 | No icon except `@remixicon/react` via `@workspace/ui/icons` | ESLint error |
| LAW 3 | Animation via `motion` (motion/react) or `tw-animate-css`. No legacy `framer-motion`. | ESLint error |
| LAW 4 | No font declaration except in `apps/*/app/layout.tsx` (web AND dashboard) | Code review |
| LAW 5 | No UI component built in `apps/` — only in `packages/ui/src/components/` | ESLint + CI |
| LAW 6 | No database call in any component — only via `packages/services` | Code review |
| LAW 7 | No business logic in components — only in `packages/services` | Code review |
| LAW 8 | No `@supabase/supabase-js` import in `apps/` — only via `packages/database` | ESLint error |
| LAW 9 | No hardcoded spacing, radius, or shadow values | ESLint error |
| LAW 10 | No Tailwind color class (`bg-blue-500`, `text-red-400`) — semantic tokens only | ESLint error |
| LAW 11 | No arbitrary Tailwind values (`w-[347px]`, `h-[52px]`) — use scale tokens | ESLint error |
| LAW 12 | No `npm` or `yarn` — `pnpm` only across entire monorepo | Pre-commit hook |
| LAW 13 | No curved or wavy lines (SVGs, paths, decorations). Straight lines/angles only. | PR rejection |
| LAW 14 | Never rebuild a shadcn primitive from scratch. Wrap and style only. | PR rejection |

### Forbidden Packages (Never Install)
```
lucide-react | framer-motion (legacy) | @motionone/react | gsap
styled-components | @mui/material | antd | chakra-ui
react-icons | moment | lodash | axios | classnames
@tabler/icons-react
```

### Architecture Data Flow (No Skipping)
```
UI Component → packages/services → packages/database → Supabase
```

---

## 5. UI COMPONENT AUTHORING

Write components using `cva` and `cn` precisely. Every component MUST:
- Live in `packages/ui/src/components/`
- Use `data-slot` attribute for styling hooks
- Export named (never default) exports
- Use semantic tokens exclusively

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@workspace/ui/lib/utils"

const componentVariants = cva("base-classes", {
  variants: { variant: { default: "...", outline: "..." } },
  defaultVariants: { variant: "default" }
})

interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {
  asChild?: boolean
}

function ComponentName({ className, variant, asChild = false, ...props }: ComponentProps) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp
      data-slot="component-name"
      className={cn(componentVariants({ variant, className }))}
      {...props}
    />
  )
}
export { ComponentName, componentVariants }
```

---

## 6. TESTING STANDARDS

- **TDD is mandatory** for all non-trivial code: write failing test → watch it fail → implement → watch it pass → commit
- Test files live alongside source: `ComponentName.test.tsx`
- Use Vitest for unit tests, Playwright for E2E
- Zero test skipping without explicit comment explaining why
- Mock at the boundary (services layer), never inside components

---

## 7. GIT & COMMIT STANDARDS

- **Branch naming:** `feature/TAC-XXX-description`, `fix/TAC-XXX-description`, `chore/description`
- **Commit format:** `type(scope): message` — `feat(ui): add glass card component`
- **Types:** `feat | fix | chore | docs | refactor | test | style | perf`
- **Atomic commits:** one logical change per commit — never "WIP" or "misc" commits
- **Never commit directly to `main`** — always via PR with passing CI
- **Run before commit:** `pnpm build && pnpm lint && pnpm typecheck`

### 7a. PULL-REQUEST SCOPE RULES (HARD LIMIT)

Established by issue #14 after PR #8 (12,539 LoC across 6 features in
99 files) created an unreviewable closed loop where four AI agents
reviewed a fifth AI agent's code and a sixth Claude run "fixed" the
findings — no human-in-the-loop.

- **One feature per PR.** Six features = six PRs, opened independently.
- **≤ 1,500 LoC additions per PR.** If a slice exceeds this, stop and
  split. Diff stat `git diff --stat <base>..HEAD | tail -1` is the
  authoritative count.
- **PR opened BEFORE merge.** No fast-forward, no direct pushes to `main`.
- **Self-review is NOT sufficient** when the change touches:
  - Money flows (invoices, payments, refunds, WhatsApp sends)
  - Auth or RBAC
  - A new external API integration (paid or otherwise)
  - More than 500 LoC of net change
  - Any `supabase/migrations/` SQL
- For any of the above, a **human pass is required**, not an LLM pass.
  Bot reviews (CodeRabbit, Macroscope) are necessary but not sufficient
  signal.

### 7b. PRE-PR CHECKLIST

Run these gates before opening the PR, not after a reviewer asks:

- [ ] All quality gates pass (`pnpm typecheck && pnpm lint && pnpm test && pnpm build`)
- [ ] Diff scope: ≤ 1,500 LoC additions (or the split rationale is in the PR description)
- [ ] If touching `packages/services/src/orbital.service.ts` or any new
      direct-Supabase reads → RLS audit linked (issue #15 / `supabase/migrations/RLS-POLICIES.md`)
- [ ] If adding charts or large client-side libs → bundle-size delta
      measured (issue #16)
- [ ] If touching print routes or any `<ShippingLabel>` / `<InvoicePrintView>` → visual snapshot run (issue #17)
- [ ] If a new feature could need rollback → entry added to
      `docs/ROLLBACK-PLAYBOOK.md` (issue #18)
- [ ] PR description names the issue it closes + the test plan for
      manual verification

---

## 8. PER-PHASE QUALITY GATE

Every phase requires ALL of the following before proceeding:

- [ ] Types defined in `packages/types`
- [ ] Business logic in `packages/services`
- [ ] All imports from `@workspace/ui` only
- [ ] No hardcoded colors, fonts, spacing, or shadows
- [ ] No Tailwind color classes
- [ ] No icon imports except via `@workspace/ui/icons`
- [ ] No animation library other than `tw-animate-css`
- [ ] ESLint: `pnpm lint --max-warnings 0`
- [ ] TypeScript: zero errors (`pnpm typecheck`)
- [ ] Build: `pnpm build` succeeds
- [ ] Tests: all passing (`pnpm test`)
