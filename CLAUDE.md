# CLAUDE.md — TAC Express Claude Agent Instructions

> This file is the Claude Code / Claude API specific companion to `AGENTS.md`.
> **MANDATORY:** Read both `AGENTS.md` AND this file before any task.
> **VERSION:** 5.1 — TAC Express v5.0 Violet Grid + GBrain enforcement layer (May 2026)

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
  ↓ dispatches via
.claude/skills/RESOLVER.md  (intent → skill dispatcher, GBrain pattern)
  ↓ enforces
.claude/skills/conventions/* (cross-cutting rules)
```

All files are co-equal on hard violations. When in conflict, be MORE restrictive, not less.

---

## 0.5. GBRAIN ENFORCEMENT (MANDATORY ON EVERY TASK)

> Adopted from GBrain (https://github.com/garrytan/gbrain) — **thin harness, fat skills**.
> The skill files are the durable artifacts; this section is the enforcement gate.

**Every task — no exceptions, no "just this once":**

1. **Read [`.claude/skills/RESOLVER.md`](.claude/skills/RESOLVER.md)** to dispatch the
   user's intent to the correct specialist skill. The resolver IS the routing table.
2. **Load the matched skill** via the Skill tool BEFORE writing any code.
3. **Apply the cited conventions** in [`.claude/skills/conventions/`](.claude/skills/conventions/):
   - `quality-gates.md` — the 5 must-pass commands before commit
   - `architecture-flow.md` — UI → services → database (LAW 6/7/8)
   - `brain-first.md` — check codebase + skills + memory BEFORE external lookup
   - `test-before-bulk.md` — test on 1 before bulk
   - `subagent-routing.md` — Agent tool vs inline
   - `friction-protocol.md` — refusal format when asked to violate a law
4. **If you add a new skill or trigger phrase** → add a line to
   [`.claude/skills/evals/routing.jsonl`](.claude/skills/evals/routing.jsonl).
   PRs that add skills without the routing-eval line are non-conforming.
5. **If the user keeps asking for the same fix 2+ times → load `tac-skillify`**
   and turn the recurring pattern into a permanent skill. This is the
   **skillify loop** — feedback becomes enforced behavior, not advice that drifts.

**Authority:** [`.claude/skills/MANIFEST.json`](.claude/skills/MANIFEST.json) is the
versioned skillpack manifest (current version: `1.0.0`).

> If a task starts and you have not consulted RESOLVER.md, the task is non-conforming.
> Restart from step 1.

---

## 1. CLAUDE-SPECIFIC WORKFLOW

### Before ANY Task
1. Claude Code natively reads `.claude/skills/` via progressive disclosure.
2. **Open [`.claude/skills/RESOLVER.md`](.claude/skills/RESOLVER.md)** — that is the
   single dispatch table. Match the user's intent to a skill (or two).
3. If the skill description in the available-skills list isn't enough, load it via
   the Skill tool FIRST. Onboarding (`tac-express-onboarding`) loads first every session.
4. If a required skill isn't in `.claude/skills/`, fallback to `.agents/skills/`.
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
| Recurring fix / "we keep doing X" / new skill | `tac-skillify` | 10-item conformance audit (RESOLVER + eval + tests) |
| Cross-cutting rule (quality / architecture / brain-first / etc.) | `conventions/*.md` | See `RESOLVER.md` Disambiguation rules |

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
