# TAC Express — Agentic Development Workflow
**Version 1.0 · May 2026**  
*Synthesized from Boris Cherny's 6 Principles + Claude Code best practices + TAC Orbital constraints*

---

## Philosophy

This workflow exists because of one observation: the difference between a team shipping 5 PRs/week and one shipping 30 is not talent — it's the **structure built around the AI before execution begins**. Anthropic's own internal data shows unguided attempts succeed ~33% of the time. Structured attempts land near 100%. This document is that structure for TAC Express.

Every decision below is motivated by one of three forces: **Boris's principles** (remove friction between intent and execution), **TAC Orbital laws** (non-negotiable design and architecture constraints), or **Claude Code's current best practices** (what actually works in a pnpm/Turborepo monorepo in 2026).

---

## Part 1 — Repository Context Architecture

### 1.1 The CLAUDE.md Hierarchy

Claude Code reads `CLAUDE.md` files from the current directory and all parent directories simultaneously. In TAC's monorepo, this means you should layer context intentionally rather than dumping everything into one file.

The goal is to keep the root `CLAUDE.md` under ~100 lines (Boris Cherny's own team's file is ~2,500 tokens). Details live in scoped files that are lazy-loaded via `@` imports only when Claude touches matching files.

**Root `/CLAUDE.md`** — Project identity, package manager law, and pointers:

```markdown
# TAC Express — Mission Control Monorepo

## Identity
TAC Orbital design system. Brutalist, dark-first. Zero glassmorphism, zero curves.
All UI components live in `packages/ui/src/components/`. Never in `apps/`.
Package manager: pnpm ONLY. Never npm or yarn.

## Architecture
@docs/architecture.md
@packages/ui/CLAUDE.md
@packages/services/CLAUDE.md

## Commands
- Dev: `pnpm dev`
- Build: `pnpm build` (Turborepo)
- Lint: `pnpm lint --filter <package>`
- Add dep: `pnpm add <pkg> --filter <workspace>`
- Test: `pnpm test`

## Non-Negotiable Laws
1. TailwindCSS v4 — semantic CSS variables only. No color classes, no arbitrary values.
2. Icons: @remixicon/react only. No Lucide.
3. Animation: motion/react only.
4. Radius: 0.125rem everywhere. No exceptions.
5. Zero business logic inside UI components. Route through packages/services.
6. Always use shadcn primitives — never rebuild from scratch.

## Before Any Task
Read AGENTS.md. Check .agents/skills/ for the relevant workflow.
```

**`packages/ui/CLAUDE.md`** — Loaded only when Claude touches the UI package:

```markdown
# packages/ui — TAC Orbital Component Library

## Component Rules
- Output path: packages/ui/src/components/<ComponentName>/index.tsx
- Always co-locate: index.tsx, <Name>.stories.tsx, <Name>.test.tsx
- Styles: CSS variables from packages/ui/src/styles/globals.css only
- shadcn primitives first — extend, never rebuild

## CSS Variable Reference
All semantic tokens are in packages/ui/src/styles/globals.css.
Do NOT invent new color values. Do NOT use Tailwind color utilities.

## Component Checklist
Before marking complete, verify:
- [ ] No Tailwind color classes (bg-blue-500 etc.)
- [ ] No arbitrary values (w-[347px] etc.)
- [ ] No Lucide icons
- [ ] motion/react used for any animation
- [ ] Exports updated in packages/ui/src/index.ts
```

**`packages/services/CLAUDE.md`** — Loaded only when Claude touches services:

```markdown
# packages/services — Data & Business Logic

## Rules
- All database calls originate here. Never in UI components.
- All API integrations live here.
- Export typed service functions only — no raw fetch calls exposed to consumers.
- Zero UI imports inside this package.
```

### 1.2 Lazy-Loaded Rules via `.claude/rules/`

For rules that only apply when Claude touches specific files, use path-scoped rules instead of bloating `CLAUDE.md`. Create `.claude/rules/tailwind.md` with `paths: ["**/*.tsx", "**/*.css"]` in YAML frontmatter. Claude only loads it when it's touching those files. This keeps your main context lean on every session.

---

## Part 2 — The Core Inner Loop (Feature Development)

This is the workflow you run on every non-trivial task. It implements the **Explore → Plan → Implement → Verify** loop that Anthropic's testing shows dramatically improves success rates.

### Phase 0 — Task Definition (You)

Before touching Claude Code, write a one-paragraph task brief. Include: what you're building, which package it lives in, any relevant CSS variables or existing components it should use, and what "done" looks like. Vague prompts produce vague output.

**Template:**
```
Build a [ComponentName] component in packages/ui/src/components/.
It should [behavior description].
It consumes data from [service function] in packages/services.
Design tokens to use: [list CSS variables].
Done = [concrete acceptance criteria].
```

### Phase 1 — Explore (Claude)

Before writing any code, instruct Claude to explore without implementing:

```
Explore the codebase and answer these before touching any file:
1. Which existing components in packages/ui could be composed or extended here?
2. Which CSS variables in globals.css are relevant?
3. Does a service function for this data already exist in packages/services?
4. Are there any existing shadcn primitives I should build on?
Do NOT write any code yet. Report findings only.
```

This single step eliminates the most common failure mode: Claude reinventing things that already exist, or placing components in the wrong package.

### Phase 2 — Plan (Human-Reviewed)

After Claude's exploration report, ask for a plan:

```
Based on your findings, draft a detailed implementation plan.
Include: file paths to create/edit, component structure, which shadcn 
primitives to extend, which CSS variables to use, data flow from 
packages/services to the component. Do NOT implement yet.
```

Open the plan in your editor. Annotate anything wrong. Send it back with: **"address all notes, don't implement yet."** Repeat until every decision is resolved. The guard phrase `don't implement yet` is critical — without it, Claude skips revision and starts writing immediately.

### Phase 3 — Implement (Claude)

Only after the plan is approved:

```
Implement the approved plan. After each file, run:
- pnpm lint --filter @tac/ui
- pnpm typecheck --filter @tac/ui
Fix any errors before moving to the next file.
```

Having Claude self-verify after each file catches the cascading errors that make large implementations hard to debug.

### Phase 4 — Verify (Claude + You)

```
Run the full verification sequence:
1. pnpm build --filter @tac/ui
2. pnpm test --filter @tac/ui
3. Confirm no Tailwind color classes exist in any new file (grep check)
4. Confirm all new components are exported from packages/ui/src/index.ts
5. Confirm no business logic or fetch calls exist inside component files
Report results. Fix any failures.
```

This is your automated TAC Orbital compliance check. Bake it into a slash command (see Part 4) so you never skip it.

---

## Part 3 — Parallel Agent Workflows (Boris's 5-in-Parallel)

For larger features that decompose into independent units, TAC uses the **split-and-merge pattern** with git worktrees. This is how Boris's team ships 10–30 PRs/day.

### When to Go Parallel

Go parallel when your feature has parts that are genuinely independent — a new UI component, a new service function, and documentation can all be built simultaneously without file conflicts.

### Setup

```bash
# Each agent gets an isolated worktree — no file conflicts possible
git worktree add .worktrees/ui-component feature/component-name
git worktree add .worktrees/service-layer feature/service-name
git worktree add .worktrees/tests feature/tests-name

# Launch separate Claude Code sessions in each worktree
cd .worktrees/ui-component && claude
cd .worktrees/service-layer && claude
cd .worktrees/tests && claude
```

Each agent has a clear, isolated mandate. The UI agent builds in `packages/ui`. The service agent builds in `packages/services`. The test agent writes integration tests. No agent touches another's files.

### The Coordinator Pattern

For complex orchestration, define a coordinator agent in `.claude/agents/tac-coordinator.md`:

```markdown
---
name: tac-coordinator
description: Orchestrates multi-package features across TAC Express
tools: Read, Glob, Bash
model: claude-opus-4-6
effort: max
---

You are the TAC Express coordinator. When given a feature goal:
1. Decompose into UI (packages/ui), service (packages/services), and 
   test subtasks.
2. Verify each subtask has a clear package boundary.
3. Assign isolated worktrees to each subtask.
4. Merge results and verify no cross-package law violations.
Never write implementation code yourself — delegate to specialized agents.
```

The rule from Boris Principle #4 applies here: **keep the coordinator thin**. A coordinator that tries to know too much becomes a bottleneck. Its only job is decompose, assign, and verify boundaries.

---

## Part 4 — Slash Commands (Inner Loop Automation)

If you do something more than once a day, turn it into a slash command. Commands live in `.claude/commands/` and are checked into git, so the whole team benefits.

**`.claude/commands/new-component.md`** — Scaffold a TAC Orbital component:

```markdown
# /new-component

Scaffold a new TAC Orbital component. Arguments: <ComponentName>

Steps:
1. Create packages/ui/src/components/<ComponentName>/index.tsx
2. Create packages/ui/src/components/<ComponentName>/<ComponentName>.stories.tsx  
3. Create packages/ui/src/components/<ComponentName>/<ComponentName>.test.tsx
4. Add export to packages/ui/src/index.ts
5. Verify: no Tailwind color classes, no arbitrary values, uses CSS variables 
   from globals.css, uses shadcn primitives where applicable.
6. Run pnpm lint --filter @tac/ui and fix any errors.
```

**`.claude/commands/tac-check.md`** — TAC Orbital compliance audit:

```markdown
# /tac-check

Run a full TAC Orbital compliance audit on all staged files.

Checks:
- No Tailwind color utility classes (bg-*, text-*, border-* with scale values)
- No arbitrary Tailwind values ([...])
- No Lucide icon imports
- No business logic or fetch calls in packages/ui components
- No UI imports inside packages/services
- All new components exported from packages/ui/src/index.ts
- Border radius ≤ 0.125rem in any inline styles
- Only motion/react for animations (no framer-motion, no CSS keyframes in .tsx)

Report violations by file and line. Fix all violations before committing.
```

**`.claude/commands/pr-prep.md`** — Pre-PR checklist:

```markdown
# /pr-prep

Prepare the current branch for PR.

Steps:
1. Run /tac-check — fix all violations.
2. Run pnpm build — fix any type or build errors.
3. Run pnpm test — all tests must pass.
4. Write a commit message following conventional commits format.
5. Draft a PR description: what changed, which packages affected, 
   any new CSS variables introduced, breaking changes (if any).
```

---

## Part 5 — Hooks (Automated Enforcement)

Hooks run shell commands before or after Claude Code actions. Use them to make TAC Orbital laws physically enforced rather than advisory.

**`.claude/settings.json`:**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm exec oxlint --quiet ${file}",
            "description": "Auto-lint after every file edit"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "grep -rn 'yarn\\|npm install' <<< \"${command}\" && echo 'ERROR: Use pnpm only' && exit 1 || true",
            "description": "Block npm/yarn commands"
          }
        ]
      }
    ]
  }
}
```

The `PostToolUse` hook auto-lints after every file write. Errors surface immediately, not at the end of a 20-file implementation. The `PreToolUse` hook blocks any attempt to use `npm install` or `yarn` — it is physically impossible for Claude to violate the pnpm law.

---

## Part 6 — Subagents for TAC-Specific Roles

When a task benefits from a dedicated specialist, define a subagent in `.claude/agents/` with its own role, tool access, and model. The key benefit is isolation — each subagent works in its own context window and reports back a compressed summary, keeping your main session clean.

**`.claude/agents/tac-ui-engineer.md`:**

```markdown
---
name: tac-ui-engineer
description: Builds TAC Orbital UI components in packages/ui
tools: Read, Write, Edit, Bash, Glob
model: claude-sonnet-4-6
effort: max
---

You are a TAC Orbital UI engineer. Your jurisdiction: packages/ui ONLY.

Non-negotiable constraints:
- TailwindCSS v4 with semantic CSS variables from globals.css only
- No color utility classes, no arbitrary values
- Icons: @remixicon/react only
- Animations: motion/react only
- Border radius: 0.125rem max
- Always extend shadcn primitives — never rebuild
- No fetch calls, no business logic, no database access

After every component, run: pnpm lint --filter @tac/ui
```

**`.claude/agents/tac-service-engineer.md`:**

```markdown
---
name: tac-service-engineer
description: Builds data services and business logic in packages/services
tools: Read, Write, Edit, Bash, Glob
model: claude-sonnet-4-6
effort: max
---

You are a TAC services engineer. Your jurisdiction: packages/services ONLY.

Rules:
- Export typed service functions only
- No UI component imports ever
- All external API calls live here — never in UI components
- Type everything — no `any`
```

---

## Part 7 — CI/CD Integration

The workflow closes the loop in CI so that TAC Orbital compliance is enforced even if local checks are skipped.

**`.github/workflows/tac-check.yml`:**

```yaml
name: TAC Orbital Compliance

on: [pull_request]

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test
      - name: TAC Orbital Color Class Check
        run: |
          # Fail if any Tailwind color classes found in UI package
          if grep -rn "bg-\(red\|blue\|green\|gray\|slate\|zinc\|neutral\|stone\|orange\|amber\|yellow\|lime\|emerald\|teal\|cyan\|sky\|indigo\|violet\|purple\|fuchsia\|pink\|rose\)-[0-9]" packages/ui/src/; then
            echo "TAC VIOLATION: Tailwind color classes found in packages/ui"
            exit 1
          fi
      - name: TAC Orbital Arbitrary Value Check
        run: |
          if grep -rn "\[.*px\]\|\[.*rem\]\|\[.*%\]" packages/ui/src/; then
            echo "TAC VIOLATION: Arbitrary Tailwind values found in packages/ui"
            exit 1
          fi
      - name: Business Logic Boundary Check
        run: |
          if grep -rn "fetch\|axios\|prisma\|supabase" packages/ui/src/; then
            echo "TAC VIOLATION: Business logic found inside packages/ui"
            exit 1
          fi
```

---

## Part 8 — The Boris Principles Mapped to TAC

This table shows exactly how each of Boris's six principles translates into a concrete TAC workflow decision:

| Boris Principle | TAC Implementation |
|---|---|
| **Underfund headcount on purpose** | Before hiring a specialist, attempt the role with a scoped subagent (tac-ui-engineer, tac-service-engineer) for 2 sprints first. |
| **Unlimited tokens** | Never downgrade from Opus to Sonnet to "save money" during active development. Use `effort: max` in all subagent definitions. |
| **Build for the model 6 months from now** | Ship ambitious TAC Orbital features behind feature flags even if Claude fails at edge cases today. The next model handles it. |
| **Bet on the general model** | Keep the coordinator agent thin. No heavy orchestration scaffolding. Give the model a goal and tools, not a step-by-step script. |
| **Most capable model, always** | Claude Code default: Opus. Switch to Sonnet only for read-only exploration subagents where measured output quality is equivalent. |
| **Everyone codes** | `/new-component` and `/tac-check` slash commands are accessible to designers and PMs, not just engineers. |

---

## Part 9 — Session Startup Checklist

Run this at the start of every Claude Code session:

```
1. Are you in the correct directory? (check with `pwd`)
2. Run: git status — know your current branch
3. Run: pnpm build — confirm the baseline builds clean before you touch anything
4. State the task brief (Phase 0 template from Part 2)
5. If the task spans multiple packages, set up worktrees before starting
```

The most expensive mistake in agentic development is discovering a pre-existing build failure after 30 minutes of agent work. Always start clean.

---

## Appendix — File Structure Reference

```
tac-express/
├── CLAUDE.md                          ← Root context (~100 lines)
├── AGENTS.md                          ← Symlink or alias to CLAUDE.md
├── .claude/
│   ├── settings.json                  ← Hooks (lint, pnpm guard)
│   ├── settings.local.json            ← Gitignored personal overrides
│   ├── agents/
│   │   ├── tac-coordinator.md
│   │   ├── tac-ui-engineer.md
│   │   └── tac-service-engineer.md
│   ├── commands/
│   │   ├── new-component.md           ← /new-component
│   │   ├── tac-check.md               ← /tac-check
│   │   └── pr-prep.md                 ← /pr-prep
│   ├── rules/
│   │   └── tailwind.md                ← Path-scoped: loads on *.tsx/*.css only
│   └── skills/                        ← Shared team skills
├── packages/
│   ├── ui/
│   │   ├── CLAUDE.md                  ← Package-scoped UI context
│   │   └── src/
│   │       ├── components/            ← ALL UI components live here
│   │       ├── styles/globals.css     ← TAC Orbital CSS variables
│   │       └── index.ts               ← Public exports
│   └── services/
│       ├── CLAUDE.md                  ← Package-scoped services context
│       └── src/
└── apps/
    └── (no UI components ever)
```

---

*This workflow is a living document. Update CLAUDE.md, slash commands, and subagent definitions as models improve — Boris's Principle #3 applies to the workflow itself: build for the agent team you'll have in 6 months, not the one you have today.*
