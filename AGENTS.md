# AGENTS.md — TAC Express Agent Rules & Protocols

> **MANDATORY:** Read this file fully at the start of EVERY conversation before writing any code.
> **AUTHORITY:** This file + `DESIGN_SYSTEM.md` supersede all other instructions. There is now ONE consolidated rule set — no `PROJECT-RULES.md`, no `.agents/skills/`, no `.agent/`.
> **VERSION:** 8.1 — Consolidated single-system + GBrain enforcement layer (May 2026)

---

## 0. SKILL SYSTEM (consolidated single-system + GBrain enforcement)

This project uses **Claude Code Skills** at `.claude/skills/` ONLY. The legacy `.agents/skills/` and `.agent/` directories are archived under `.archive/` and no longer referenced.

> Pattern adopted from GBrain (https://github.com/garrytan/gbrain) — **thin harness, fat skills**.
> The skill files in `.claude/skills/` are the durable, executable artifacts; this section is the enforcement gate.

**Every task starts at the Skill Resolver:** [`.claude/skills/RESOLVER.md`](.claude/skills/RESOLVER.md). The resolver maps intent → skill. Cross-cutting **conventions** at [`.claude/skills/conventions/`](.claude/skills/conventions/) apply universally regardless of which specialist skill loaded.

### The four-step gate (every task, no exceptions)

1. **Read [`.claude/skills/RESOLVER.md`](./.claude/skills/RESOLVER.md)** — the intent → skill dispatch table. Match the user's request to a specialist skill (or two). The resolver is the truth, not your memory.
2. **Load the matched skill** via the Skill tool BEFORE writing code.
3. **Apply the cited cross-cutting conventions** from [`.claude/skills/conventions/`](./.claude/skills/conventions/):
   - `quality-gates.md` — the 5 must-pass commands
   - `architecture-flow.md` — UI → services → database (LAW 6/7/8)
   - `premium-ui-quality.md` — 10/10 rubric contract + banned patterns
   - `brain-first.md` — codebase + skills + memory FIRST
   - `test-before-bulk.md` — test on 1 before bulk
   - `subagent-routing.md` — Agent tool vs inline
   - `friction-protocol.md` — refusal format when asked to violate a law
4. **If you skipped step 1 or 2, the work is non-conforming.** Restart.

### Skillify loop (recurring fix → permanent skill)

If the same fix / pattern / question comes up 2+ times, load [`tac-skillify`](./.claude/skills/tac-skillify/SKILL.md) and turn it into a properly-skilled, tested, resolvable unit. The conformance checklist gates the work as "shipped." This is how feedback memories become enforced behavior instead of advice that drifts.

### Routing eval

Adding a new skill OR a new trigger phrase REQUIRES a corresponding line in [`.claude/skills/evals/routing.jsonl`](./.claude/skills/evals/routing.jsonl). The eval is what protects future resolver edits from silently breaking dispatch.

### Skillpack manifest

[`.claude/skills/MANIFEST.json`](./.claude/skills/MANIFEST.json) is the versioned skill bundle (current: `2.1.0`). It enumerates skills, conventions, evals, and the audit command (`pnpm audit:skills`).

### Quick-route table (see RESOLVER.md for the full one)

| Trigger | Skill | When |
|---------|-------|------|
| Session start | `tac-express-onboarding` | First skill every session |
| Every non-trivial task | `tac-karpathy-discipline` | Think → Simplify → Surgical → Goal |
| Law / forbidden-package question | `tac-fourteen-laws` | Whenever uncertain whether something is allowed |
| New feature / component | `tac-brainstorming` → `tac-tdd` → `tac-ui-authoring` → `tac-premium-patterns` | Before writing code |
| Premium UI surface | `tac-design-tokens` + `tac-premium-patterns` | Hero, KPI, marketing, dashboard panels |
| Score / audit / "is this 10/10?" | `tac-ui-rubric` | Pre-merge gate; ad-hoc scoring |
| Hover / animation / "feels static" | `tac-micro-interactions` | Any motion-related work |
| uipro / "Pro Max" / "67 styles" | `tac-uipro-bridge` FIRST, then `ui-ux-pro-max` | Filter forbidden styles |
| Auth / session / middleware | `tac-auth` | Any auth-related work |
| Writing components | `tac-ui-authoring` | Every UI task |
| Writing services / DB | `tac-data-layer` | Any data layer work |
| Schema / RLS / migration / RPC | `tac-supabase-schema` | Schema work |
| Domain (shipments/manifests/AWBs) | `tac-domain-logistics` | Logistics-domain tasks |
| Route handlers / API / webhooks | `tac-api-surface` | Boundary surfaces |
| Forms / validation / server actions | `tac-forms` | Any form |
| Test writing | `tac-tdd` | RED-GREEN-REFACTOR |
| Debugging | `tac-debug` | Any bug / failure / regression |
| Accessibility review | `tac-accessibility` | a11y / WCAG / keyboard / SR |
| Code review / pre-merge | `tac-code-review` + `tac-ui-rubric` (if UI) | Before merge |
| Recurring fix / "we keep doing X" / new skill | `tac-skillify` | Conformance audit |
| Cross-cutting rule (quality / architecture / brain-first / etc.) | `conventions/*.md` | See RESOLVER.md Disambiguation rules |

> **Skills are mandatory workflows, not suggestions.** The agent MUST invoke the relevant skill before proceeding with any task that matches its trigger. Skipping the resolver is explicitly non-conforming — restart the loop.

### Cross-cutting conventions (always apply)

| Convention | What it enforces |
|---|---|
| [`conventions/quality-gates.md`](.claude/skills/conventions/quality-gates.md) | The five must-pass commands before any commit (lint, typecheck, test, build, audit:all) |
| [`conventions/architecture-flow.md`](.claude/skills/conventions/architecture-flow.md) | UI → packages/services → packages/database → Supabase — no skipping |
| [`conventions/premium-ui-quality.md`](.claude/skills/conventions/premium-ui-quality.md) | 10/10 rubric contract + banned patterns + the 10 required qualities |
| [`conventions/brain-first.md`](.claude/skills/conventions/brain-first.md) | Check codebase + skills + memory BEFORE external lookups |
| [`conventions/test-before-bulk.md`](.claude/skills/conventions/test-before-bulk.md) | Test on 1 before any batch operation |
| [`conventions/subagent-routing.md`](.claude/skills/conventions/subagent-routing.md) | Native Agent tool vs inline work |
| [`conventions/friction-protocol.md`](.claude/skills/conventions/friction-protocol.md) | Response when asked to violate a law |

### Agent-side scaffolding scripts (PRs + CI watching)

Use `scripts/ci-watch-pr.mjs` for ALL CI watching. **Do NOT write inline `until [ "$(gh pr view ... mergeStateStatus)" != "UNSTABLE" ]; do sleep 30; done` bash loops** — that pattern silently reported stale-sha CLEAN states across PRs #118/#120/#121/#123 (closed as #122).

```bash
# Anchors on the PR's current headRefOid, polls mergeStateStatus,
# exits non-zero (code 2) when HEAD drifts mid-watch:
node scripts/ci-watch-pr.mjs <pr-number>

# Exit codes: 0 settled clean | 1 usage | 2 stale-sha (re-issue) | 3 gh-error | 4 timeout
# On code 2, the agent re-runs the same command — it re-anchors on the
# new HEAD automatically. No state-keeping required at the agent layer.
```

**Pipeline gotcha:** `node scripts/ci-watch-pr.mjs 124 | tail -20` MASKS the script's exit code — `tail`'s exit 0 wins and the agent's harness sees "exit code 0" even when the script actually exited 2 (stale). Caught on this script's very first dogfooding (PR #124's own watch). Either invoke without a pipe, or run with `set -o pipefail` if a pipe is genuinely needed for output truncation. The stderr message (`✗ STALE: PR HEAD drifted…`) still appears in the captured output regardless, so the agent can grep for `STALE` as a fallback signal when piped.

Sentinel: `apps/dashboard/__tests__/ci-watch-script.test.ts` pins the script's load-bearing behavior (initial sha anchor, per-poll drift check, exit-code 2 contract). A future refactor that strips the drift detection fails this test.

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

### Single shell — `/ops-console/*` only

There is exactly one authenticated shell: `app/ops-console/`. The legacy v6 `(dashboard)` route group was deleted in the May 2026 single-shell migration; legacy `/foo` URLs are caught by `next.config.mjs` 308 redirects to `/ops-console/foo`. Auth gating + rate limiting live in `apps/dashboard/proxy.ts` (the Next.js 16 file convention — the older `middleware.ts` name is deprecated; do not reintroduce it). Internal nav must point at `/ops-console/*` paths; the redirects are bookmark-compat only, not an active routing path.

### Shared Sidebar — themed via CSS scope, not props

Primary navigation lives in `packages/ui/src/components/composed/sidebar/` (single `<Sidebar>` + `nav-config.ts`). Chrome is selected by CSS scope — the `.ops-console` class on `OpsShell` rebinds `--sidebar-*` to `--paper-*` in `globals.css`. Do not add a `theme`/`shell` prop or fork the component — VRT baseline `sidebar-paper-ops.png` (`e2e/visual.spec.ts`) locks the contract.

### shadcn workflow (mandatory)

Single source of truth for shadcn config is `packages/ui/components.json`. shadcn CLI is pinned at `4.7.0` in `packages/ui/package.json` and in `.mcp.json`. **Never** install shadcn at the workspace root. **Never** reintroduce `apps/*/components.json`.

| Task | Command |
|---|---|
| Install a new primitive from the @tac registry (TAC-compliant, zero post-processing) | `pnpm --filter @workspace/ui exec shadcn add @tac/<name>` |
| Install a primitive from upstream shadcn (raw output — must be filtered through `tac-ui-authoring`) | `pnpm --filter @workspace/ui exec shadcn add <name>` |
| Update the @tac registry after editing a source primitive | `pnpm --filter @workspace/ui registry:build` |
| Verify the @tac registry is in sync (CI gate) | `pnpm --filter @workspace/ui registry:check` |
| Inspect the current shadcn 4.7.0 source for a primitive | `pnpm --filter @workspace/ui exec shadcn view <name>` |
| Run the page-level VRT baseline (Sprint 0 anchor) | `pnpm --filter dashboard exec playwright test e2e/visual/baseline.spec.ts` |

**Five mandatory checks before any commit that touches `packages/ui/`** (CI gates them all):

1. `pnpm typecheck` ✓
2. `pnpm lint` ✓ (no new TAC LAW warnings)
3. `pnpm audit:governance` ✓ (LAW 2 + LAW 8 + design-system specifics)
4. `pnpm --filter @workspace/ui registry:check` ✓ (no drift between source and @tac registry)
5. `pnpm --filter dashboard exec playwright test e2e/visual/baseline.spec.ts` ✓ (0 pixel diff against baseline, or explicit re-baseline in same PR)

### Primitive upgrade policy

Per `docs/primitive-upgrade-audit.md`, TAC's primitives already exceed the shadcn 4.7.0 base in design intent (brutalist offset shadows, premium focus bloom, paper-scope portal content, glow variant). **Do not blindly swap to a newer shadcn output** — verbatim adoption regresses visuals.

Upgrades follow this decision tree:
1. **Run `shadcn view <name>`** — see what shadcn 4.7.0 emits.
2. **Diff against `packages/ui/src/components/[...].tsx`** — identify the delta.
3. **For each delta, classify as KEEP / ADOPT / FALSE-POSITIVE**, using `docs/primitive-upgrade-audit.md` precedents.
4. **Apply only ADOPT deltas** — preferentially the ones marked "additive" (new size variants, new data attributes, new patterns that don't change existing visuals).
5. **Run all five mandatory checks**, including VRT.

The full multi-sprint plan lives in the PM-issued upgrade brief; the policy above is the durable rule the agent follows on every primitive-touching PR.

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
- [ ] Governance: `pnpm tsx scripts/audit-skills.ts` passes when `.md` governance files or skills changed

---

## 9. VERSION CORRECTIONS (history — useful when reading old files / PRs)

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
| Shadow | soft drop shadows | **2px / 4px brutalist offset shadows only** |
| Primary color | cyan/orange (Wasteland), indigo (Orbital) | **violet** `oklch(0.5393 0.2713 286.7462)` |
| Font source | `packages/ui/fonts.ts` | `apps/web/app/layout.tsx` AND `apps/dashboard/app/layout.tsx` |
| Component location | `apps/web/components/` | `packages/ui/src/components/` ONLY |
| Glassmorphism | Velox Glass 2.0 | **None — solid surfaces, 1px borders** |
| Skill location | `.agents/skills/`, `.agent/skills/` | **`.claude/skills/` ONLY** (May 2026 consolidation) |
| Rule files | `AGENTS.md` + `PROJECT-RULES.md` (split) | **`AGENTS.md` only** (May 2026 consolidation) |

---

## 10. FILE NAMING CONVENTIONS

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

## 11. APPROVED FUTURE PACKAGES (Phase-Gated)

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

> Any package not on this list, or on the forbidden list in § 4, requires a `tac-brainstorming` design approval before install.

---

## 12. MONOREPO RULES (consolidated from former PROJECT-RULES.md)

- **Root commands only:** `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test` — run from `c:\tac\tac-express`
- **Package install location:**
  - UI primitives → `packages/ui`
  - Data fetching → `packages/database` or `packages/services`
  - App-specific → `apps/web` or `apps/dashboard` (only if truly app-specific)
  - Types → `packages/types`
- **Never install** in `packages/ui` what belongs in `packages/services`
- **Never cross-import** between `apps/web` ↔ `apps/dashboard`
