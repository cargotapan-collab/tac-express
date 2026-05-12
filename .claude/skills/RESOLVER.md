# TAC Express — Skill Resolver

> **MANDATORY ENTRY POINT.** Every task begins here. Map the user's intent to the right specialist skill before writing a line of code. Skipping the resolver = non-conforming; restart the loop.
>
> **Version:** 2.0 — consolidated single-system (May 2026)
> **Authority chain:** `CLAUDE.md` → `AGENTS.md` → `DESIGN_SYSTEM.md` → this resolver → `conventions/` (cross-cutting rules)

---

## 0. How to use this file

1. Read the user's request.
2. Match it against the **Intent → Skill** table below.
3. Load the matched skill via the Skill tool.
4. Apply the cross-cutting **conventions** (always, regardless of which skill).
5. Execute. Cite the loaded skill if challenged.

If no row matches, fall through to **§ 99 Defaults** — but flag the gap and consider whether a new skill should be created via `tac-skillify`.

---

## 1. Intent → Skill (the dispatch table)

### Session-level

| Trigger | Load |
|---|---|
| Session start, any new task | [`tac-express-onboarding`](tac-express-onboarding/SKILL.md) **FIRST** |
| "Wait, what's the design system again?" | [`tac-design-tokens`](tac-design-tokens/SKILL.md) |
| Anything non-trivial | [`tac-karpathy-discipline`](tac-karpathy-discipline/SKILL.md) (always — Think → Simplify → Surgical → Goal) |

### UI / UX

| Trigger phrase | Load |
|---|---|
| "Build a component", "add a [button/card/form/table]" | [`tac-ui-authoring`](tac-ui-authoring/SKILL.md) |
| "Build a hero", "KPI dashboard", "polish this section" | [`tac-premium-patterns`](tac-premium-patterns/SKILL.md) |
| "Add hover", "animate this", "feels static", "polish the interaction" | [`tac-micro-interactions`](tac-micro-interactions/SKILL.md) |
| "Token reference", "design tokens", "premium feel" | [`tac-design-tokens`](tac-design-tokens/SKILL.md) |
| "Is this 10/10?", "score this", "audit this page" | [`tac-ui-rubric`](tac-ui-rubric/SKILL.md) |
| Anything mentioning **uipro**, "Pro Max", "67 styles", "96 palettes" | [`tac-uipro-bridge`](tac-uipro-bridge/SKILL.md) **FIRST**, then `ui-ux-pro-max` |
| "Audit a11y", "keyboard navigation", "screen reader" | [`tac-accessibility`](tac-accessibility/SKILL.md) |

### Architecture / Domain

| Trigger | Load |
|---|---|
| "Add a service", "fetch from DB", "hook for X" | [`tac-data-layer`](tac-data-layer/SKILL.md) |
| Schema / RLS / migration / RPC | [`tac-supabase-schema`](tac-supabase-schema/SKILL.md) |
| Shipments / manifests / AWBs / hubs / rate cards | [`tac-domain-logistics`](tac-domain-logistics/SKILL.md) |
| Route handler / public API / webhook / edge function / rate-limit | [`tac-api-surface`](tac-api-surface/SKILL.md) |
| Auth / session / middleware / RBAC | [`tac-auth`](tac-auth/SKILL.md) |
| Forms / validation / server actions | [`tac-forms`](tac-forms/SKILL.md) |

### Process / Quality

| Trigger | Load |
|---|---|
| New feature / new component design | [`tac-brainstorming`](tac-brainstorming/SKILL.md) → produce a spec FIRST |
| Test writing (unit, integration, E2E) | [`tac-tdd`](tac-tdd/SKILL.md) (RED → GREEN → REFACTOR) |
| Bug / failure / unexpected behaviour | [`tac-debug`](tac-debug/SKILL.md) — root cause first, never guess |
| Pre-merge, post-feature | [`tac-code-review`](tac-code-review/SKILL.md) + [`tac-ui-rubric`](tac-ui-rubric/SKILL.md) (if UI changed) |
| "Is this allowed?" / forbidden-package question / LAW lookup | [`tac-fourteen-laws`](tac-fourteen-laws/SKILL.md) |

### Meta

| Trigger | Load |
|---|---|
| "We keep doing X" / the same fix lands twice | Promote to a permanent skill (see § 3 below) |

---

## 2. Cross-cutting conventions (ALWAYS apply, regardless of which skill loaded)

Every task — regardless of which specialist skill was loaded — must honor:

| Convention | File |
|---|---|
| **Quality gates** — five must-pass commands before any commit | [`conventions/quality-gates.md`](conventions/quality-gates.md) |
| **Architecture flow** — UI → services → database → Supabase, no skipping | [`conventions/architecture-flow.md`](conventions/architecture-flow.md) |
| **Premium UI quality** — anti-template, anti-AI-slop checklist | [`conventions/premium-ui-quality.md`](conventions/premium-ui-quality.md) |

These conventions are short, prescriptive, and never optional. They are the load-bearing constraints that make the specialist skills predictable.

---

## 3. When a new skill is needed (the skillify trigger)

If during a task you realize:
- The same correction has been needed twice or more across sessions, OR
- The current skills don't cover this intent cleanly, OR
- The user said "we keep doing X" or "we've discussed this before",

**stop** and create a new skill:

1. Choose a `tac-<topic>` name, kebab-case, ≤ 20 chars.
2. Create `.claude/skills/tac-<topic>/SKILL.md` with frontmatter (`name`, `description`).
3. Add a row to § 1 of this resolver.
4. Add an entry to `MANIFEST.json` (`skills` array).
5. Update `CLAUDE.md` § 1 Task Classification table.

Single atomic commit: `chore(skills): add tac-<topic> + resolver + manifest`.

---

## 99. Defaults (when nothing matches)

In order of precedence:

1. Load [`tac-fourteen-laws`](tac-fourteen-laws/SKILL.md) — to know what's allowed.
2. Load [`tac-karpathy-discipline`](tac-karpathy-discipline/SKILL.md) — to keep the change surgical.
3. If the task touches UI, also load [`tac-ui-authoring`](tac-ui-authoring/SKILL.md) + [`tac-design-tokens`](tac-design-tokens/SKILL.md).
4. Proceed — and flag in the response that the resolver had no exact match, so we can add a routing row next.
