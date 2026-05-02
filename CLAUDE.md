# CLAUDE.md — TAC Express Claude Agent Instructions

> This file is the Claude Code / Claude API specific companion to `AGENTS.md`.
> **MANDATORY:** Read both `AGENTS.md` AND this file before any task.
> **VERSION:** 5.0 — TAC Express v5.0 Violet Grid (May 2026)

---

## 0. AUTHORITY CHAIN

```
CLAUDE.md (this file)
  ↓ defers to
AGENTS.md (master rules)
  ↓ defers to
PROJECT-RULES.md (enforcement)
  ↓ defers to
DESIGN_SYSTEM.md (visual spec)
```

All files are co-equal on hard violations. When in conflict, be MORE restrictive, not less.

---

## 1. CLAUDE-SPECIFIC WORKFLOW

### Before ANY Task
1. Claude Code should natively read `.claude/skills/` via progressive disclosure.
2. If the skill is not automatically loaded, manually load the `tac-express-onboarding` skill from `.claude/skills/` first.
3. If a required skill isn't in `.claude/skills/`, fallback to `.agents/skills/`.
4. Identify which specialist skill applies to this task.
5. **NEVER write a single line of code without first invoking the relevant skill.**

### Task Classification

| Task Type | Required Skill | Gate |
|-----------|---------------|------|
| **Every session** | `tac-express-onboarding` | Load FIRST |
| Any non-trivial task | `tac-karpathy-discipline` | Think → Simplify → Surgical → Goal |
| Law / forbidden-package question | `tac-fourteen-laws` | Authoritative violation patterns + fixes |
| New feature / component | `tac-brainstorming` → `tac-tdd` → `tac-ui-authoring` | Design approval required |
| Premium UI surface (hero, KPI, marketing) | `tac-design-tokens` | Token-compliant motion + type + gradient |
| Auth / session / middleware / RBAC | `tac-auth` | Supabase pattern compliance |
| Forms / validation / server actions | `tac-forms` | react-hook-form + zod resolver pattern |
| Route handlers / public API / webhooks / edge funcs | `tac-api-surface` | Boundary validation + rate-limit + signing |
| Bug fix | `tac-debug` → `tac-tdd` | Root cause identified before fix |
| Refactor | `tac-code-review` → `tac-tdd` | Tests green before and after |
| UI component | `tac-ui-authoring` | Token compliance |
| Data / service layer | `tac-data-layer` | Architecture flow respected |
| Schema / RLS / migrations / RPC | `tac-supabase-schema` | RLS by role + SECURITY DEFINER patterns |
| Domain (shipments / manifests / AWBs) | `tac-domain-logistics` | Status lifecycles + branded types |
| Accessibility review | `tac-accessibility` | WCAG 2.1 AA |
| Pre-merge | `tac-code-review` | All quality gates pass |

---

## 2. RESPONSE FORMAT (CLAUDE-SPECIFIC)

### Standard Mode
1. **Rationale** (1 sentence — why this approach)
2. **The code** (with semantic tokens, typed, tested)
3. **Verification** (how to confirm it works)

### ULTRATHINK Mode (triggered by keyword)
1. **Deep Reasoning Chain** — architectural and design decisions
2. **Law Compliance Check** — explicit verification of all 14 laws
3. **Edge Case Analysis** — failure modes and prevention
4. **The Code** — optimized, production-ready
5. **Test Strategy** — TDD steps to verify

---

## 3. FORBIDDEN ACTIONS (HARD STOPS)

Claude MUST refuse or pause and ask when:
- Asked to install a forbidden package
- Asked to put UI components in `apps/web/` directly
- Asked to use raw Tailwind color classes
- Asked to skip tests "just this once"
- Asked to call Supabase directly from a component
- Asked to use `npm install` or `yarn add`
- Asked to commit directly to `main`
- Asked to hardcode any pixel value, color, or font
- Asked to use curved lines, rounded-full, or wavy SVG paths
- Asked to rebuild a shadcn primitive from scratch

**Response when blocked:**
> "I can't do that — it violates [LAW X] from AGENTS.md. Here's the compliant approach: [alternative]"

---

## 4. QUICK REFERENCE

```
MONOREPO ROOT:  c:\tac\tac-express
PACKAGE MGR:    pnpm only
UI PACKAGE:     @workspace/ui (packages/ui/src/)
ICONS:          @remixicon/react via @workspace/ui/icons
STYLES:         packages/ui/src/styles/globals.css (tokens only)
SERVICES:       packages/services/
AUTH:           packages/auth/ (@workspace/auth — signIn/signOut/getSession)
DATABASE:       packages/database/ (never direct Supabase in apps/)
TYPES:          packages/types/
APPS:           apps/web/ (landing) | apps/dashboard/ (logistics)
NEXT VERSION:   16.x (Turbopack)
DESIGN:         TAC Express v5.0 — Violet Grid (dark-first, violet signal, brutalist offset shadows)
FONTS:          Plus Jakarta Sans (sans/UI) | IBM Plex Mono (data) | Lora (serif/prose)
RADIUS:         0rem — zero radius, sharp corners
SHADOWS:        shadow-2xs..shadow-2xl resolve to brutalist offsets (1px..16px on var(--border))
                aliases: --shadow-brutal-sm = shadow-sm (3px) | --shadow-brutal = shadow-md (6px)
TYPE SCALE:     .t-display / .t-h1..h4 / .t-data / .t-overline / .t-mono — premium scale in globals.css
MOTION:         --duration-fast (80ms) | --duration-base (150ms) | --duration-slow (300ms)
                --ease-smooth | --ease-spring | --ease-linear (mission-control default)
TESTING:        Vitest (unit) | Playwright (E2E)
GIT FLOW:       feature branches → PR → CI → merge
```
