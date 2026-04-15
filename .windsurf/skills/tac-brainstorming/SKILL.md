---
name: tac-brainstorming
description: "MANDATORY before any new feature, component, or UI work in TAC Express. Explores intent, proposes ZNG-compliant designs, and produces a spec before a single line of code is written."
---

# TAC Express — Brainstorming & Design Spec

Invoke this skill before writing any code for a new feature, component, or significant UI change. Produces a validated design spec and architecture plan aligned with ZNG design principles.

> **Do NOT write code before completing this skill.** Every task goes through design, no matter how "simple."

---

## Checklist (complete in order)

1. **Explore context** — read relevant files, check recent git log, understand existing patterns
2. **Clarify intent** — ask ONE focused question at a time (max 3 questions total)
3. **Propose 2-3 approaches** — with trade-offs, ZNG compliance, and your recommendation
4. **Present design** — in sections, get user approval after each section
5. **Check law compliance** — verify design doesn't violate any of the 12 laws
6. **Write spec** — save to `docs/specs/YYYY-MM-DD-feature-name.md`
7. **Invoke tac-tdd** — transition to test-driven implementation

---

## Process

### 1. Context Exploration

Before asking anything:
- Check `packages/ui/src/components/` — does a similar component already exist?
- Check `packages/services/` — is there a similar service?
- Read `DESIGN_SYSTEM.md` section relevant to the task
- Check `packages/ui/src/styles/globals.css` for available tokens

### 2. Intent Clarification

Ask ONE question at a time. Prefer multiple-choice. Focus on:
- What problem does this solve for the user?
- What existing patterns should it follow or break?
- Are there ZNG design constraints (glass card, bento layout, etc.)?

### 3. Design Proposal

Always propose exactly 3 approaches:

```
Approach A: [Conservative — fits existing patterns]
  - ZNG compliance: ✅ / ⚠️
  - Laws satisfied: list any concerns
  - Recommendation: [yes/no/maybe]

Approach B: [Progressive — pushes ZNG aesthetic forward]
  - ZNG compliance: ✅
  - Laws satisfied: ✅
  - Recommendation: [yes/no/maybe]

Approach C: [Minimal — fastest to ship]
  - ZNG compliance: ✅
  - Laws satisfied: ✅
  - Recommendation: [yes/no/maybe]
```

Lead with your recommended approach and explain why.

### 4. Design Sections

Present design in sections scaled to complexity:

**For a component:**
- Visual structure (layout, spacing, tokens)
- Variants (CVA shape)
- Props interface (TypeScript)
- Accessibility needs
- Animation behavior (tw-animate-css patterns)

**For a feature:**
- Architecture overview (which packages involved)
- Data flow (Component → Service → Database → Supabase)
- Component breakdown
- State management approach
- Error handling

### 5. Law Compliance Check

Before finalizing design, explicitly verify:

```
LAW 1: Colors — all from globals.css tokens? ✅/❌
LAW 2: Icons — @remixicon/react via @workspace/ui/icons? ✅/❌
LAW 3: Animation — tw-animate-css only? ✅/❌
LAW 5: Components — in packages/ui only? ✅/❌
LAW 6/7: No DB/business logic in components? ✅/❌
LAW 10/11: No raw Tailwind colors or arbitrary values? ✅/❌
```

If any LAW is ❌, revise the design before proceeding.

### 6. Spec Document

Write spec to `docs/specs/YYYY-MM-DD-[feature-name].md`:

```markdown
# [Feature Name] — Design Spec
Date: YYYY-MM-DD
Status: Approved

## Summary
One paragraph describing what and why.

## Approach
Selected approach and rationale.

## Component Breakdown
- ComponentName (packages/ui/src/components/ComponentName.tsx)
- ServiceName (packages/services/featureName.service.ts)

## Data Flow
Component → ServiceName.function() → packages/database → Supabase table

## ZNG Design Decisions
- [specific token usage decisions]
- [layout pattern used]
- [motion behavior]

## Acceptance Criteria
- [ ] criterion 1
- [ ] criterion 2
```

---

## Anti-Patterns to Reject

- "Let's just use a simple div with inline styles" → NO, use glass card tokens
- "We can use framer-motion for this animation" → NO, tw-animate-css only
- "Let me put this component in apps/web/components" → NO, packages/ui only
- "I'll add the colors directly in the className" → NO, CSS vars only
- "This is too simple to need a design" → STILL needs design, can be short

---

## Transition to Implementation

After spec approval:
> "Design approved and spec written. Invoking tac-tdd to create the implementation plan."

Invoke `tac-tdd` skill next. Do NOT start writing code directly.
