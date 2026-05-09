# TAC Express Skill Resolver

> **Read this BEFORE any task.** This is the dispatcher; skills are the implementation.
> Adopted from the GBrain RESOLVER pattern (https://github.com/garrytan/gbrain).
>
> **Rule of two:** if two skills could match, read both before acting.
> **Chain rule:** the skill's own *Phases* section dictates downstream chaining
> (e.g., `tac-brainstorming → tac-tdd → tac-ui-authoring`).

---

## Always-on (every message)

| Trigger | Skill | Why |
|---|---|---|
| Session start, any first message | `tac-express-onboarding` | 60-second project orientation — load FIRST |
| Any non-trivial implementation | `tac-karpathy-discipline` | Think → Simplify → Surgical → Goal |
| Any code change, install, lint deviation | `tac-fourteen-laws` | Authoritative violation patterns + fixes |
| Any conventions question | `conventions/` (this folder) | Cross-cutting rules every skill defers to |

---

## Cross-cutting conventions (apply to ALL task skills)

| Rule | File |
|---|---|
| The 5 must-pass commands before commit | `conventions/quality-gates.md` |
| UI → services → database flow (LAW 6/7/8) | `conventions/architecture-flow.md` |
| Check skills/code/memory BEFORE external lookups | `conventions/brain-first.md` |
| Test on 1 before bulk operations | `conventions/test-before-bulk.md` |
| Native Agent tool vs inline work | `conventions/subagent-routing.md` |
| Response when asked to violate a law | `conventions/friction-protocol.md` |

---

## Feature & UI work

| Trigger | Skill |
|---|---|
| "New feature", "let's add", "build a …", spec-level ask | `tac-brainstorming` (produce written spec FIRST) |
| "Component", "page", "view", "modal", "card", "form layout" | `tac-ui-authoring` |
| "Hero", "landing", "marketing surface", "KPI card", "premium feel" | `tac-design-tokens` |
| "Form", "validation", "react-hook-form", "zod", "server action" | `tac-forms` |
| "Accessible", "a11y", "keyboard nav", "screen reader", "WCAG" | `tac-accessibility` |

## Data, services, API

| Trigger | Skill |
|---|---|
| "Service", "hook", "fetch data", "useQuery", business logic | `tac-data-layer` |
| "Route handler", "server action", "API endpoint", "edge function", "webhook" | `tac-api-surface` |
| "Migration", "RLS", "policy", "RPC", "trigger", "regenerate types" | `tac-supabase-schema` |
| "Auth", "session", "middleware", "RBAC", "sign-in", "sign-out" | `tac-auth` |

## Domain (logistics)

| Trigger | Skill |
|---|---|
| "Shipment", "AWB", "manifest", "exception", "hub scan", "rate card" | `tac-domain-logistics` |
| "Customer", "invoice", "COD", "WhatsApp send", "payment" | `tac-domain-logistics` (financial section) |

## Testing & debug

| Trigger | Skill |
|---|---|
| "Write a test", "TDD", "RED → GREEN", "playwright", "vitest" | `tac-tdd` |
| "Bug", "broken", "fails", "unexpected", "investigate", "regression" | `tac-debug` (root-cause first, NO guessing) |

## Review & quality

| Trigger | Skill |
|---|---|
| Pre-merge, post-feature, "review this" | `tac-code-review` |
| "Audit accessibility", design check | `tac-accessibility` (chain into `tac-code-review`) |

## Meta (skill of skills)

| Trigger | Skill |
|---|---|
| "Skillify this", "make this proper", "is this a skill?", recurring fix | `tac-skillify` (11-item conformance audit) |
| "Create a skill", "new skill" | `tac-skillify` (Phase 2: scaffold) |
| "Routing test", "is this skill reachable?", "MECE check" | `tac-skillify` (Phase 5: check-resolvable) |

---

## Disambiguation rules

When multiple skills could match:

1. **Most specific wins.** `tac-domain-logistics` over `tac-data-layer` if the task names a shipment/AWB/manifest. `tac-design-tokens` over `tac-ui-authoring` if the task is a premium hero/KPI surface.
2. **Boundary-crossing wins higher in the stack.** A "form that POSTs to a route handler" loads BOTH `tac-forms` AND `tac-api-surface`. Don't skip the boundary.
3. **Bug + UI → debug first.** If "the dropdown doesn't close" — load `tac-debug` BEFORE `tac-ui-authoring`. Find the cause, then choose the fix surface.
4. **Schema change cascades.** Any `supabase/migrations/` edit triggers: `tac-supabase-schema` → `tac-tdd` → regenerate types → `tac-code-review`.
5. **When in doubt, ask the user** — don't guess across boundaries.

---

## Routing eval

This dispatcher is verified by `evals/routing.jsonl`. Each entry maps a real
user trigger phrase to the expected skill(s). Adding a new skill REQUIRES a
new entry in that file. See `evals/README.md`.

---

## Brain-filing rules (where files go)

TAC Express version of GBrain's `_brain-filing-rules.md`:

| Content | Goes in | NOT in |
|---|---|---|
| UI component | `packages/ui/src/components/{primitives,composed}/` | `apps/*/components/` (LAW 5) |
| Business logic | `packages/services/src/<domain>.service.ts` | components (LAW 7) |
| `@supabase/*` import | `packages/database/src/` only | anywhere else (LAW 8) |
| Auth helpers | `packages/auth/` | components |
| Branded types, zod schemas | `packages/types/` | inline in apps |
| Migrations / RLS / RPC | `supabase/migrations/` (versioned) | edge functions |
| Edge functions | `supabase/functions/<slug>/` | api routes |
| Skill (this layer) | `.claude/skills/<slug>/SKILL.md` | docs/ |
| Routing test | `.claude/skills/evals/routing.jsonl` | scattered test files |

---

## How to use this file

1. The user sends a message.
2. Match the phrase against the tables above.
3. Read the matched SKILL.md (and the conventions/ files it cites).
4. Only after the skill is loaded, write code.
5. If you skipped this, the work is non-conforming. Restart the loop.
