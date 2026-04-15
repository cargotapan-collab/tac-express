# CLAUDE.md — TAC Express Claude Agent Instructions

> This file is the Claude Code / Claude API specific companion to `AGENTS.md`.
> **MANDATORY:** Read both `AGENTS.md` AND this file before any task.
> **VERSION:** 1.0 — Claude Code Edition (2026)

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
1. Re-read `AGENTS.md` section 0 (SKILL SYSTEM)
2. Identify which skill applies to this task
3. If multiple skills apply, start with the highest-order one (brainstorming > tdd > ui-authoring)
4. **NEVER write a single line of code without first invoking the relevant skill**

### Task Classification (Claude must self-classify before acting)

| Task Type | Required Skill | Gate |
|-----------|---------------|------|
| New feature / component | `tac-brainstorming` → `tac-tdd` → `tac-ui-authoring` | Design approval required |
| Bug fix | `tac-debug` → `tac-tdd` | Root cause identified before fix |
| Refactor | `tac-code-review` → `tac-tdd` | Tests green before and after |
| UI component | `tac-ui-authoring` | ZNG token compliance |
| Data/service layer | `tac-data-layer` | Architecture flow respected |
| Pre-merge | `tac-code-review` | All quality gates pass |

---

## 2. SUBAGENT DISPATCH PROTOCOL

When using Claude Code's subagent/Task tool:

### Implementer Subagent Prompt Template
```
You are implementing: [TASK_NAME]

Context: [PROJECT_CONTEXT]
Plan: [FULL_TASK_TEXT_FROM_PLAN]
Branch: [GIT_BRANCH]

Rules (MANDATORY):
- Read AGENTS.md before writing code
- Follow ZNG design tokens exclusively
- No forbidden packages (see PROJECT-RULES.md)
- Architecture: UI → packages/services → packages/database → Supabase
- TDD: write failing test FIRST, then implement

Report back with status: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
```

### Reviewer Subagent Prompt Template
```
You are reviewing commits [BASE_SHA]..[HEAD_SHA]

Review against: [SPEC_OR_REQUIREMENTS]

Check in this order:
1. SPEC COMPLIANCE: Does the code do exactly what the spec says? No more, no less?
2. LAWS COMPLIANCE: All 12 laws from AGENTS.md respected?
3. CODE QUALITY: Clean, typed, tested, no hardcoded values?

Report: ✅ APPROVED | ❌ ISSUES FOUND (list by severity: Critical / Important / Minor)
```

---

## 3. MEMORY & CONTEXT MANAGEMENT

- **Session start:** Always re-read `AGENTS.md` and check `.agent/gsd-file-manifest.json` for current project state
- **Context drift:** If mid-session context becomes unclear, re-read the relevant skill SKILL.md
- **Long sessions:** After 50+ tool calls, summarize progress to `docs/session-notes/YYYY-MM-DD.md`
- **Never assume** — if a file path, package name, or API is uncertain, verify with file tools first

---

## 4. TOOL USAGE DISCIPLINE

### Read Before Edit (ALWAYS)
```
read_file → verify content → edit → verify change
```
Never edit without reading first. Never assume file state from memory.

### Batch Independent Operations
```
✅ read_file(A) + read_file(B) + read_file(C)   ← parallel
✅ edit(A) → verify → edit(B)                   ← sequential (dependent)
❌ edit(A) + edit(B) simultaneously             ← NEVER if B depends on A
```

### Search Before Create
```
grep_search / find_by_name → confirm not exists → write_to_file
```
Never create duplicates. Never overwrite without reading first.

---

## 5. RESPONSE FORMAT (CLAUDE-SPECIFIC)

### Standard Mode
1. **Rationale** (1 sentence — why this approach)
2. **The code** (with ZNG tokens, typed, tested)
3. **Verification** (how to confirm it works)

### ULTRATHINK Mode (triggered by keyword)
1. **Deep Reasoning Chain** — architectural and design decisions
2. **Law Compliance Check** — explicit verification of all 12 laws
3. **Edge Case Analysis** — failure modes and prevention
4. **The Code** — optimized, production-ready
5. **Test Strategy** — TDD steps to verify

---

## 6. FORBIDDEN ACTIONS (HARD STOPS)

Claude MUST refuse or pause and ask when:
- Asked to install a forbidden package
- Asked to put UI components in `apps/web/` directly
- Asked to use raw Tailwind color classes
- Asked to skip tests "just this once"
- Asked to call Supabase directly from a component
- Asked to use `npm install` or `yarn add`
- Asked to commit directly to `main`
- Asked to hardcode any pixel value, color, or font

**Response when blocked:**
> "I can't do that — it violates [LAW X] from AGENTS.md. Here's the compliant approach: [alternative]"

---

## 7. QUICK REFERENCE

```
MONOREPO ROOT:  c:\tac\tac-express
PACKAGE MGR:    pnpm only
UI PACKAGE:     @workspace/ui (packages/ui/src/)
ICONS:          @remixicon/react via @workspace/ui/icons
STYLES:         packages/ui/src/styles/globals.css (tokens only)
SERVICES:       packages/services/
DATABASE:       packages/database/ (never direct Supabase in apps/)
TYPES:          packages/types/
APPS:           apps/web/ (landing) | apps/dashboard/ (logistics)
NEXT VERSION:   16.x (Turbopack)
DESIGN:         ZNG (Zen/Neo-Glass) — dark only, glass morphism
TESTING:        Vitest (unit) | Playwright (E2E)
GIT FLOW:       feature branches → PR → CI → merge
```
