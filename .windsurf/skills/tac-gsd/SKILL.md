---
name: tac-gsd
description: "Use for planning and executing phases, milestones, and features using the GSD (Get Shit Done) workflow system. Routes to the appropriate GSD skill for planning, execution, review, or shipping."
---

# TAC Express — GSD Workflow Integration

The GSD (Get Shit Done) workflow system is installed in `.agent/skills/`. This skill bridges Windsurf Cascade with the GSD agent system.

---

## When to Use Which GSD Skill

| Goal | GSD Skill | Command |
|------|-----------|---------|
| Plan a new feature/phase | `gsd-plan-phase` | Describe what you want to build |
| Execute a planned phase | `gsd-execute-phase` | Reference the phase name/ID |
| Add a task to backlog | `gsd-add-backlog` | Describe the task |
| Review current progress | `gsd-progress` | Check status |
| UI-specific phase execution | `gsd-ui-phase` | For ZNG component work |
| Code review a phase | `gsd-code-review` | After completing a phase |
| Ship/merge a phase | `gsd-ship` | When phase is ready |
| Debug a phase issue | `gsd-debug` | When something breaks |
| Scan for issues | `gsd-scan` | Health check |

---

## Standard Feature Workflow

```
1. tac-brainstorming          ← design the feature
2. gsd-new-milestone          ← create milestone in GSD
3. gsd-plan-phase             ← break into phases/tasks
4. tac-tdd                    ← write tests first
5. gsd-execute-phase          ← implement with GSD tracking
6. tac-code-review            ← review before merge
7. gsd-ship                   ← ship and close milestone
```

---

## GSD Phase Structure

Each phase in the GSD system maps to this structure:

```
Phase: [Phase Name]
  ├── Tasks (2-5 minute units)
  │     ├── file paths
  │     ├── exact code to write
  │     └── verification steps
  ├── Tests (must pass)
  └── Acceptance criteria
```

**Rule:** Every task must have:
1. Exact file path
2. What to change/create
3. How to verify it's done

---

## Phase Quality Gate (Before `gsd-ship`)

```bash
# MUST ALL PASS:
pnpm lint --max-warnings 0
pnpm typecheck
pnpm build
pnpm test

# Architecture check:
grep -r "from '@supabase/supabase-js'" apps/    # must be empty
grep -r "from 'lucide-react'" .                  # must be empty
grep -r "framer-motion" .                         # must be empty
```

---

## GSD Manifest

The `.agent/gsd-file-manifest.json` tracks all files managed by the GSD system.

- **Read** before creating new files (avoid duplicates)
- **Never edit manually** — GSD agents manage this file
- **Check on session start** for current project state

---

## Execution Principles

1. **YAGNI** — You Aren't Gonna Need It. Build exactly what the spec says.
2. **Atomic commits** — one logical change per `git commit`
3. **TDD first** — every task starts with a failing test
4. **No skipping verifications** — every GSD task has a verify step, run it
5. **Stop on blockers** — don't guess, ask for clarification

---

## Subagent-Driven Execution

For complex phases, use GSD's subagent dispatch:

```
gsd-autonomous  ← full autonomous execution with review
gsd-fast        ← fast execution for simple tasks
gsd-manager     ← manager mode (coordinates subagents)
```

Each subagent:
- Gets fresh context (no session history)
- Gets exact task text from GSD plan
- Runs `tac-tdd` for implementation
- Reports: DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

---

## Session Management

```
Start session:    gsd-resume-work    ← loads context
End session:      gsd-pause-work     ← saves state
Progress check:   gsd-progress       ← see what's done
Next task:        gsd-next           ← what to do next
```
